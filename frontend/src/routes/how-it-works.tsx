import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PIPELINE_STAGES } from "@/lib/clauseiq/stages";
import { VERDICT_META } from "@/lib/clauseiq/verdict";
import type { Verdict } from "@/lib/clauseiq/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — ClauseIQ" },
      {
        name: "description",
        content:
          "The six-stage ClauseIQ pipeline: OCR, fact extraction, clause search, R1–R10 statutory checks, verbatim evidence verification and plain-English verdicts.",
      },
      { property: "og:title", content: "How ClauseIQ analyses a claim rejection" },
      {
        property: "og:description",
        content: "Deterministic rule checks and verbatim evidence — no generative verdicts.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const RULES = [
  [
    "R1",
    "PED Waiting Period",
    "Pre-existing disease waiting periods cannot exceed 36 months (IRDAI Master Circular 2024); continuous cover across renewals applies.",
  ],
  [
    "R2",
    "60-Month Moratorium",
    "After 60 months of continuous cover, non-disclosure or misrepresentation cannot be raised except for established fraud (Insurance Act Section 45).",
  ],
  [
    "R3",
    "Early Onset",
    "An illness diagnosed within the first 3 months with no prior signs or consultation is not treated as a pre-existing disease.",
  ],
  [
    "R4",
    "Specific Illness Waiting",
    "Listed procedures (such as cataract, hernia, joint replacement) are checked against the policy's stated waiting period.",
  ],
  [
    "R5",
    "Initial 30-Day Waiting Period",
    "Only illnesses (not accidents) occurring within the initial 30-day waiting period after policy inception are excluded.",
  ],
  [
    "R6",
    "Room Rent Proportionate Deduction",
    "Proportionate deductions apply only if stated in the policy, and cannot exceed the eligible-to-actual room rent ratio or touch non-associated charges.",
  ],
  [
    "R7",
    "Non-Payable Items",
    "Disallowed items are checked against the standard regulatory non-payable consumables list; unlisted items are flagged as contestable.",
  ],
  [
    "R8",
    "Documents or Delay",
    "Checks whether claim intimation falls within the policy window and lists any missing documents requested by the insurer.",
  ],
  [
    "R9",
    "Grievance & Ombudsman Deadlines",
    "Tracks the 30-day insurer grievance resolution window and the 1-year Insurance Ombudsman filing deadline from rejection.",
  ],
  [
    "R10",
    "Cashless Timelines",
    "Informational benchmark under IRDAI Master Circular 2024: ~1 hour for cashless pre-authorisation and ~3 hours for discharge.",
  ],
];

function HowItWorks() {
  return (
    <div className="animate-rise mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="eyebrow">Method</p>
      <h1 className="mt-3 text-[34px] font-semibold leading-tight text-foreground">How It Works</h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        ClauseIQ never asks a language model to decide your case. Verdicts come from fixed,
        auditable rules applied to facts extracted from your documents — and every quote shown to
        you is checked character-for-character against the source text.
      </p>

      <ol className="surface mt-10 divide-y divide-border">
        {PIPELINE_STAGES.map((s, i) => (
          <li key={s.title} className="flex gap-5 px-6 py-5 transition-colors duration-200 ease-out hover:bg-secondary/40">
            <span className="font-mono text-[13px] text-subtle-foreground">0{i + 1}</span>
            <div>
              <p className="text-[15px] font-medium text-foreground">{s.title}</p>
              <p className="mt-1 text-[13.5px] text-muted-foreground">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-[20px] font-semibold text-foreground">The R1–R10 statutory checks</h2>
      <div className="surface mt-4 overflow-hidden">
        <table className="w-full text-left text-[13.5px]">
          <tbody>
            {RULES.map(([id, name, d]) => (
              <tr key={id} className="border-b border-border align-top transition-colors duration-150 ease-out last:border-0 hover:bg-secondary/40">
                <td className="w-14 px-5 py-3 font-mono text-[12px] text-muted-foreground">{id}</td>
                <td className="px-3 py-3 font-medium text-foreground">{name}</td>
                <td className="px-5 py-3 text-muted-foreground">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-[20px] font-semibold text-foreground">What the verdicts mean</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(Object.keys(VERDICT_META) as Verdict[]).map((k) => (
          <div key={k} className="surface lift p-5">
            <span className={cn("rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider", VERDICT_META[k].className)}>
              {VERDICT_META[k].label}
            </span>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              {VERDICT_META[k].description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button asChild size="lg">
          <Link to="/" hash="demo-cases">
            Try a Demo Case <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
