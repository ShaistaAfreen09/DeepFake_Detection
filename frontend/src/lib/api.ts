export const API_BASE = "https://deepfake-detection-spwc.onrender.com";

export type PredictResponse = {
  prediction: string;
  confidence: number;
  explanation?: string;
  [key: string]: unknown;
};

export type HistoryItem = {
  filename: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  [key: string]: unknown;
};

export async function predictMedia(file: File): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText || "Request failed";
    try {
      const j = JSON.parse(text) as { detail?: unknown };
      if (j.detail !== undefined) {
        message = Array.isArray(j.detail)
          ? j.detail
              .map((d: unknown) =>
                typeof d === "object" && d !== null && "msg" in d
                  ? String((d as { msg: string }).msg)
                  : JSON.stringify(d)
              )
              .join("; ")
          : String(j.detail);
      }
    } catch {
      /* keep message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<PredictResponse>;
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText || "Request failed";
    try {
      const j = JSON.parse(text) as { detail?: unknown };
      if (j.detail !== undefined) {
        message = Array.isArray(j.detail)
          ? j.detail
              .map((d: unknown) =>
                typeof d === "object" && d !== null && "msg" in d
                  ? String((d as { msg: string }).msg)
                  : JSON.stringify(d)
              )
              .join("; ")
          : String(j.detail);
      }
    } catch {
      /* keep message */
    }
    throw new Error(message);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
