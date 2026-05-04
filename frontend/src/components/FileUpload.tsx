import { useRef, useCallback } from "react";
import { Upload, FileVideo, ImageIcon, X } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm";
const EXT_RE = /\.(jpe?g|png|webp|mp4|webm)$/i;

function isAllowedFile(file: File): boolean {
  if (ACCEPT.split(",").some((t) => file.type === t.trim())) return true;
  return EXT_RE.test(file.name);
}

type FileUploadProps = {
  file: File | null;
  previewUrl: string | null;
  disabled: boolean;
  onFile: (file: File | null) => void;
  onInvalidFile: (message: string) => void;
  onSubmit: () => void;
};

export function FileUpload({
  file,
  previewUrl,
  disabled,
  onFile,
  onInvalidFile,
  onSubmit,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = file?.type.startsWith("video/") ?? false;

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f) return;
      if (!isAllowedFile(f)) {
        onInvalidFile(
          "Invalid file type. Use JPG, PNG, WebP, MP4, or WebM."
        );
        return;
      }
      onFile(f);
    },
    [onFile, onInvalidFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="glass-panel glow-border-cyan relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00d4ff]/10 blur-3xl" />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          disabled
            ? "cursor-not-allowed border-zinc-700 opacity-50"
            : "cursor-pointer border-[#00ff9c]/25 hover:border-[#00ff9c]/55 hover:shadow-[0_0_30px_rgba(0,255,156,0.12)] hover:scale-[1.01]"
        } `}
        onClick={() => !disabled && inputRef.current?.click()}
        role="presentation"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff9c]/30 bg-[#00ff9c]/10 shadow-[0_0_24px_rgba(0,255,156,0.15)]">
              <Upload className="h-7 w-7 text-[#00ff9c]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-mono text-sm text-zinc-200">
                Drop file here or click to upload
              </p>
              <p className="mt-2 font-mono text-[11px] text-zinc-500">
                IMAGES · JPG PNG WEBP · VIDEO · MP4 WEBM
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {previewUrl &&
                (isVideo ? (
                  <video
                    src={previewUrl}
                    className="mx-auto max-h-[min(55vh,420px)] w-full object-contain"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-[min(55vh,420px)] w-full object-contain"
                  />
                ))}
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onFile(null);
                }}
                className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/70 p-2 text-zinc-300 backdrop-blur-sm transition hover:border-[#ff3b3b]/50 hover:text-[#ff3b3b] disabled:opacity-40"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
              {isVideo ? (
                <FileVideo className="h-4 w-4 text-[#00d4ff]" />
              ) : (
                <ImageIcon className="h-4 w-4 text-[#00ff9c]" />
              )}
              <span className="truncate text-zinc-200">{file.name}</span>
              <span className="text-zinc-600">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={disabled || !file}
          onClick={(e) => {
            e.stopPropagation();
            onSubmit();
          }}
          className="relative overflow-hidden rounded-xl px-8 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-[#0a0a0a] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 enabled:hover:scale-[1.03] enabled:hover:shadow-[0_0_32px_rgba(0,255,156,0.45)]"
          style={{
            background:
              "linear-gradient(135deg, #00ff9c 0%, #00cc7d 50%, #00ff9c 100%)",
          }}
        >
          <span className="relative z-10">Start Analysis</span>
        </button>
      </div>
    </div>
  );
}
