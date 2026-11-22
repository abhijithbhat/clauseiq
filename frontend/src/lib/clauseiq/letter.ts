import { computeDeadlines } from "./deadlines";
import { formatDate, formatINR, formatLongDate, isValidISODate, todayISO } from "./format";
import type { AnalysisResult } from "./types";

export interface LetterBlock {
  kind: "line" | "heading" | "para" | "list" | "spacer";
  text?: string;
  items?: string[];
  bold?: boolean;
}

function presentOrPlaceholder(value: string | null | undefined, placeholder: string): string {
  const cleaned = value?.trim();
  if (!cleaned || cleaned === "Not stated" || cleaned === "Not specified") return placeholder;
  return cleaned;
}

export function buildAppealLetter(r: AnalysisResult, dateIso = todayISO()): LetterBlock[] {
  const repudiationDateIso = isValidISODate(r.repudiation_date) ? r.repudiation_date : null;
  const d = repudiationDateIso ? computeDeadlines(repudiationDateIso) : null;
  const contradicted = r.rules.filter((x) => x.outcome === "CONTRADICTS_INSURER");

  const policyholder = presentOrPlaceholder(r.policyholder, "[[policyholder name]]");
  const insurer = presentOrPlaceholder(r.insurer, "[[insurer name]]");
  const grievanceEmail = presentOrPlaceholder(
    r.insurer_grievance_email,
    "[[insurer grievance email]]",
  );
  const claimNumber = presentOrPlaceholder(r.claim_number, "[[claim number]]");
  const policyNumber = presentOrPlaceholder(r.policy_number, "[[policy number]]");
  const productName = presentOrPlaceholder(r.product_name, "health insurance policy");
  const firstInception = isValidISODate(r.first_inception_date)
    ? formatDate(r.first_inception_date)
    : "[[first inception date]]";
  const repudiationDate = repudiationDateIso
    ? formatDate(repudiationDateIso)
    : "[[repudiation date]]";
  const admissionDate = isValidISODate(r.admission_date)
    ? formatDate(r.admission_date)
    : "[[admission date]]";
  const claimAmount =
    r.claim_amount != null ? formatINR(r.claim_amount) : "[[claim amount]]";
  const disallowedAmount =
    r.disallowed_amount != null ? formatINR(r.disallowed_amount) : "[[disallowed amount]]";
  const treatment =
    r.treatment && r.treatment !== "Not stated" ? r.treatment.toLowerCase() : "medical treatment";
  const hospital = presentOrPlaceholder(r.hospital, "[[hospital name]]");
  const citedClause = presentOrPlaceholder(r.cited_clause, "[[cited policy clause]]");

  return [
    { kind: "line", text: policyholder, bold: true },
    { kind: "line", text: `Date: ${formatLongDate(dateIso)}` },
    { kind: "spacer" },
    { kind: "line", text: "To," },
    { kind: "line", text: "The Grievance Redressal Officer" },
    { kind: "line", text: insurer },
    { kind: "line", text: `Email: ${grievanceEmail}` },
    { kind: "spacer" },
    {
      kind: "line",
      bold: true,
      text: `Subject: Grievance against repudiation of Claim No. ${claimNumber} under Policy No. ${policyNumber}`,
    },
    { kind: "spacer" },
    { kind: "para", text: "Dear Sir/Madam," },
    {
      kind: "para",
      text: `I am the policyholder under ${productName}, Policy No. ${policyNumber}, first incepted on ${firstInception} and renewed without any break in coverage. I write to formally contest your letter dated ${repudiationDate} repudiating my claim of ${claimAmount} for ${treatment} at ${hospital}, admitted on ${admissionDate}.`,
    },
    {
      kind: "para",
      text: `The repudiation relies on ${citedClause}, stating: "${r.rejection_reason}" I respectfully submit that this ground is not sustainable for the following reasons:`,
    },
    { kind: "list", items: r.appeal_grounds },
    ...(contradicted.length
      ? [
          { kind: "heading" as const, text: "Statutory provisions relied upon" },
          {
            kind: "list" as const,
            items: contradicted.map((x) => `${x.citation} — ${x.finding}`),
          },
        ]
      : []),
    {
      kind: "para",
      text: `I therefore request you to review the repudiation, admit the claim and settle the disallowed amount of ${disallowedAmount} in accordance with the policy terms and the IRDAI Master Circular on Health Insurance Business, 2024.`,
    },
    {
      kind: "para",
      text: `Please note that if this grievance is not resolved satisfactorily within ${30} days${d ? ` (by ${formatDate(d.grievanceResponseDue)})` : ""}, I reserve the right to approach the Insurance Ombudsman under the Insurance Ombudsman Rules, 2017, and to pursue any other remedy available in law.`,
    },
    {
      kind: "para",
      text: "Copies of the policy schedule, repudiation letter and discharge summary are enclosed for reference.",
    },
    { kind: "spacer" },
    { kind: "line", text: "Yours faithfully," },
    { kind: "spacer" },
    { kind: "line", text: policyholder, bold: true },
    { kind: "line", text: `Policy No. ${policyNumber}` },
  ];
}

export function letterToPlainText(blocks: LetterBlock[]): string {
  return blocks
    .map((b) => {
      if (b.kind === "spacer") return "";
      if (b.kind === "list") return (b.items ?? []).map((t, i) => `${i + 1}. ${t}`).join("\n");
      if (b.kind === "heading") return `\n${b.text}`;
      return b.text ?? "";
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadLetterPdf(blocks: LetterBlock[], filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 64;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;
  const lh = 15;
  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const write = (text: string, bold = false, indent = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(10.5);
    // jsPDF core fonts lack the rupee glyph
    const safe = text.replace(/₹/g, "Rs. ");
    const lines = doc.splitTextToSize(safe, width - indent) as string[];
    for (const l of lines) {
      ensure(lh);
      doc.text(l, margin + indent, y);
      y += lh;
    }
  };
  for (const b of blocks) {
    if (b.kind === "spacer") y += lh * 0.6;
    else if (b.kind === "line") write(b.text ?? "", b.bold);
    else if (b.kind === "heading") {
      y += 4;
      write(b.text ?? "", true);
    } else if (b.kind === "para") {
      write(b.text ?? "");
      y += 6;
    } else if (b.kind === "list") {
      (b.items ?? []).forEach((t, i) => {
        write(`${i + 1}.  ${t}`, false, 12);
        y += 3;
      });
      y += 4;
    }
  }
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text(
    "Prepared with ClauseIQ — an assistive tool. Not legal advice. Verify all cited clauses before submission.",
    margin,
    pageH - 32,
  );
  download(doc.output("blob"), filename);
}

export async function downloadLetterDocx(blocks: LetterBlock[], filename: string) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const children = blocks.flatMap((b) => {
    if (b.kind === "spacer") return [new Paragraph({ text: "" })];
    if (b.kind === "list")
      return (b.items ?? []).map(
        (t, i) =>
          new Paragraph({
            indent: { left: 360, hanging: 360 },
            spacing: { after: 80 },
            children: [new TextRun({ text: `${i + 1}.\t${t}`, size: 22, font: "Calibri" })],
          }),
      );
    return [
      new Paragraph({
        spacing: { after: b.kind === "para" ? 160 : 0, before: b.kind === "heading" ? 120 : 0 },
        children: [
          new TextRun({
            text: b.text ?? "",
            bold: b.bold || b.kind === "heading",
            size: 22,
            font: "Calibri",
          }),
        ],
      }),
    ];
  });
  const doc = new Document({ sections: [{ children }] });
  download(await Packer.toBlob(doc), filename);
}
