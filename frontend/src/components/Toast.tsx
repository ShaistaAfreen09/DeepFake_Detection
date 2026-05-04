import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastPayload = {
  title: string;
  detail?: string;
};

type ToastProps = {
  toast: ToastPayload | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ toast, onDismiss, durationMs = 7000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [toast, durationMs, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className="animate-fade-in-up fixed bottom-6 left-4 right-4 z-[100] mx-auto max-w-md sm:left-auto sm:right-6"
      role="alert"
    >
      <div className="glow-border-red glass-panel flex gap-3 rounded-xl border border-[#ff3b3b]/40 p-4 shadow-[0_0_40px_rgba(255,59,59,0.2)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff3b3b]/15">
          <AlertTriangle className="h-5 w-5 text-[#ff3b3b]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3b3b]">
            {toast.title}
          </p>
          {toast.detail && (
            <p className="mt-1 font-mono text-sm leading-snug text-zinc-300">
              {toast.detail}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
