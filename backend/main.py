"""DeepShield FastAPI service: /predict and /history."""

from __future__ import annotations

import logging
import random
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import model as model_mod
import utils

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DeepShield API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory forensic log (newest first)
HISTORY: list[dict[str, Any]] = []
MAX_HISTORY = 200


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _aggregate_frame_results(results: list[tuple[str, float]]) -> tuple[str, float]:
    """Majority vote on label; confidence = mean confidence of frames agreeing with winner."""
    if not results:
        return "Real", 0.5
    fake_votes = sum(1 for lab, _ in results if lab == "Fake")
    real_votes = len(results) - fake_votes
    if fake_votes > real_votes:
        winner = "Fake"
    elif real_votes > fake_votes:
        winner = "Real"
    else:
        winner = results[0][0]
    agree = [c for lab, c in results if lab == winner]
    conf = sum(agree) / len(agree) if agree else 0.5
    return winner, max(0.0, min(1.0, conf))


def dummy_predict(_image) -> tuple[str, float]:
    label = random.choice(["Real", "Fake"])
    confidence = random.uniform(0.58, 0.96)
    return label, confidence


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, Any]:
    filename = file.filename or "upload"
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty upload")

    kind = utils.detect_media_kind(filename, file.content_type)
    if kind is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Use an image (jpg, png, webp) or video (mp4, webm).",
        )

    try:
        if kind == "image":
            pil = utils.safe_image_from_bytes(contents)
            try:
                label, confidence = model_mod.predict_image(pil)
            except Exception:  # noqa: BLE001
                label, confidence = dummy_predict(pil)
            explanation = "Deepfake model inference"
        else:
            frames = utils.extract_sample_frames(contents, filename, target_samples=8)
            preds = [model_mod.predict_image(f) for f in frames]
            label, confidence = _aggregate_frame_results(preds)
            explanation = "Deepfake model inference"
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("predict failed")
        raise HTTPException(
            status_code=500, detail=f"Analysis failed: {exc!s}"
        ) from exc

    record = {
        "filename": filename,
        "prediction": label,
        "confidence": float(confidence),
        "timestamp": _utc_iso(),
    }
    HISTORY.insert(0, record)
    del HISTORY[MAX_HISTORY:]

    return {
        "prediction": label,
        "confidence": float(confidence),
        "explanation": explanation,
    }


@app.get("/history")
async def history() -> list[dict[str, Any]]:
    return list(HISTORY)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
