import { AlertTriangle, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PIPELINE_STAGES } from "@/lib/clauseiq/stages";
import type { StageStatus } from "@/lib/clauseiq/types";
import { cn } from "@/lib/utils";

interface Props {
  stages: StageStatus[];
  error: { message: string; rateLimited: boolean } | null;
  onRetry: () => void;
  onCancel: () => void;
  label: string;
}

export function ProcessingTracker({ stages, error, onRetry, onCancel, label }: Props) {
  const done = stages.filter((s) => s === "done").length;
  const pct = Math.round((done / stages.length) * 100);
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="surface animate-rise overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <p className="eyebrow">{label}</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h1 className="text-[20px] font-semibold text-foreground">
              {error ? "Analysis paused" : pct === 100 ? "Analysis complete" : "Analysing your claim"}
            </h1>
            <span className="font-mono text-[13px] text-muted-foreground tabular">{pct}%</span>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                error ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          </div>
        </div>
        <ol className="px-6 py-3">
          {PIPELINE_STAGES.map((s, i) => {
            const st = stages[i];
            return (
              <li
                key={s.title}
                className={cn(
                  "relative flex gap-4 border-l-2 py-3 transition-colors duration-300 ease-out",
                  st === "running" ? "border-l-foreground" : "border-l-transparent",
                )}
              >
                {i < PIPELINE_STAGES.length - 1 && (
                  <span
                    className="absolute left-[13px] top-[38px] h-[calc(100%-26px)] w-px overflow-hidden bg-border"
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "block h-full w-full origin-top bg-wrongful-border transition-transform duration-500 ease-out",
                        st === "done" ? "scale-y-100" : "scale-y-0",
                      )}
                    />
                  </span>
                )}
                <span
                  className={cn(
                    "relative flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] transition-colors duration-300 ease-out",
                    st === "pending" && "border-border bg-card text-subtle-foreground",
                    st === "running" && "border-foreground bg-card text-foreground",
                    st === "done" && "border-wrongful-border bg-wrongful-bg text-wrongful",
                    st === "failed" && "border-destructive-border bg-destructive-bg text-destructive",
                  )}
                >
                  {st === "running" && (
                    <span
                      className="animate-pulse-ring absolute inset-0 rounded-full border border-foreground"
                      aria-hidden
                    />
                  )}
                  {st === "running" && <Loader2 className="size-3.5 animate-spin" />}
                  {st === "done" && <Check className="size-3.5" />}
                  {st === "failed" && <AlertTriangle className="size-3.5" />}
                  {st === "pending" && i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={cn(
                        "text-[14px] font-medium",
                        st === "pending" ? "text-subtle-foreground" : "text-foreground",
                      )}
                    >
                      {s.title}
                    </p>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider",
                        st === "done" && "text-wrongful",
                        st === "running" && "text-foreground",
                        st === "failed" && "text-destructive",
                        st === "pending" && "text-subtle-foreground",
                      )}
                    >
                      {st === "running" && <span className="size-1.5 animate-status rounded-full bg-wrongful-accent" aria-hidden />}
                      {st === "running" ? "Running" : st === "done" ? "Done" : st === "failed" ? "Failed" : "Queued"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{s.detail}</p>
                  {st === "failed" && error && (
                    <div className="mt-3 rounded-md border border-destructive-border bg-destructive-bg p-3">
                      <p className="text-[12.5px] text-destructive">{error.message}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={onRetry}>
                          <RotateCcw /> Retry Stage
                        </Button>
                        <Button size="sm" variant="outline" onClick={onCancel}>
                          Back to start
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {!error && (
          <div className="flex items-center justify-between border-t border-border bg-background px-6 py-3">
            <span className="text-[11px] text-subtle-foreground">
              Deterministic rules · no generative verdicts
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="text-[12px] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
