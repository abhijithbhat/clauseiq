import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  FileText,
  Gavel,
  Landmark,
  ListChecks,
  Quote,
  ShieldAlert,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeCase, ApiError, checkHealth, deleteCase } from "@/lib/clauseiq/api";
import { FactsEditorModal } from "./FactsEditorModal";
import { LetterPreviewModal } from "./LetterPreviewModal";
import { DeadlinesTimeline } from "./DeadlinesTimeline";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { recalculateDemo } from "@/lib/clauseiq/workspace";
import { computeDeadlines } from "@/lib/clauseiq/deadlines";
import { daysBetween, formatDate, formatINR, todayISO } from "@/lib/clauseiq/format";
import type { AnalysisResult, EditableFacts, EvidenceSource } from "@/lib/clauseiq/types";
import { confidenceLabel, OUTCOME_META, VERDICT_META } from "@/lib/clauseiq/verdict";
import { cn } from "@/lib/utils";

interface Props {
  result: AnalysisResult;
  isSample: boolean;
  backendCaseId: string | null;
  onReset: () => void;
}

const SOURCE_LABEL: Record<EvidenceSource, string> = {
  POLICY: "Policy document",
  REJECTION_LETTER: "Rejection letter",
  DISCHARGE_SUMMARY: "Discharge summary",
  REGULATION: "Statute / Regulation",
};

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{k}</dt>
      <dd className={cn("mt-1 truncate text-[13.5px] text-foreground", mono && "font-mono tabular")}>{v}</dd>
    </div>
  );
}

function RulesTab({ r }: { r: AnalysisResult }) {
  const counts = r.rules.reduce<Record<string, number>>((a, x) => ((a[x.outcome] = (a[x.outcome] ?? 0) + 1), a), {});
  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
        {(Object.keys(OUTCOME_META) as (keyof typeof OUTCOME_META)[]).map((k) => (
          <span key={k} className={cn("rounded border px-2 py-0.5 font-mono text-[10.5px] tabular", OUTCOME_META[k].className)}>
            {OUTCOME_META[k].label} · {counts[k] ?? 0}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-background text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Rule</th>
              <th className="px-3 py-2.5 font-medium">Check</th>
              <th className="px-3 py-2.5 font-medium">Outcome</th>
              <th className="px-3 py-2.5 font-medium">Statutory citation</th>
              <th className="px-5 py-2.5 font-medium">Finding</th>
            </tr>
          </thead>
          <tbody>
            {r.rules.map((x) => (
              <tr key={x.id} className="border-b border-border align-top transition-colors duration-150 ease-out last:border-0 hover:bg-background">
                <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{x.id}</td>
                <td className="px-3 py-3 font-medium text-foreground">{x.name}</td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      OUTCOME_META[x.outcome].className,
                    )}
                  >
                    {OUTCOME_META[x.outcome].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{x.citation}</td>
                <td className="px-5 py-3 text-muted-foreground">{x.finding}
                  {x.inputs && <dl className="mt-2 space-y-1 text-xs">{Object.entries(x.inputs).map(([key, value]) => <div key={key} className="flex flex-wrap gap-x-2"><dt className="font-medium">{key.replace(/_/g, " ")}</dt><dd className="break-all font-mono">{value == null ? "Not provided" : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EvidenceTab({ r }: { r: AnalysisResult }) {
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2">
      {r.evidence.map((e) => {
        const exact = e.match_score >= 1;
        return (
          <article
            key={e.id}
            className={cn(
              "flex flex-col rounded-md border border-border border-l-2 bg-card transition-colors duration-200 ease-out hover:bg-secondary/40",
              exact ? "border-l-wrongful" : "border-l-contestable",
            )}
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="eyebrow">{SOURCE_LABEL[e.source]}</p>
                <p className="mt-1 truncate text-[13px] font-medium text-foreground">{e.document_title}</p>
                <p className="text-[12px] text-muted-foreground">
                  {e.section} · Page {e.page}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]",
                  exact
                    ? "border-wrongful-border bg-wrongful-bg text-wrongful"
                    : "border-contestable-border bg-contestable-bg text-contestable",
                )}
              >
                <BadgeCheck className="size-3" />
                {exact ? "100% Verbatim Match" : `${Math.round(e.match_score * 100)}% Match · OCR`}
              </span>
            </header>
            <blockquote className="relative flex-1 px-4 py-4 font-serif text-[14px] leading-relaxed text-foreground">
              <Quote className="absolute left-4 top-4 size-3.5 text-border-strong" aria-hidden />
              <p className="pl-6">{e.quote}</p>
            </blockquote>
            <footer className="border-t border-border bg-background px-4 py-2.5 text-[12px] text-muted-foreground">
              {e.relevance}
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function DeadlinesTab({ r }: { r: AnalysisResult }) {
  const d = computeDeadlines(r.repudiation_date);
  const today = todayISO();
  const ombLeft = daysBetween(today, d.ombudsmanLastDate);

  const cards = [
    {
      icon: ShieldAlert,
      title: "Insurer grievance",
      value: "14 days",
      body: "The IRDAI grievance resolution target is 14 days from receipt. The Rule 14 no-response Ombudsman wait window is a separate 30-day period.",
      status: r.grievance_received_date ? "See timeline for dates" : "Record grievance receipt date",
    },
    {
      icon: Landmark,
      title: "Insurance Ombudsman",
      value: "1 year",
      body: `If unresolved or rejected, review Ombudsman eligibility. Indicative one-year date from repudiation: ${formatDate(d.ombudsmanLastDate)}; the applicable grievance trigger may change this. Claims up to ₹50 lakh; free of cost.`,
      status: ombLeft >= 0 ? `${ombLeft} days remaining` : "Window closed",
    },
    {
      icon: Gavel,
      title: "Consumer Commission",
      value: "2 years",
      body: "An alternative remedy under the Consumer Protection Act, 2019, within two years of the cause of action.",
      status: "Optional route",
    },
  ];

  return (
    <div className="p-5">
      <DeadlinesTimeline result={r} />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, ...c }) => (
          <div key={c.title} className="lift rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <Icon className="size-4 text-muted-foreground" />
              <span className="font-mono text-[15px] font-medium text-foreground">{c.value}</span>
            </div>
            <p className="mt-3 text-[13.5px] font-medium text-foreground">{c.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{c.body}</p>
            <p className="mt-3 border-t border-border pt-2.5 font-mono text-[11px] text-foreground">{c.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerdictWorkspace({ result, isSample, backendCaseId, onReset }: Props) {
  const [r, setResult] = useState(result);
  const [factsOpen, setFactsOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [offlineEdited, setOfflineEdited] = useState(false);
  const [revision, setRevision] = useState(0);
  const v = VERDICT_META[r.verdict];
  const rerun = async (fields: EditableFacts) => {
    const fallback = () => { setResult(recalculateDemo(r, fields)); setOfflineEdited(true); toast.info("Offline facts recalculated. Legal findings need human review."); };
    if (isSample || !backendCaseId || !(await checkHealth())) fallback();
    else {
      try {
        const updated = await analyzeCase(backendCaseId, Object.fromEntries(Object.entries(fields).map(([k, value]) => [k, String(value)])));
        setResult(updated); setOfflineEdited(false); toast.success("Analysis updated");
      } catch (e) { if (e instanceof ApiError && e.status === 0) fallback(); else throw e; }
    }
    setRevision(n => n + 1);
  };
  const [purging, setPurging] = useState(false);

  const purge = async () => {
    setPurging(true);
    try {
      if (backendCaseId) await deleteCase(backendCaseId);
      toast.success(backendCaseId ? "Case documents and results deleted" : "Local case cleared");
      onReset();
    } catch {
      toast.error("Could not purge the case on the server. Try again.");
    } finally {
      setPurging(false);
    }
  };

  const tabTrigger =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-t-md border-b-2 border-transparent px-2 -mx-2 pb-3 pt-4 text-[13px] text-muted-foreground transition-[color,border-color,background-color] duration-200 ease-out hover:bg-secondary/50 hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-secondary/40 data-[state=active]:font-medium data-[state=active]:text-foreground [&_svg]:size-4";

  return (
    <section className="mx-auto max-w-6xl animate-rise px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onReset}><ArrowLeft /> Start Over</Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setLetterOpen(true)}><FileText /> Preview &amp; Download Appeal Letter</Button>
          <Button variant="outline" size="sm" onClick={() => setFactsOpen(true)}><RefreshCw /> Edit Facts &amp; Re-run</Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} disabled={purging}><Trash2 /> Delete My Data</Button>
        </div>
      </div>

      {(isSample || offlineEdited) && (
        <div className="mb-5 rounded-md border border-contestable-border bg-contestable-bg px-4 py-3 text-[12.5px] text-contestable">
          The analysis service is offline, so this is a <strong>sample analysis</strong> — not
          based on your uploaded documents. Connect the backend to analyse your own case.
        </div>
      )}

      {/* Case header */}
      <div className="surface">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-5">
          <Field k="Case ID" v={backendCaseId ?? r.case_id} mono />
          <Field k="Claim number" v={r.claim_number} mono />
          <div className="col-span-2 min-w-0">
            <Field k="Insurer" v={r.insurer} />
          </div>
          <Field k="Claim amount" v={formatINR(r.claim_amount)} mono />
        </dl>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border bg-background px-6 py-4 md:grid-cols-5">
          <Field k="Patient" v={r.patient} />
          <Field k="Treatment" v={r.treatment} />
          <Field k="First inception" v={formatDate(r.first_inception_date)} mono />
          <Field k="Admission" v={formatDate(r.admission_date)} mono />
          <Field k="Continuous cover" v={`${r.continuous_cover_months} months`} mono />
        </div>
      </div>

      {/* Verdict + financials */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="surface p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[13px] font-semibold uppercase tracking-wider", v.className)}>
              <span className={cn("size-2 rounded-full", v.dot)} />
              {v.label}
            </span>
            {r.needs_human_review && <span className="rounded border border-contestable-border bg-contestable-bg px-2 py-1 text-xs font-medium text-contestable">Needs Human Review</span>}
            <span className="text-[13px] text-muted-foreground">{v.short}</span>
          </div>
          <p className="mt-5 text-[17px] leading-relaxed text-foreground">{r.summary}</p>
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-baseline justify-between text-[12.5px]">
              <span className="font-medium text-foreground tabular">
                {r.confidence}% Confidence — {confidenceLabel(r.confidence)}
              </span>
              <span className="text-muted-foreground">Cited: {r.cited_clause.split(" — ")[0]}</span>
            </div>
            <div className="animate-fill mt-2.5 flex gap-1" aria-hidden>
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("h-2 flex-1 rounded-[2px]", i < Math.round(r.confidence / 5) ? v.dot : "bg-secondary")}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="surface flex flex-col">
          <div className="border-b border-border px-6 py-4">
            <p className="eyebrow">Financial summary</p>
          </div>
          <dl className="grid flex-1 grid-cols-3 divide-x divide-border">
            {[
              { k: "Claimed", v: r.claim_amount, cls: "text-foreground" },
              { k: "Settled", v: r.settled_amount, cls: "text-muted-foreground" },
              { k: "Disallowed", v: r.disallowed_amount, cls: "text-destructive" },
            ].map((x) => (
              <div key={x.k} className="flex flex-col justify-center px-4 py-5">
                <dt className="text-[11.5px] text-muted-foreground">{x.k}</dt>
                <dd className={cn("mt-1 font-mono text-[17px] font-medium tabular sm:text-[19px]", x.cls)}>{formatINR(x.v)}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border bg-background px-6 py-3 text-[12px] text-muted-foreground tabular">
            Sum insured {formatINR(r.sum_insured)} · Repudiated {formatDate(r.repudiation_date)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="rules" className="surface mt-5 overflow-hidden">
        <Tabs.List className="flex gap-6 overflow-x-auto border-b border-border px-5">
          <Tabs.Trigger value="rules" className={tabTrigger}>
            <ListChecks /> Rules Evaluation
          </Tabs.Trigger>
          <Tabs.Trigger value="evidence" className={tabTrigger}>
            <BadgeCheck /> Verified Evidence
          </Tabs.Trigger>
          <Tabs.Trigger value="deadlines" className={tabTrigger}>
            <CalendarClock /> Deadlines &amp; Ombudsman
          </Tabs.Trigger>
          <Tabs.Trigger value="letter" className={tabTrigger}>
            <FileText /> Appeal Letter
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="rules"><RulesTab r={r} /></Tabs.Content>
        <Tabs.Content value="evidence"><EvidenceTab r={r} /></Tabs.Content>
        <Tabs.Content value="deadlines"><DeadlinesTab r={r} /></Tabs.Content>
        <Tabs.Content value="letter"><div className="p-5"><Button onClick={() => setLetterOpen(true)}><FileText /> Preview &amp; Download Appeal Letter</Button></div></Tabs.Content>
      </Tabs.Root>
      <FactsEditorModal key={`facts-${revision}`} result={r} open={factsOpen} onOpenChange={setFactsOpen} onReRun={rerun} />
      <LetterPreviewModal key={`letter-${revision}`} initialVersion={revision + 1} result={r} open={letterOpen} onOpenChange={setLetterOpen} />
      <Dialog open={deleteOpen} onOpenChange={next => { if (!purging) setDeleteOpen(next); }}>
        <DialogContent className="w-[calc(100%-2rem)] bg-card">
          <DialogHeader><DialogTitle>Delete My Data?</DialogTitle><DialogDescription>This permanently deletes this case's uploaded documents and analysis results. This cannot be undone.</DialogDescription></DialogHeader>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={purging} onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" disabled={purging} onClick={purge}><Trash2 />{purging ? "Deleting…" : "Confirm Delete"}</Button></div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
