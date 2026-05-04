import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar, type NavTab } from "./components/Navbar";
import { FileUpload } from "./components/FileUpload";
import { Loader } from "./components/Loader";
import { ResultCard } from "./components/ResultCard";
import { HistoryTable } from "./components/HistoryTable";
import { Toast, type ToastPayload } from "./components/Toast";
import {
  fetchHistory,
  predictMedia,
  type HistoryItem,
  type PredictResponse,
} from "./lib/api";

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("analyze");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const previewRef = useRef<string | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const showError = useCallback((detail?: string) => {
    setToast({
      title: "SYSTEM ERROR",
      detail: detail ?? "FAILED TO ANALYZE FILE",
    });
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const rows = await fetchHistory();
      setHistory(rows);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to load forensic history.";
      setHistoryError(msg);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleTabChange = useCallback(
    (tab: NavTab) => {
      setActiveTab(tab);
      if (tab === "history") void loadHistory();
    },
    [loadHistory]
  );

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
    };
  }, []);

  const handleFileChange = useCallback((next: File | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    if (next) {
      const url = URL.createObjectURL(next);
      previewRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    setFile(next);
    setResult(null);
  }, []);

  const handleInvalidFile = useCallback(
    (message: string) => {
      showError(message);
    },
    [showError]
  );

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await predictMedia(file);
      setResult(data);
      await loadHistory();
    } catch (e) {
      const detail =
        e instanceof Error
          ? e.message
          : "FAILED TO ANALYZE FILE — network or server fault.";
      showError(detail);
    } finally {
      setLoading(false);
    }
  }, [file, loadHistory, showError]);

  const handleAnalyzeAnother = useCallback(() => {
    handleFileChange(null);
    setResult(null);
  }, [handleFileChange]);

  const busy = loading;

  return (
    <div className="cyber-bg text-zinc-100">
      <Navbar active={activeTab} onChange={handleTabChange} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {activeTab === "analyze" ? (
          <div key="analyze" className="tab-content-enter space-y-10">
            <section className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#00d4ff]/90">
                Operations Console
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Analyze Digital Media
              </h2>
              <p className="mx-auto mt-3 max-w-xl font-mono text-sm text-zinc-500">
                Detect synthetic manipulation in real time
              </p>
            </section>

            <FileUpload
              file={file}
              previewUrl={previewUrl}
              disabled={busy}
              onFile={handleFileChange}
              onInvalidFile={handleInvalidFile}
              onSubmit={handleSubmit}
            />

            {busy && <Loader />}

            {!busy && result && (
              <ResultCard result={result} onAnalyzeAnother={handleAnalyzeAnother} />
            )}
          </div>
        ) : (
          <div key="history" className="tab-content-enter space-y-8">
            <section>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600">
                Intelligence
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Forensic History
              </h2>
              <p className="mt-2 max-w-2xl font-mono text-sm text-zinc-500">
                Recent classifications from your secure analysis node.
              </p>
            </section>

            <HistoryTable
              items={history}
              loading={historyLoading}
              error={historyError}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600">
          DeepShield · Powered by AI · Local forensic engine
        </p>
      </footer>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
