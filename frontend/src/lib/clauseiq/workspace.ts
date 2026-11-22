import { addDays, addYears, daysBetween, isValidISODate } from "./format";
import { buildAppealLetter, type LetterBlock } from "./letter";
import type { AnalysisResult, EditableFacts } from "./types";

export const LETTER_LEGAL_FOOTER =
  "Drafted with ClauseIQ, an assistive tool. This is not legal advice. Please review before sending.";

export function factsFromResult(r: AnalysisResult): EditableFacts {
  return {
    policy_first_inception_date: r.first_inception_date ?? "",
    admission_date: r.admission_date ?? "",
    continuous_coverage_months: r.continuous_cover_months ?? 0,
    grievance_sent_date: r.grievance_sent_date ?? "",
    grievance_received_date: r.grievance_received_date ?? "",
    grievance_reply_status: r.grievance_reply_status ?? "UNKNOWN",
    claim_amount: r.claim_amount ?? 0,
  };
}

/** Offline edits cannot verify source documents: invalidate conclusions rather than invent a legal verdict. */
export function recalculateDemo(r: AnalysisResult, facts: EditableFacts): AnalysisResult {
  return {
    ...r,
    first_inception_date: facts.policy_first_inception_date,
    admission_date: facts.admission_date,
    continuous_cover_months: facts.continuous_coverage_months,
    grievance_sent_date: facts.grievance_sent_date,
    grievance_received_date: facts.grievance_received_date,
    grievance_reply_status: facts.grievance_reply_status,
    claim_amount: facts.claim_amount,
    disallowed_amount: Math.max(0, facts.claim_amount - (r.settled_amount ?? 0)),
    verdict: "INSUFFICIENT_INFO",
    confidence: 0,
    needs_human_review: true,
    summary:
      "Offline recalculation: corrected facts and financial totals are shown below. The previous legal conclusion has been withdrawn until the documents can be re-analysed or reviewed by a qualified professional.",
    appeal_grounds: ["[[reviewed_appeal_grounds]]"],
    rules: r.rules.map((rule) => ({
      ...rule,
      outcome: "NEEDS_INFO",
      finding: "Corrected facts require fresh document verification; previous finding withdrawn.",
      inputs: { ...rule.inputs, ...facts },
    })),
  };
}

export type DeadlineStatus = "upcoming" | "due soon" | "passed" | "action_needed";

export function deadlineStatus(
  date: string | null,
  today: string,
  actionRequired = false,
): DeadlineStatus {
  if (!isValidISODate(date) || !isValidISODate(today)) return "action_needed";
  const remaining = daysBetween(today, date);
  if (remaining < 0) return actionRequired ? "action_needed" : "passed";
  return remaining <= 7 ? "due soon" : "upcoming";
}

export function timelineMilestones(r: AnalysisResult, today: string) {
  // TAT runs from receipt; do not invent receipt from the repudiation date.
  const repDate = isValidISODate(r.repudiation_date) ? r.repudiation_date : null;
  const received = isValidISODate(r.grievance_received_date) ? r.grievance_received_date : null;
  const awaiting = r.grievance_reply_status !== "REPLY_RECEIVED";
  const tat14Date = received ? addDays(received, 14) : null;
  const wait30Date = received ? addDays(received, 30) : null;
  const ombudsmanDate = repDate ? addYears(repDate, 1) : null;

  return [
    {
      label: "Today's Date",
      date: today,
      status: "action_needed" as DeadlineStatus,
      detail: "Review your next action.",
    },
    {
      label: "Repudiated Date",
      date: repDate,
      status: deadlineStatus(repDate, today),
      detail: repDate
        ? "Date on the rejection letter."
        : "Repudiation date was not extracted from the rejection letter.",
    },
    {
      label: "14-day IRDAI Grievance TAT",
      date: tat14Date,
      status: deadlineStatus(tat14Date, today, awaiting),
      detail: tat14Date ? "14 days from grievance receipt." : "Grievance receipt date is needed.",
    },
    {
      label: "30-day Rule 14 Ombudsman Wait Window",
      date: wait30Date,
      status: deadlineStatus(wait30Date, today),
      detail:
        r.grievance_reply_status === "REPLY_RECEIVED"
          ? "Reply received: the no-response wait is not required; review eligibility."
          : "30 days from receipt for the no-response route; other eligibility conditions apply.",
    },
    {
      label: "1-Year Insurance Ombudsman Filing Limit",
      date: ombudsmanDate,
      status: deadlineStatus(ombudsmanDate, today, true),
      detail: ombudsmanDate
        ? "Indicative date based on repudiation. A later grievance rejection or no-response trigger may change the legal filing limit; verify before relying on it."
        : "Repudiation date is needed to estimate the 1-year filing limit.",
    },
  ];
}

function presentOrToken(value: string | null | undefined, token: string): string {
  const cleaned = value?.trim();
  if (!cleaned || cleaned === "Not stated" || cleaned === "Not specified") return token;
  return cleaned;
}

export function previewLetter(r: AnalysisResult): LetterBlock[] {
  const safe: AnalysisResult = {
    ...r,
    policyholder: presentOrToken(r.policyholder, "[[policyholder_name]]"),
    policy_number: presentOrToken(r.policy_number, "[[policy_number]]"),
    claim_number: presentOrToken(r.claim_number, "[[claim_number]]"),
    hospital: presentOrToken(r.hospital, "[[hospital]]"),
  };
  return [
    ...buildAppealLetter(safe).map((b) => {
      if (b.text?.startsWith("Please note that")) {
        return {
          ...b,
          text: "If this grievance remains unresolved, I reserve the right to approach the Insurance Ombudsman, subject to the applicable waiting period and filing limit, and pursue other remedies available in law.",
        };
      }
      if (r.needs_human_review && b.text?.startsWith("The repudiation relies")) {
        return {
          ...b,
          text: `The repudiation relies on ${r.cited_clause}, stating: "${r.rejection_reason}" I request a review of the following corrected facts and grounds, subject to verification:`,
        };
      }
      return b;
    }),
    { kind: "line", text: "Address: [[postal_address]]" },
    { kind: "line", text: "Contact: [[contact_number]]" },
    { kind: "spacer" },
    { kind: "para", text: LETTER_LEGAL_FOOTER },
  ];
}

export function letterBlocksFromText(text: string): LetterBlock[] {
  return text.split(/\r?\n/).map((line) =>
    line.trim() === "" ? { kind: "spacer" as const } : { kind: "line" as const, text: line },
  );
}

export function placeholderKeys(blocks: LetterBlock[]): string[] {
  return [
    ...new Set(
      blocks
        .flatMap((b) => [b.text ?? "", ...(b.items ?? [])])
        .flatMap((t) => [...t.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1] ?? ""))
        .filter(Boolean),
    ),
  ];
}

export function fillLetter(blocks: LetterBlock[], values: Record<string, string>): LetterBlock[] {
  const fill = (text: string) =>
    text.replace(/\[\[([^\]]+)\]\]/g, (token, key: string) => values[key]?.trim() || token);
  return blocks.map((b) => ({
    ...b,
    ...(b.text !== undefined ? { text: fill(b.text) } : {}),
    ...(b.items ? { items: b.items.map(fill) } : {}),
  }));
}

