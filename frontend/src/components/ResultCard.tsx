import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, ScanLine } from "lucide-react";
import type { PredictResponse } from "../lib/api";
import { confidencePercent, isFakePrediction } from "../lib/prediction";

type ResultCardProps = {
  result: PredictResponse;
  onAnalyzeAnother: () => void;
};

export function ResultCard({ result, onAnalyzeAnother }: ResultCardProps) {
  const fake = isFakePrediction(String(result.prediction ?? ""));
  const pct = confidencePercent(Number(result.confidence ?? 0));
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const r = requestAnimationFrame(() => setBarWidth(pct));
    return () => cancelAnimationFrame(r);
  }, [pct]);

  const explanation =
    typeof result.explanation === "string"
      ? result.explanation
      : "Model output did not include an explanation.";

  return (
    <div
      className={`glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-8 animate-fade-in-up ${
        fake ? "glow-border-red border-[#ff3b3b]/30" : "glow-border-green border-[#00ff9c]/30"
      } `}
    >
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl ${
          fake ? "bg-[#ff3b3b]/15" : "bg-[#00ff9c]/12"
        }`}
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
              fake
                ? "border-[#ff3b3b]/40 bg-[#ff3b3b]/10 text-[#ff3b3b]"
                : "border-[#00ff9c]/40 bg-[#00ff9c]/10 text-[#00ff9c]"
            } `}
          >
            {fake ? (
              <ShieldAlert className="h-8 w-8" strokeWidth={1.5} />
            ) : (
              <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">
              Forensic verdict
            </p>
            <h3
              className={`mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl ${
                fake ? "text-[#ff3b3b]" : "text-[#00ff9c]"
              }`}
              style={{
                textShadow: fake
                  ? "0 0 24px rgba(255,59,59,0.5)"
                  : "0 0 24px rgba(0,255,156,0.45)",
              }}
            >
              {fake ? "THREAT DETECTED" : "AUTHENTIC"}
            </h3>
            <p className="mt-2 font-mono text-xs text-zinc-500">
              Raw signal:{" "}
              <span className="text-zinc-300">{String(result.prediction)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#00d4ff]">
          <ScanLine className="h-4 w-4" strokeWidth={1.5} />
          Analysis complete
        </div>
      </div>

      <div className="relative mt-8">
        <div className="mb-2 flex items-center justify-between font-mono text-xs">
          <span className="uppercase tracking-wider text-zinc-500">
            Confidence
          </span>
          <span className={fake ? "text-[#ff3b3b]" : "text-[#00ff9c]"}>
            {pct}%
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/5">
          <div
            className={`relative h-full rounded-full transition-[width] duration-1000 ease-out ${
              fake
                ? "bg-gradient-to-r from-[#7f1d1d] to-[#ff3b3b]"
                : "bg-gradient-to-r from-[#065f46] to-[#00ff9c]"
            } `}
            style={{ width: `${barWidth}%` }}
          >
            <span className="absolute inset-0 shimmer-track opacity-40" />
          </div>
        </div>
      </div>

      <div className="relative mt-6 rounded-xl border border-white/5 bg-black/30 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          Briefing
        </p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-zinc-300">
          {explanation}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="rounded-xl border border-[#00ff9c]/35 bg-[#00ff9c]/10 px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#00ff9c] transition hover:border-[#00ff9c]/60 hover:bg-[#00ff9c]/15 hover:shadow-[0_0_24px_rgba(0,255,156,0.2)]"
        >
          Analyze another file
        </button>
      </div>
    </div>
  );
}
