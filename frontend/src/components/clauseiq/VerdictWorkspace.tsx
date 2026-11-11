import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Copy,
  FileDown,
  FileText,
  Gavel,
  Landmark,
  ListChecks,
  Quote,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteCase } from "@/lib/clauseiq/api";
import { computeDeadlines, GRIEVANCE_TAT_DAYS } from "@/lib/clauseiq/deadlines";
import {
  daysBetween,
  formatDate,
  formatOptionalDate,
  formatOptionalINR,
  isValidISODate,
  todayISO,
} from "@/lib/clauseiq/format";
import {
  buildAppealLetter,
  downloadLetterDocx,
  downloadLetterPdf,
  letterToPlainText,
} from "@/lib/clauseiq/letter";
import type { AnalysisResult, EvidenceSource } from "@/lib/clauseiq/types";
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
  DISCHARGE: "Discharge summary",
  DISCHARGE_SUMMARY: "Discharge summary",
  OTHER: "Supporting document",
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
            {r.rules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-[13px] text-muted-foreground">
                  No deterministic rule checks were returned for this case.
                </td>
              </tr>
            ) : (
              r.rules.map((x) => (
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
                  <td className="px-5 py-3 text-muted-foreground">{x.finding}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EvidenceTab({ r }: { r: AnalysisResult }) {
  if (r.evidence.length === 0) {
    return (
      <div className="p-8 text-center text-[13px] text-muted-foreground">
        No verified document quotes were available for this case.
      </div>
    );
  }
  return (
    <div className="grid gap-4 p-5 md:grid-cols-2">
      {r.evidence.map((e) => {
        const unverified = e.verified === false;
        const exact = !unverified && e.match_score >= 1;
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
                <p className="eyebrow">{SOURCE_LABEL[e.source] ?? "Supporting document"}</p>
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
                {unverified
                  ? "Unverified quote"
                  : exact
                    ? "100% Verbatim Match"
                    : `${Math.round(e.match_score * 100)}% Match · OCR`}
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
  if (!isValidISODate(r.repudiation_date)) {
    return (
      <div className="space-y-4 p-5">
        <div className="rounded-md border border-border bg-background p-5 text-[13px] text-muted-foreground">
          The rejection / repudiation date was not extracted from your documents, so statutory
          30-day grievance and 1-year Insurance Ombudsman timeline dates could not be computed.
        </div>
        {r.backend_deadlines && r.backend_deadlines.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {r.backend_deadlines.map((dl) => (
              <div key={`${dl.kind}-${dl.due_date}`} className="rounded-md border border-border p-4">
                <p className="eyebrow">{dl.kind.replace(/_/g, " ")}</p>
                <p className="mt-1 font-mono text-[14px] text-foreground">
                  {formatOptionalDate(dl.due_date, dl.due_date)}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{dl.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  const d = computeDeadlines(r.repudiation_date);
  const today = todayISO();
  const span = Math.max(1, daysBetween(d.repudiation, d.ombudsmanLastDate));
  const elapsed = Math.min(Math.max(daysBetween(d.repudiation, today), 0), span);
  const grievanceLeft = daysBetween(today, d.grievanceResponseDue);
  const ombLeft = daysBetween(today, d.ombudsmanLastDate);
  const pos = (iso: string) => `${(daysBetween(d.repudiation, iso) / span) * 100}%`;

  const cards = [
    {
      icon: ShieldAlert,
      title: "Insurer grievance",
      value: `${GRIEVANCE_TAT_DAYS} days`,
      body: `File with the Grievance Redressal Officer now. The insurer must resolve within ${GRIEVANCE_TAT_DAYS} days; if filed today, a response is due by ${formatDate(addTodayDays(GRIEVANCE_TAT_DAYS))}.`,
      status: grievanceLeft >= 0 ? `${grievanceLeft} days left in first window` : "File immediately",
    },
    {
      icon: Landmark,
      title: "Insurance Ombudsman",
      value: "1 year",
      body: `If unresolved or rejected, complain to the Ombudsman within one year of repudiation — last date ${formatDate(d.ombudsmanLastDate)}. Claims up to ₹50 lakh; free of cost.`,
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
      <div className="rounded-md border border-border bg-background p-5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-medium text-foreground">Appeal window</span>
          <span className="font-mono text-muted-foreground tabular">
            Day {elapsed} of {span}
          </span>
        </div>
        <div className="relative mt-14 h-1.5 rounded-full bg-secondary">
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${(elapsed / span) * 100}%` }} />
          {[
            { iso: d.repudiation, label: "Repudiated", date: formatDate(d.repudiation), align: "left" },
            { iso: d.grievanceResponseDue, label: "30-day TAT", date: formatDate(d.grievanceResponseDue), align: "center" },
            { iso: d.ombudsmanLastDate, label: "Ombudsman limit", date: formatDate(d.ombudsmanLastDate), align: "right" },
          ].map((m) => (
            <div
              key={m.label}
              className={cn(
                "absolute top-1/2 flex flex-col",
                m.align === "left" && "items-start",
                m.align === "center" && "-translate-x-1/2 items-center",
                m.align === "right" && "-translate-x-full items-end",
              )}
              style={{ left: pos(m.iso) }}
            >
              <span className="-mt-[5px] size-2.5 rounded-full border-2 border-card bg-foreground" />
              <span
                className={cn(
                  "flex flex-col whitespace-nowrap",
                  m.align === "center" ? "absolute bottom-full mb-3 items-center" : "mt-2",
                  m.align === "right" && "items-end",
                )}
              >
                <span className="text-[11px] font-medium text-foreground">{m.label}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{m.date}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="h-12" />
      </div>
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

function addTodayDays(n: number) {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

function LetterTab({ r }: { r: AnalysisResult }) {
  const blocks = useMemo(() => buildAppealLetter(r), [r]);
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const claimSlug = (
    r.claim_number && r.claim_number !== "Not stated" ? r.claim_number : r.case_id
  ).replace(/[^A-Za-z0-9]+/g, "-");
  const base = `ClauseIQ_Appeal_${claimSlug}`;
  const insurerLabel = r.insurer && r.insurer !== "Not stated" ? r.insurer : "the insurer";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letterToPlainText(blocks));
      toast.success("Letter copied to clipboard");
    } catch {
      toast.error("Could not access the clipboard");
    }
  };
  const dl = async (kind: "pdf" | "docx") => {
    setBusy(kind);
    try {
      if (kind === "pdf") await downloadLetterPdf(blocks, `${base}.pdf`);
      else await downloadLetterDocx(blocks, `${base}.docx`);
    } catch {
      toast.error("Download failed — please try again");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[12.5px] text-muted-foreground">
          Addressed to the Grievance Redressal Officer of {insurerLabel}. Review every statement and
          attach supporting documents before sending.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy /> Copy Letter
          </Button>
          <Button variant="outline" size="sm" onClick={() => dl("docx")} disabled={busy !== null}>
            <FileText /> {busy === "docx" ? "Preparing…" : "Download DOCX"}
          </Button>
          <Button size="sm" onClick={() => dl("pdf")} disabled={busy !== null}>
            <FileDown /> {busy === "pdf" ? "Preparing…" : "Download PDF"}
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-[720px] rounded-sm border border-border bg-card px-8 py-10 font-serif text-[14px] leading-[1.7] text-foreground shadow-raised sm:px-14">
        {blocks.map((b, i) => {
          if (b.kind === "spacer") return <div key={i} className="h-4" />;
          if (b.kind === "heading")
            return (
              <p key={i} className="mt-4 mb-1 font-sans text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                {b.text}
              </p>
            );
          if (b.kind === "list")
            return (
              <ol key={i} className="mb-4 ml-5 list-decimal space-y-1.5 marker:font-mono marker:text-[12px] marker:text-muted-foreground">
                {b.items?.map((t) => <li key={t} className="pl-1">{t}</li>)}
              </ol>
            );
          return (
            <p key={i} className={cn(b.bold && "font-semibold", b.kind === "para" && "mb-4")}>
              {b.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function VerdictWorkspace({ result: r, isSample, backendCaseId, onReset }: Props) {
  const v = VERDICT_META[r.verdict];
  const [purging, setPurging] = useState(false);

  const purge = async () => {
    setPurging(true);
    try {
      if (backendCaseId) await deleteCase(backendCaseId);
      toast.success("Case purged — all documents and results deleted");
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
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> New case
        </button>
        <Button variant="outline" size="sm" onClick={purge} disabled={purging}>
          <Trash2 /> {purging ? "Purging…" : "Purge case data"}
        </Button>
      </div>

      {isSample && (
        <div className="mb-5 rounded-md border border-contestable-border bg-contestable-bg px-4 py-3 text-[12.5px] text-contestable">
          The analysis service is offline, so this is a <strong>sample analysis</strong> — not
          based on your uploaded documents. Connect the backend to analyse your own case.
        </div>
      )}

      {/* Case header */}
      <div className="surface">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-5">
          <Field k="Case ID" v={backendCaseId ?? r.case_id} mono />
          <Field k="Claim number" v={r.claim_number || "Not stated"} mono />
          <div className="col-span-2 min-w-0">
            <Field k="Insurer" v={r.insurer || "Not stated"} />
          </div>
          <Field k="Claim amount" v={formatOptionalINR(r.claim_amount)} mono />
        </dl>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border bg-background px-6 py-4 md:grid-cols-5">
          <Field k="Patient" v={r.patient || "Not stated"} />
          <Field k="Treatment" v={r.treatment || "Not stated"} />
          <Field k="First inception" v={formatOptionalDate(r.first_inception_date)} mono />
          <Field k="Admission" v={formatOptionalDate(r.admission_date)} mono />
          <Field
            k="Continuous cover"
            v={r.continuous_cover_months != null ? `${r.continuous_cover_months} months` : "Not stated"}
            mono
          />
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
            {r.needs_human_review && (
              <span
                data-testid="needs-human-review-badge"
                className="inline-flex items-center gap-1.5 rounded-md border border-contestable-border bg-contestable-bg px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-contestable"
              >
                <AlertTriangle className="size-3.5" /> Needs Human Review
              </span>
            )}
            <span className="text-[13px] text-muted-foreground">{v.short}</span>
          </div>
          <p className="mt-5 text-[17px] leading-relaxed text-foreground">{r.summary}</p>
          {r.warnings && r.warnings.length > 0 && (
            <ul className="mt-4 space-y-1 rounded-md border border-contestable-border bg-contestable-bg px-3.5 py-2.5 text-[12px] text-contestable">
              {r.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-baseline justify-between text-[12.5px]">
              <span className="font-medium text-foreground tabular">
                {r.confidence}% Confidence — {confidenceLabel(r.confidence)}
              </span>
              <span className="text-muted-foreground">
                Cited: {(r.cited_clause || "Not specified").split(" — ")[0]}
              </span>
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
                <dd className={cn("mt-1 font-mono text-[17px] font-medium tabular sm:text-[19px]", x.cls)}>
                  {formatOptionalINR(x.v)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border bg-background px-6 py-3 text-[12px] text-muted-foreground tabular">
            Sum insured {formatOptionalINR(r.sum_insured)} · Repudiated {formatOptionalDate(r.repudiation_date)}
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
        <Tabs.Content value="letter"><LetterTab r={r} /></Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
