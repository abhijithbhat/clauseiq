import { ArrowRight, ChevronDown, FileSearch, Lock, ScrollText, Timer } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DEMO_CASES, DEMO_CASE_LIST, type DemoCaseId } from "@/lib/clauseiq/mock-cases";
import { formatOptionalINR, maskDate, parseDDMMYYYY } from "@/lib/clauseiq/format";
import type { DocumentKind, ManualFacts } from "@/lib/clauseiq/types";
import { VERDICT_META } from "@/lib/clauseiq/verdict";
import { useBackendStatus } from "@/lib/clauseiq/use-backend-status";
import { cn } from "@/lib/utils";
import { UploadSlot } from "./UploadSlot";

const PDF = ["application/pdf"];
const IMG = ["image/png", "image/jpeg"];

interface Props {
  onDemo: (id: DemoCaseId) => void;
  onAnalyze: (files: Partial<Record<DocumentKind, File>>, facts: ManualFacts, online: boolean) => void;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const invalid = value.length === 10 && !parseDDMMYYYY(value);
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      <input
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        value={value}
        onChange={(e) => onChange(maskDate(e.target.value))}
        className={cn(
          "mt-1.5 h-9 w-full rounded-md border bg-card px-3 font-mono text-[13px] tabular outline-none transition-colors placeholder:text-subtle-foreground focus:border-foreground",
          invalid ? "border-destructive" : "border-input",
        )}
      />
      {invalid && <span className="mt-1 block text-[11px] text-destructive">Not a valid date</span>}
    </label>
  );
}

export function Intake({ onDemo, onAnalyze }: Props) {
  const uploadSection = useRef<HTMLElement>(null);
  const openUpload = () => {
    const section = uploadSection.current;
    if (!section) return;
    const stickyHeight = document.querySelector("header")?.parentElement?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - stickyHeight - 16, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    section.querySelector<HTMLButtonElement>('button[id]')?.focus({ preventScroll: true });
  };
  const { online } = useBackendStatus();
  const [files, setFiles] = useState<Partial<Record<DocumentKind, File>>>({});
  const [facts, setFacts] = useState<ManualFacts>({ first_inception_date: "", admission_date: "" });
  const [factsOpen, setFactsOpen] = useState(false);
  const [consent, setConsent] = useState(false);

  const setFile = (k: DocumentKind) => (f: File | undefined) =>
    setFiles((prev) => ({ ...prev, [k]: f }));

  const missing = [!files.POLICY && "policy document", !files.REJECTION_LETTER && "rejection letter"]
    .filter(Boolean)
    .join(" and ");
  const datesInvalid = [facts.first_inception_date, facts.admission_date].some(
    (v) => v && !parseDDMMYYYY(v),
  );
  const canSubmit = consent && !missing && !datesInvalid;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-paper" aria-hidden />
      <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-14">
        <div className="max-w-3xl animate-rise">
          <p className="eyebrow">Claim repudiation analysis · India</p>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.1] text-foreground sm:text-[46px]">
            Challenge Unfair Health Insurance Claim Rejections in India.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
            Deterministic clause-by-clause analysis under IRDAI regulations. Every legal quote
            verified against your original policy text.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={openUpload} className="group shadow-card">
              Check My Claim <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onDemo("case_01")} className="bg-card">
              View Sample Report <FileSearch />
            </Button>
          </div>
          <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border text-[12px]">
            {[
              { icon: ScrollText, k: "10", v: "Statutory rule checks" },
              { icon: FileSearch, k: "100%", v: "Verbatim quote verification" },
              { icon: Timer, k: "< 2 min", v: "Typical analysis time" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={v} className="bg-card px-4 py-3 transition-colors duration-200 ease-out hover:bg-secondary/50">
                <Icon className="size-3.5 text-subtle-foreground" />
                <dt className="mt-2 font-mono text-[15px] font-medium text-foreground tabular">{k}</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ol aria-label="Claim review workflow" className="relative mx-auto mb-8 grid max-w-6xl grid-cols-3 px-4 sm:px-6">
        {["Upload Policy", "Statutory Rule Audit", "Verbatim Appeal"].map((step, i) => (
          <li key={step} className="relative flex min-w-0 items-center gap-2 border-y border-border py-4 pr-2 sm:gap-3 sm:pr-6">
            <span className="font-mono text-[12px] font-medium text-wrongful tabular">0{i + 1}</span>
            <span className="text-[11px] font-medium leading-snug text-foreground sm:text-[13px]">{step}</span>
            {i < 2 && <span className="ml-2 hidden h-px flex-1 bg-border-strong sm:block" aria-hidden />}
          </li>
        ))}
      </ol>

      <section id="demo-cases" className="relative mx-auto max-w-6xl scroll-mt-32 px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Try a Demo Case</h2>
            <p className="text-[13px] text-muted-foreground">
              Run the full pipeline on a realistic case — no upload needed.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {DEMO_CASE_LIST.map((c, i) => {
            const data = DEMO_CASES[c.id];
            const v = VERDICT_META[data.verdict];
            return (
              <Button
                variant="outline"
                key={c.id}
                type="button"
                onClick={() => onDemo(c.id)}
                style={{ animationDelay: `${80 + i * 60}ms` }}
                className={cn("group surface lift demo-lift flex h-auto animate-rise flex-col items-stretch justify-between gap-0 overflow-hidden whitespace-normal border-t-[3px] bg-card p-0 text-left hover:bg-card", v.accentClassName)}
              >
                <div className="flex-1 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-subtle-foreground">{c.id}</span>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      v.className,
                    )}
                  >
                    {v.label}
                  </span>
                </div>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {c.category}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{c.facts}</p>
                </div>
                <div className="flex items-end justify-between gap-3 border-t border-border bg-card-footer px-5 py-4">
                  <div>
                    <div className="font-mono text-[17px] font-medium text-foreground tabular">
                      {formatOptionalINR(data.claim_amount)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{data.treatment}</div>
                  </div>
                  <ArrowRight className="size-4 text-subtle-foreground transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
              </Button>
            );
          })}
        </div>
      </section>

      <section ref={uploadSection} id="new-case" className="relative mx-auto mt-10 max-w-6xl scroll-mt-36 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-md border border-primary bg-primary px-6 py-6 text-primary-foreground shadow-raised">
            <div>
              <h2 className="text-[20px] font-semibold">Start a new case</h2>
              <p className="mt-1 text-[13px] text-primary-foreground/80">
                Upload your policy and the insurer's rejection letter.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-primary-foreground/70">
              <Lock className="size-3.5" /> Documents purged after processing
            </span>
            </div>
            <Button variant="action" size="lg" onClick={openUpload} className="group h-auto min-h-10 max-w-full whitespace-normal px-4 py-3 text-left sm:px-6">
              Upload Policy &amp; Rejection Letter <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </div>
        <div className="mt-5 animate-rise overflow-hidden rounded-md border border-border bg-card shadow-card" style={{ animationDelay: "180ms" }}>
          <div className="grid gap-5 px-6 py-6 md:grid-cols-3">
            <UploadSlot
              index={1}
              label="Policy Document"
              required
              hint="PDF · max 10 MB"
              accept={PDF}
              file={files.POLICY}
              onChange={setFile("POLICY")}
            />
            <UploadSlot
              index={2}
              label="Rejection Letter"
              required
              hint="PDF / PNG / JPG · max 10 MB"
              accept={[...PDF, ...IMG]}
              file={files.REJECTION_LETTER}
              onChange={setFile("REJECTION_LETTER")}
            />
            <UploadSlot
              index={3}
              label="Hospital Discharge Summary"
              required={false}
              hint="PDF / Image · max 10 MB"
              accept={[...PDF, ...IMG]}
              file={files.DISCHARGE}
              onChange={setFile("DISCHARGE")}
            />
          </div>

          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setFactsOpen((o) => !o)}
              aria-expanded={factsOpen}
              className="flex w-full items-center justify-between px-6 py-3.5 text-left transition-colors duration-200 ease-out hover:bg-secondary/50"
            >
              <span className="text-[13px] text-foreground">
                Optional manual fields
                <span className="ml-2 text-muted-foreground">
                  — use if dates are unclear in your documents
                </span>
              </span>
              <ChevronDown
                className={cn("size-4 text-muted-foreground transition-transform", factsOpen && "rotate-180")}
              />
            </button>
            {factsOpen && (
              <div className="grid gap-4 px-6 pb-5 sm:grid-cols-2 md:max-w-xl">
                <DateField
                  label="First Inception Date"
                  value={facts.first_inception_date ?? ""}
                  onChange={(v) => setFacts((f) => ({ ...f, first_inception_date: v }))}
                />
                <DateField
                  label="Hospital Admission Date"
                  value={facts.admission_date ?? ""}
                  onChange={(v) => setFacts((f) => ({ ...f, admission_date: v }))}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 border-t border-border bg-background px-6 py-5 md:flex-row md:items-center md:justify-between">
            <label className="flex max-w-2xl cursor-pointer items-start gap-3">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
                aria-label="Consent to document processing"
              />
              <span className="text-[12.5px] leading-relaxed text-muted-foreground">
                I consent to processing these documents for automated clause analysis. I understand
                this is an assistive tool, not legal representation, and raw documents are purged
                after processing.
              </span>
            </label>
            <div className="flex shrink-0 flex-col items-stretch gap-1.5 md:items-end">
              <Button
                size="lg"
                disabled={!canSubmit}
                onClick={() => onAnalyze(files, facts, online)}
              >
                Analyze My Claim <ArrowRight />
              </Button>
              <span className="text-[11px] text-subtle-foreground">
                {!consent
                  ? "Consent is required to continue"
                  : missing
                    ? `Add your ${missing}`
                    : datesInvalid
                      ? "Fix the manual dates"
                      : online
                        ? "Will run on the live analysis service"
                        : "Backend offline — a sample analysis will be shown"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
