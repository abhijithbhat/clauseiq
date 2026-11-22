import { PIPELINE_STAGES } from "./stages";
import type {
  AnalysisResult,
  BackendAnalysisResult,
  BackendEvidenceSourceType,
  BackendExtractedFacts,
  BackendRuleOutcome,
  DocumentKind,
  EditableFacts,
  EvidenceItem,
  EvidenceSource,
  ProgressResponse,
  RuleEvaluation,
  RuleOutcome,
  StageStatus,
} from "./types";

function isBackendAnalysisResult(
  raw: BackendAnalysisResult | AnalysisResult,
): raw is BackendAnalysisResult {
  return typeof raw.verdict === "object" && raw.verdict !== null && "label" in raw.verdict;
}

export function mapRuleOutcome(outcome: BackendRuleOutcome | RuleOutcome | string): RuleOutcome {
  switch (outcome) {
    case "CONTRADICTS_INSURER":
      return "CONTRADICTS_INSURER";
    case "SUPPORTS_INSURER":
      return "SUPPORTS_INSURER";
    case "NOT_APPLICABLE":
      return "NOT_APPLICABLE";
    case "UNKNOWN":
    case "NEEDS_INFO":
    default:
      return "NEEDS_INFO";
  }
}

export function mapEvidenceSource(sourceType: BackendEvidenceSourceType | string): EvidenceSource {
  switch (sourceType) {
    case "POLICY":
      return "POLICY";
    case "LETTER":
      return "REJECTION_LETTER";
    case "LAW_PACK":
      return "REGULATION";
    case "DISCHARGE":
      return "DISCHARGE";
    case "DISCHARGE_SUMMARY":
      return "DISCHARGE_SUMMARY";
    default:
      return "OTHER";
  }
}

function documentKindTitle(kind: DocumentKind | string): string {
  switch (kind) {
    case "POLICY":
      return "Policy document";
    case "REJECTION_LETTER":
      return "Rejection letter";
    case "DISCHARGE":
      return "Discharge summary";
    default:
      return "Supporting document";
  }
}

const EDITABLE_SPAN_MAP: { field: keyof EditableFacts; spanKeys: string[] }[] = [
  { field: "policy_first_inception_date", spanKeys: ["policy_first_inception_date", "first_inception_date"] },
  { field: "admission_date", spanKeys: ["admission_date"] },
  { field: "continuous_coverage_months", spanKeys: ["continuous_coverage_months"] },
  { field: "grievance_sent_date", spanKeys: ["grievance_sent_date"] },
  { field: "grievance_received_date", spanKeys: ["grievance_received_date"] },
  { field: "grievance_reply_status", spanKeys: ["grievance_reply_status"] },
  { field: "claim_amount", spanKeys: ["claim_amount_inr", "claim_amount"] },
];

function buildFieldSources(
  spans: BackendExtractedFacts["source_spans"],
): AnalysisResult["field_sources"] {
  if (!spans) return undefined;
  const out: NonNullable<AnalysisResult["field_sources"]> = {};
  for (const { field, spanKeys } of EDITABLE_SPAN_MAP) {
    for (const key of spanKeys) {
      const span = spans[key];
      if (span) {
        out[field] = {
          page: span.page,
          document_title: documentKindTitle(span.document),
        };
        break;
      }
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function evidenceDocumentTitle(sourceType: BackendEvidenceSourceType | string): string {
  switch (sourceType) {
    case "POLICY":
      return "Policy Document";
    case "LETTER":
      return "Rejection Letter";
    case "LAW_PACK":
      return "IRDAI / Statutory Law Pack";
    default:
      return "Supporting Document";
  }
}

function policyTypeLabel(policyType: BackendExtractedFacts["policy_type"]): string {
  switch (policyType) {
    case "INDIVIDUAL":
      return "Individual Health Policy";
    case "FLOATER":
      return "Family Floater Health Policy";
    case "GROUP":
      return "Group Health Insurance Policy";
    default:
      return "Health Insurance Policy";
  }
}

function scaleConfidence(rawConfidence: number): number {
  if (!Number.isFinite(rawConfidence)) return 0;
  if (rawConfidence >= 0 && rawConfidence <= 1) {
    return Math.round(rawConfidence * 100);
  }
  return Math.max(0, Math.min(100, Math.round(rawConfidence)));
}

function buildAppealGrounds(
  raw: BackendAnalysisResult,
  rules: RuleEvaluation[],
  evidence: EvidenceItem[],
): string[] {
  const grounds: string[] = [];
  const seen = new Set<string>();
  const addUnique = (text: string | undefined | null) => {
    const cleaned = text?.trim();
    if (!cleaned || seen.has(cleaned)) return;
    seen.add(cleaned);
    grounds.push(cleaned);
  };

  for (const r of rules) {
    if (r.outcome === "CONTRADICTS_INSURER") {
      addUnique(r.finding);
    }
  }

  if (raw.verdict.label === "CONTESTABLE") {
    for (const r of rules) {
      if (r.outcome === "NEEDS_INFO") {
        addUnique(r.finding);
      }
    }
  }

  const reasonIds = new Set(raw.verdict.reasons ?? []);
  const verifiedEvidence = evidence.filter((e) => e.verified !== false);
  const prioritized = verifiedEvidence.filter((e) => reasonIds.has(e.id));
  for (const ev of prioritized.length > 0 ? prioritized : verifiedEvidence.slice(0, 2)) {
    addUnique(`${ev.section} (Page ${ev.page}): "${ev.quote}"`);
  }

  if (grounds.length === 0) {
    if (raw.verdict.summary.trim()) {
      addUnique(raw.verdict.summary);
    }
    for (const r of rules) {
      addUnique(r.finding);
    }
  }

  if (grounds.length === 0) {
    addUnique("Requesting a formal review of the claim decision and supporting policy records.");
  }

  return grounds;
}

/**
 * Convert a nested backend AnalysisResult payload into the flat frontend view model.
 * Offline DEMO_CASES (already flat) pass through unchanged.
 */
export function adaptAnalysisResult(raw: BackendAnalysisResult | AnalysisResult): AnalysisResult {
  if (!isBackendAnalysisResult(raw)) {
    return raw;
  }

  const facts = raw.facts ?? {};
  const rawRules = Array.isArray(raw.rules) ? raw.rules : [];
  const rawEvidence = Array.isArray(raw.evidence) ? raw.evidence : [];

  const rules: RuleEvaluation[] = rawRules.map((rule) => ({
    id: rule.rule_id,
    name: rule.name,
    outcome: mapRuleOutcome(rule.outcome),
    citation: rule.law_ref?.trim() || "—",
    finding: rule.explanation,
    ...(rule.inputs ? { inputs: rule.inputs } : {}),
  }));

  const ruleByEvidenceId = new Map<string, string>();
  for (const rule of rawRules) {
    for (const evId of rule.supporting_evidence_ids ?? []) {
      if (!ruleByEvidenceId.has(evId)) {
        ruleByEvidenceId.set(evId, `${rule.rule_id}: ${rule.name}`);
      }
    }
  }

  const evidence: EvidenceItem[] = rawEvidence.map((ev) => {
    const linkedRule = ruleByEvidenceId.get(ev.id);
    const defaultRelevance = ev.verified
      ? linkedRule
        ? `Verified excerpt supporting ${linkedRule}.`
        : "Verbatim quote verified against uploaded document text."
      : "Quote could not be verified verbatim against uploaded documents.";

    return {
      id: ev.id,
      source: mapEvidenceSource(ev.source_type),
      document_title: evidenceDocumentTitle(ev.source_type),
      section: ev.source_ref || "Cited excerpt",
      page: ev.page ?? 1,
      quote: ev.quote,
      match_score: ev.verified ? 1 : 0,
      relevance: defaultRelevance,
      verified: ev.verified,
    };
  });

  const claimAmount = raw.money?.claim_amount_inr ?? facts.claim_amount_inr ?? null;
  const settledAmount = raw.money?.settled_amount_inr ?? facts.settled_amount_inr ?? null;
  const disallowedAmount =
    raw.money?.disallowed_amount_inr ??
    facts.disallowed_amount_inr ??
    (claimAmount != null && settledAmount != null ? Math.max(0, claimAmount - settledAmount) : null);

  const citedClause =
    facts.cited_clause_ref?.trim() ||
    (facts.cited_clause_text?.trim() ? facts.cited_clause_text.trim().slice(0, 80) : "Not specified");

  return {
    case_id: raw.case_id,
    claim_number: facts.claim_number?.trim() || "Not stated",
    policy_number: facts.policy_number?.trim() || "Not stated",
    insurer: facts.insurer_name?.trim() || "Not stated",
    insurer_grievance_email: "[[insurer grievance email]]",
    product_name: policyTypeLabel(facts.policy_type),
    policyholder: facts.insured_name?.trim() || "[[policyholder name]]",
    patient: facts.insured_name?.trim() || "Not stated",
    hospital: facts.hospital_name?.trim() || "Not stated",
    diagnosis: facts.diagnosis_text?.trim() || "Not stated",
    treatment: facts.treatment_text?.trim() || facts.diagnosis_text?.trim() || "Not stated",
    claim_amount: claimAmount,
    settled_amount: settledAmount,
    disallowed_amount: disallowedAmount,
    sum_insured: facts.sum_insured_inr ?? facts.base_sum_insured_inr ?? null,
    first_inception_date: facts.policy_first_inception_date ?? null,
    admission_date: facts.admission_date ?? null,
    repudiation_date: facts.rejection_date ?? null,
    continuous_cover_months: facts.continuous_coverage_months ?? null,
    grievance_sent_date: facts.grievance_sent_date ?? null,
    grievance_received_date: facts.grievance_received_date ?? null,
    grievance_reply_status: facts.grievance_reply_status ?? "UNKNOWN",
    field_sources: buildFieldSources(facts.source_spans),
    rejection_reason:
      facts.rejection_reason_text?.trim() || "No verbatim rejection reason extracted.",
    cited_clause: citedClause,
    verdict: raw.verdict.label,
    confidence: scaleConfidence(raw.verdict.confidence),
    needs_human_review: Boolean(raw.verdict.needs_human_review),
    warnings: raw.warnings ?? [],
    backend_deadlines: raw.deadlines ?? [],
    summary: raw.verdict.summary,
    appeal_grounds: buildAppealGrounds(raw, rules, evidence),
    rules,
    evidence,
  };
}

function normalizeStageStatus(status: string | undefined): StageStatus | null {
  switch (status?.trim().toLowerCase()) {
    case "pending":
      return "pending";
    case "running":
      return "running";
    case "done":
    case "completed":
      return "done";
    case "failed":
    case "error":
      return "failed";
    default:
      return null;
  }
}

/**
 * Map backend ProgressResponse ({ status, current_step: Optional[str], steps: [{name, status}] })
 * into the 6 ordered UI StageStatus values.
 */
export function mapProgressToStages(progress: ProgressResponse): StageStatus[] {
  const stepsByName = new Map<string, StageStatus>();
  for (const step of progress.steps ?? []) {
    const normalized = normalizeStageStatus(step.status);
    if (step.name && normalized) {
      stepsByName.set(step.name.trim().toLowerCase(), normalized);
    }
  }

  let currentIdx = -1;
  if (typeof progress.current_step === "number" && Number.isFinite(progress.current_step)) {
    currentIdx = Math.max(0, Math.min(progress.current_step, PIPELINE_STAGES.length - 1));
  } else if (typeof progress.current_step === "string" && progress.current_step.trim()) {
    const normalizedName = progress.current_step.trim().toLowerCase();
    if (normalizedName === "completed") {
      currentIdx = PIPELINE_STAGES.length;
    } else {
      currentIdx = PIPELINE_STAGES.findIndex((s) => s.title.toLowerCase() === normalizedName);
    }
  }

  const overallStatus = progress.status?.trim().toLowerCase();
  const isCompleted = overallStatus === "completed" || currentIdx >= PIPELINE_STAGES.length;

  return PIPELINE_STAGES.map((stage, i) => {
    const namedStatus = stepsByName.get(stage.title.toLowerCase());
    const fallbackStep =
      stepsByName.size === 0 ? normalizeStageStatus(progress.steps?.[i]?.status) : null;
    const explicit = namedStatus ?? fallbackStep;

    if (explicit === "done" || explicit === "failed" || explicit === "running") {
      return explicit;
    }
    if (isCompleted) {
      return "done";
    }
    if (currentIdx >= 0) {
      if (i < currentIdx) return "done";
      if (i === currentIdx && (overallStatus === "analyzing" || overallStatus === "running")) {
        return "running";
      }
      if (i === currentIdx && overallStatus === "failed") {
        return "failed";
      }
    }
    return explicit ?? "pending";
  });
}

