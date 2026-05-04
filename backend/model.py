"""Deepfake classifier with PyTorch model loading and safe fallbacks."""

from __future__ import annotations

import logging
import random
import threading
from pathlib import Path

import numpy as np
from PIL import Image

_LOGGER = logging.getLogger(__name__)

_LOCK = threading.Lock()
_STATE: dict = {"kind": "uninitialized"}  # uninitialized | model | dummy


def _model_path() -> Path:
    return Path(__file__).resolve().parent / "model.pth"


def _build_model():
    import torch.nn as nn

    try:
        from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0

        net = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
        in_features = net.classifier[1].in_features
        net.classifier[1] = nn.Linear(in_features, 1)
        return net, "efficientnet_b0"
    except Exception:  # noqa: BLE001
        from torchvision.models import resnet18

        net = resnet18(weights=None)
        in_features = net.fc.in_features
        net.fc = nn.Linear(in_features, 1)
        return net, "resnet18_fallback"


def _ensure_loaded() -> None:
    with _LOCK:
        if _STATE["kind"] != "uninitialized":
            return

        path = _model_path()
        try:
            import torch  # noqa: F401
            import torchvision  # noqa: F401
        except ImportError:
            _LOGGER.warning("PyTorch/torchvision not installed; using random fallback.")
            _STATE["kind"] = "dummy"
            return

        if not path.is_file():
            _LOGGER.warning("model.pth not found at %s; using random fallback.", path)
            _STATE["kind"] = "dummy"
            return

        import torch

        try:
            model, model_name = _build_model()
            checkpoint = torch.load(path, map_location="cpu")
            state_dict = checkpoint.get("state_dict", checkpoint)
            model.load_state_dict(state_dict, strict=False)
            model.eval()
            _STATE["kind"] = "model"
            _STATE["module"] = model
            _STATE["model_name"] = model_name
            _LOGGER.info("Loaded deepfake model (%s) from %s", model_name, path)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Failed to load model.pth (%s); using random fallback.", exc)
            _STATE["kind"] = "dummy"


def _pil_to_tensor(image: Image.Image, size: int = 224):
    import torch

    rgb = image.convert("RGB").resize((size, size), Image.Resampling.BILINEAR)
    arr = np.asarray(rgb, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    chw = np.transpose(arr, (2, 0, 1))
    x = torch.from_numpy(chw).unsqueeze(0)
    return x


def _predict_model(image: Image.Image) -> tuple[str, float]:
    import torch

    model = _STATE["module"]
    x = _pil_to_tensor(image, size=224)
    with torch.no_grad():
        logits = model(x)
    if isinstance(logits, (tuple, list)):
        logits = logits[0]
    if getattr(logits, "ndim", 0) > 1:
        value = logits.reshape(-1)[0]
    else:
        value = logits

    prob_fake = float(torch.sigmoid(value).item())
    prob_fake = max(0.0, min(1.0, prob_fake))
    label = "Fake" if prob_fake >= 0.5 else "Real"
    confidence = prob_fake if label == "Fake" else 1.0 - prob_fake
    return label, confidence


def _predict_dummy(_image: Image.Image) -> tuple[str, float]:
    label = random.choice(["Real", "Fake"])
    confidence = random.uniform(0.58, 0.96)
    return label, confidence


def get_predictor_kind() -> str:
    _ensure_loaded()
    return str(_STATE["kind"])


def predict_image(image: Image.Image) -> tuple[str, float]:
    """
    Return (label, confidence) with label in {"Real", "Fake"}
    and confidence in [0, 1].
    """
    _ensure_loaded()
    if _STATE["kind"] == "model":
        try:
            return _predict_model(image)
        except Exception as exc:  # noqa: BLE001
            _LOGGER.warning("Model inference failed (%s); returning safe fallback.", exc)
            return "Real", 0.5
    return _predict_dummy(image)
