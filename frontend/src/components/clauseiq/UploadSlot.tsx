import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

interface Props {
  index: number;
  label: string;
  required: boolean;
  hint: string;
  accept: string[]; // mime types
  file: File | undefined;
  onChange: (f: File | undefined) => void;
}

function formatSize(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function validateUpload(file: File, accept: string[]): string | null {
  if (!accept.includes(file.type)) return "Unsupported file type.";
  if (file.size > MAX_UPLOAD_BYTES) return "File exceeds the 10 MB limit.";
  return null;
}

export function UploadSlot({ index, label, required, hint, accept, file, onChange }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (f: File | undefined) => {
    if (!f) return;
    const err = validateUpload(f, accept);
    setError(err);
    if (!err) onChange(f);
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          <span className="mr-1.5 font-mono text-subtle-foreground">0{index}</span>
          {label}
        </label>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-wider",
            required ? "text-foreground" : "text-subtle-foreground",
          )}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>
      {file ? (
        <div className="surface animate-rise flex min-h-[132px] flex-col justify-between rounded-md border-wrongful-border bg-wrongful-bg/60 p-4">
          <div className="flex items-start gap-3">
            <span
              className="animate-pop flex size-7 shrink-0 items-center justify-center rounded-full border border-wrongful-border bg-card"
              aria-hidden
            >
              <FileText className="size-3.5 text-wrongful" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{file.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground tabular">
                {formatSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                if (input.current) input.current.value = "";
              }}
              className="press rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground"
              aria-label={`Remove ${label}`}
            >
              <X className="size-4" />
            </button>
          </div>
          <p
            className="animate-pop flex items-center gap-1.5 text-[11px] text-wrongful"
            style={{ animationDelay: "110ms" }}
          >
            <CheckCircle2 className="size-3.5" /> Ready for analysis
          </p>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            take(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-center transition-colors duration-200 ease-out",
            drag
              ? "border-foreground bg-secondary/70"
              : "border-border-strong bg-background hover:border-subtle-foreground hover:bg-secondary/60",
          )}
        >
          <UploadCloud className="size-5 text-muted-foreground" />
          <span className="text-[13px] text-foreground">
            Drop file or <span className="underline underline-offset-2">browse</span>
          </span>
          <span className="font-mono text-[11px] text-subtle-foreground">{hint}</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        className="sr-only"
        accept={accept.join(",")}
        aria-label={label}
        onChange={(e) => take(e.target.files?.[0])}
      />
      {error && <p className="mt-1.5 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
