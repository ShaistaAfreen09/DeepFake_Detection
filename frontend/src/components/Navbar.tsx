import { Activity, History } from "lucide-react";

export type NavTab = "analyze" | "history";

type NavbarProps = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
};

export function Navbar({ active, onChange }: NavbarProps) {
  const tabs: { id: NavTab; label: string; icon: typeof Activity }[] = [
    { id: "analyze", label: "Analyze", icon: Activity },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#00ff9c] shadow-[0_0_12px_#00ff9c]" />
              <h1 className="font-mono text-lg font-semibold tracking-tight text-white sm:text-xl">
                DeepShield{" "}
                <span className="bg-gradient-to-r from-[#00ff9c] to-[#00d4ff] bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Real-Time Deepfake Threat Detection
            </p>
          </div>
          <p className="hidden font-mono text-[10px] text-zinc-600 sm:block">
            SECURE CHANNEL · LOCAL NODE
          </p>
        </div>

        <nav className="flex gap-1" aria-label="Primary">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={`group relative flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-sm transition-all duration-200 sm:px-5 ${
                  isActive
                    ? "text-[#00ff9c]"
                    : "text-zinc-500 hover:text-zinc-300"
                } `}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                  strokeWidth={1.75}
                />
                {label}
                {isActive && (
                  <>
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#00ff9c] to-transparent shadow-[0_0_12px_#00ff9c]"
                      aria-hidden
                    />
                    <span
                      className="absolute inset-0 -z-10 rounded-lg bg-[#00ff9c]/[0.08] shadow-[inset_0_0_20px_rgba(0,255,156,0.06)]"
                      aria-hidden
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
