import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";

const MESSAGES = [
  "Scanning media...",
  "Running forensic checks...",
] as const;

export function Loader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="glass-panel glow-border-cyan relative overflow-hidden rounded-2xl p-10 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 animate-scan-flicker bg-[linear-gradient(180deg,transparent,rgba(0,212,255,0.04),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#00d4ff]/20 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/10 shadow-[0_0_30px_rgba(0,212,255,0.25)]">
            <Cpu className="h-8 w-8 animate-pulse-glow text-[#00d4ff]" strokeWidth={1.5} />
          </div>
          <div
            className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#00ff9c]/60 animate-spin"
            style={{ animationDuration: "2.8s" }}
            aria-hidden
          />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
            Analysis in progress
          </p>
          <p className="mt-3 font-mono text-sm text-[#00ff9c] animate-pulse-glow">
            {MESSAGES[msgIndex]}
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="loader-shimmer h-full w-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#00ff9c] to-[#00d4ff] bg-[length:200%_100%]" />
        </div>
      </div>
      <style>{`
        @keyframes loader-shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .loader-shimmer {
          animation: loader-shimmer-move 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
