/** Normalize backend prediction to fake vs real */
export function isFakePrediction(prediction: string): boolean {
  const p = prediction.trim().toLowerCase();
  return (
    p === "fake" ||
    p === "deepfake" ||
    p === "synthetic" ||
    p === "spoof" ||
    p === "false" ||
    p.includes("fake")
  );
}

/** Confidence as 0–100 for display */
export function confidencePercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value <= 1 && value >= 0) return Math.round(value * 100);
  return Math.min(100, Math.max(0, Math.round(value)));
}
