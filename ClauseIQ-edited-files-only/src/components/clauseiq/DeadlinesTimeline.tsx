import { CalendarClock } from "lucide-react";
import { formatDate, todayISO } from "@/lib/clauseiq/format";
import { timelineMilestones, type DeadlineStatus } from "@/lib/clauseiq/workspace";
import type { AnalysisResult } from "@/lib/clauseiq/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<DeadlineStatus, string> = {
  upcoming: "border-info-border bg-info-bg text-info",
  "due soon": "border-contestable-border bg-contestable-bg text-contestable",
  passed: "border-border bg-secondary text-muted-foreground",
  action_needed: "border-contestable-border bg-contestable-bg text-contestable",
};

export function DeadlinesTimeline({ result }: { result: AnalysisResult }) {
  const markers = timelineMilestones(result, todayISO());
  return <div>
    <h3 className="mb-4 flex items-center gap-2 text-sm font-medium"><CalendarClock className="size-4 text-muted-foreground" />Appeal timeline</h3>
    <ol className="space-y-0">
      {markers.map((m, i) => <li key={m.label} className="relative grid grid-cols-[20px_1fr] gap-3 pb-5 last:pb-0">
        <div className="relative flex justify-center"><span className="relative z-10 mt-1 size-3 rounded-full border-2 border-card bg-primary" />{i < markers.length - 1 && <span className="absolute top-4 bottom-[-4px] w-px bg-border" />}</div>
        <div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{m.label}</p><span className={cn("rounded border px-2 py-0.5 font-mono text-[10px]", statusClasses[m.status])}>{m.status}</span></div><p className="mt-1 font-mono text-xs text-foreground">{m.date ? formatDate(m.date) : "Date needed"}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.detail}</p></div>
      </li>)}
    </ol>
  </div>;
}