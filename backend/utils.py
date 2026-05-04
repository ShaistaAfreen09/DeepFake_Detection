"""Media helpers: type detection, safe image loading, sampled video frames."""

from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError

MediaKind = Literal["image", "video"]

IMAGE_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp", ".bmp"})
VIDEO_EXTENSIONS = frozenset({".mp4", ".webm", ".avi", ".mov", ".mkv"})


def detect_media_kind(
    filename: str | None, content_type: str | None
) -> MediaKind | None:
    """Classify upload as image or video from extension and/or MIME type."""
    name = (filename or "").lower()
    ext = Path(name).suffix
    ct = (content_type or "").lower().split(";")[0].strip()

    if ct.startswith("image/") or ext in IMAGE_EXTENSIONS:
        return "image"
    if ct.startswith("video/") or ext in VIDEO_EXTENSIONS:
        return "video"
    return None


def pil_image_from_bytes(contents: bytes) -> Image.Image:
    """Open image bytes as RGB PIL Image; raises ValueError if not decodable."""
    if not contents:
        raise ValueError("Empty file")
    try:
        img = Image.open(io.BytesIO(contents))
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ValueError("Could not decode image") from exc


def _bgr_array_to_pil(bgr: np.ndarray) -> Image.Image:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def pil_from_bytes_opencv_fallback(contents: bytes) -> Image.Image:
    """Decode image via OpenCV if PIL fails (robust for odd encodings)."""
    buf = np.frombuffer(contents, dtype=np.uint8)
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Could not decode image with OpenCV")
    return _bgr_array_to_pil(bgr)


def safe_image_from_bytes(contents: bytes) -> Image.Image:
    """Prefer PIL; fall back to OpenCV imdecode."""
    try:
        return pil_image_from_bytes(contents)
    except ValueError:
        return pil_from_bytes_opencv_fallback(contents)


def extract_sample_frames(
    contents: bytes,
    filename: str | None,
    *,
    target_samples: int = 8,
) -> list[Image.Image]:
    """
    Write video bytes to a temp file, sample evenly spaced frames with OpenCV,
    return RGB PIL images.
    """
    if not contents:
        raise ValueError("Empty file")

    suffix = Path(filename or "clip.mp4").suffix.lower()
    if suffix not in VIDEO_EXTENSIONS:
        suffix = ".mp4"

    tmp_path: str | None = None
    cap: cv2.VideoCapture | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Could not open video (unsupported or corrupt)")

        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total <= 0:
            # Some containers report 0; read sequentially until enough frames
            frames_bgr: list[np.ndarray] = []
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            while len(frames_bgr) < target_samples * 4:
                ok, frame = cap.read()
                if not ok or frame is None:
                    break
                frames_bgr.append(frame)
            if not frames_bgr:
                raise ValueError("Video contains no readable frames")
            step = max(1, len(frames_bgr) // target_samples)
            picked = frames_bgr[::step][:target_samples]
            return [_bgr_array_to_pil(f) for f in picked]

        n = min(target_samples, total)
        indices = (
            [int(i * (total - 1) / max(n - 1, 1)) for i in range(n)]
            if n > 1
            else [0]
        )
        out: list[Image.Image] = []
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ok, frame = cap.read()
            if ok and frame is not None:
                out.append(_bgr_array_to_pil(frame))
        if not out:
            raise ValueError("Could not read sampled video frames")
        return out
    finally:
        if cap is not None:
            cap.release()
        if tmp_path and os.path.isfile(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
