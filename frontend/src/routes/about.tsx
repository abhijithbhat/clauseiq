import { createFileRoute } from "@tanstack/react-router";
import { EyeOff, FileX, Scale, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Privacy — ClauseIQ" },
      {
        name: "description",
        content:
          "Why ClauseIQ exists, what it can and cannot do, and how your policy documents are processed and purged.",
      },
      { property: "og:title", content: "About ClauseIQ & how we handle your documents" },
      {
        property: "og:description",
        content: "An assistive tool for policyholders and grievance volunteers. Documents purged after processing.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const PRINCIPLES = [
  {
    icon: FileX,
    title: "Raw documents are purged",
    body: "Uploaded files are deleted once analysis completes. You can purge a case and all derived results at any time from the results screen.",
  },
  {
    icon: EyeOff,
    title: "No profiling, no resale",
    body: "Your medical and policy data is used only to analyse your case. It is never sold, shared with insurers, or used for advertising.",
  },
  {
    icon: ShieldCheck,
    title: "Consent before processing",
    body: "Nothing is processed until you give explicit consent, in line with the Digital Personal Data Protection Act, 2023.",
  },
  {
    icon: Scale,
    title: "Assistive, not legal advice",
    body: "ClauseIQ highlights grounds for appeal. It is not a lawyer and cannot guarantee any outcome. Verify every clause before you submit.",
  },
];

function About() {
  return (
    <div className="animate-rise mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="eyebrow">About &amp; Privacy</p>
      <h1 className="mt-3 text-[34px] font-semibold leading-tight text-foreground">
        Built for policyholders, not insurers.
      </h1>
      <div className="mt-6 max-w-2xl space-y-4 text-[15.5px] leading-relaxed text-muted-foreground">
        <p>
          Every year, lakhs of health insurance claims in India are rejected on grounds that do not
          survive scrutiny — waiting periods that have already ended, moratorium protections that
          are ignored, or room-rent deductions applied to costs they cannot legally touch.
        </p>
        <p>
          ClauseIQ helps policyholders and grievance volunteers test a rejection against the IRDAI
          Master Circular on Health Insurance Business (2024), Section 45 of the Insurance Act, and
          the Insurance Ombudsman Rules (2017) — and prepares a grievance letter grounded in
          verified quotes.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="surface lift p-6">
            <Icon className="size-5 text-foreground" />
            <h2 className="mt-4 text-[15px] font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="surface mt-10 p-6">
        <h2 className="text-[15px] font-semibold text-foreground">Where to escalate</h2>
        <ul className="mt-3 space-y-2 text-[13.5px] text-muted-foreground">
          <li>1. Insurer's Grievance Redressal Officer — first step, 30-day resolution window.</li>
          <li>2. IRDAI Bima Bharosa portal — bimabharosa.irdai.gov.in.</li>
          <li>3. Council for Insurance Ombudsmen — within one year of repudiation, free of cost.</li>
          <li>4. District Consumer Disputes Redressal Commission — within two years.</li>
        </ul>
      </div>
    </div>
  );
}
