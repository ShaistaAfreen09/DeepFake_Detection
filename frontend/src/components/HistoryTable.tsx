import { Clock, FileWarning, Fingerprint, Loader2 } from "lucide-react";
import type { HistoryItem } from "../lib/api";
import { confidencePercent, isFakePrediction } from "../lib/prediction";

function formatTime(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function HistorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="glass-panel animate-pulse rounded-xl border border-white/5 p-5"
        >
          <div className="h-4 w-3/4 rounded bg-zinc-800" />
          <div className="mt-4 h-3 w-1/2 rounded bg-zinc-800/80" />
          <div className="mt-3 h-3 w-full rounded bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}

type HistoryTableProps = {
  items: HistoryItem[];
  loading: boolean;
  error: string | null;
};

/** Cyber dashboard card grid (not a plain HTML table). */
export function HistoryTable({ items, loading, error }: HistoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#00d4ff]" />
          Loading threat intelligence feed...
        </div>
        <HistorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel glow-border-red rounded-2xl border border-[#ff3b3b]/25 p-8 text-center font-mono text-sm text-[#ff3b3b]">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-panel glow-border-cyan rounded-2xl border border-[#00d4ff]/20 p-12 text-center">
        <Fingerprint className="mx-auto h-12 w-12 text-zinc-600" strokeWidth={1} />
        <p className="mt-4 font-mono text-sm text-zinc-400">
          No forensic records yet.
        </p>
        <p className="mt-2 font-mono text-xs text-zinc-600">
          Run an analysis to populate this dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((row, idx) => {
        const fake = isFakePrediction(String(row.prediction ?? ""));
        const pct = confidencePercent(Number(row.confidence ?? 0));
        return (
          <article
            key={`${row.filename}-${row.timestamp}-${idx}`}
            className={`glass-panel group relative overflow-hidden rounded-xl border p-5 transition duration-300 hover:scale-[1.02] ${
              fake
                ? "border-[#ff3b3b]/25 hover:shadow-[0_0_28px_rgba(255,59,59,0.12)]"
                : "border-[#00ff9c]/20 hover:shadow-[0_0_28px_rgba(0,255,156,0.1)]"
            } `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-medium text-zinc-100">
                  {row.filename}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      fake
                        ? "bg-[#ff3b3b]/15 text-[#ff3b3b]"
                        : "bg-[#00ff9c]/15 text-[#00ff9c]"
                    } `}
                  >
                    {fake ? "fake" : "real"}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    {pct}% conf.
                  </span>
                </div>
              </div>
              <FileWarning
                className={`h-5 w-5 shrink-0 opacity-60 transition group-hover:opacity-100 ${
                  fake ? "text-[#ff3b3b]" : "text-[#00ff9c]"
                }`}
                strokeWidth={1.5}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 font-mono text-[11px] text-zinc-500">
              <Clock className="h-3.5 w-3.5 text-[#00d4ff]" />
              {formatTime(String(row.timestamp))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
