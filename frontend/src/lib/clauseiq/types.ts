export type Verdict = "LIKELY_WRONGFUL" | "CONTESTABLE" | "LIKELY_VALID" | "INSUFFICIENT_INFO";

export type RuleOutcome =
  | "CONTRADICTS_INSURER"
  | "SUPPORTS_INSURER"
  | "NEEDS_INFO"
  | "NOT_APPLICABLE";

export type BackendRuleOutcome =
  | "SUPPORTS_INSURER"
  | "CONTRADICTS_INSURER"
  | "NOT_APPLICABLE"
  | "UNKNOWN";

export type DocumentKind = "POLICY" | "REJECTION_LETTER" | "DISCHARGE" | "OTHER";

export type EvidenceSource = DocumentKind | "DISCHARGE_SUMMARY" | "REGULATION";

export type BackendEvidenceSourceType = "POLICY" | "LAW_PACK" | "LETTER";

export interface RuleEvaluation {
  id: string;
  name: string;
  outcome: RuleOutcome;
  citation: string;
  finding: string;
  inputs?: Record<string, unknown> | undefined;
}

export type GrievanceReplyStatus =
  | "UNKNOWN"
  | "AWAITING_REPLY"
  | "REPLY_RECEIVED"
  | "CONFIRMED_NO_RESPONSE";

export interface EditableFacts {
  policy_first_inception_date: string;
  admission_date: string;
  continuous_coverage_months: number;
  grievance_sent_date: string;
  grievance_received_date: string;
  grievance_reply_status: GrievanceReplyStatus;
  claim_amount: number;
}

export interface EvidenceItem {
  id: string;
  source: EvidenceSource;
  document_title: string;
  section: string;
  page: number;
  quote: string;
  match_score: number; // 0..1, character-level verbatim match
  relevance: string;
  verified?: boolean | undefined;
}

export interface BackendDeadline {
  case_id: string;
  kind: string;
  due_date: string;
  status: string;
}

export interface BackendVerdict {
  case_id: string;
  label: Verdict;
  summary: string;
  confidence: number; // 0.0..1.0
  needs_human_review: boolean;
  reasons: string[];
}

export interface BackendExtractedFacts {
  insurer_name?: string | null | undefined;
  policy_number?: string | null | undefined;
  policy_type?: "INDIVIDUAL" | "FLOATER" | "GROUP" | "UNKNOWN" | undefined;
  insured_name?: string | null | undefined;
  claim_number?: string | null | undefined;
  claim_type?: "CASHLESS" | "REIMBURSEMENT" | "UNKNOWN" | undefined;
  claim_amount_inr?: number | null | undefined;
  settled_amount_inr?: number | null | undefined;
  disallowed_amount_inr?: number | null | undefined;
  rejection_date?: string | null | undefined;
  rejection_category?: string | undefined;
  rejection_reason_text?: string | null | undefined;
  cited_clause_ref?: string | null | undefined;
  cited_clause_text?: string | null | undefined;
  policy_first_inception_date?: string | null | undefined;
  current_period_start?: string | null | undefined;
  current_period_end?: string | null | undefined;
  admission_date?: string | null | undefined;
  discharge_date?: string | null | undefined;
  diagnosis_text?: string | null | undefined;
  treatment_text?: string | null | undefined;
  hospital_name?: string | null | undefined;
  ped_alleged?: boolean | null | undefined;
  fraud_alleged?: boolean | null | undefined;
  continuous_coverage_months?: number | null | undefined;
  sum_insured_inr?: number | null | undefined;
  base_sum_insured_inr?: number | null | undefined;
  grievance_sent_date?: string | null | undefined;
  grievance_received_date?: string | null | undefined;
  grievance_reply_received_date?: string | null | undefined;
  grievance_reply_status?: GrievanceReplyStatus | undefined;
  disallowed_items?: { name: string; amount_inr: number }[] | undefined;
  fields_confidence?: Record<string, number> | undefined;
  source_spans?:
    | Record<string, { document: DocumentKind; page: number; quote: string }>
    | undefined;
}

export interface BackendRuleResult {
  case_id: string;
  rule_id: string;
  name: string;
  outcome: BackendRuleOutcome;
  inputs: Record<string, unknown>;
  explanation: string;
  law_ref?: string | null | undefined;
  supporting_evidence_ids?: string[] | undefined;
}

export interface BackendEvidence {
  id: string;
  case_id: string;
  source_type: BackendEvidenceSourceType;
  source_ref: string;
  quote: string;
  page: number;
  verified: boolean;
}

export interface BackendMoneySummary {
  claim_amount_inr?: number | null | undefined;
  settled_amount_inr?: number | null | undefined;
  disallowed_amount_inr?: number | null | undefined;
}

export interface BackendAnalysisResult {
  case_id: string;
  verdict: BackendVerdict;
  facts: BackendExtractedFacts;
  rules: BackendRuleResult[];
  evidence: BackendEvidence[];
  money: BackendMoneySummary;
  deadlines: BackendDeadline[];
  letter_available?: boolean | undefined;
  warnings?: string[] | undefined;
}

export interface AnalysisResult {
  case_id: string;
  claim_number: string;
  policy_number: string;
  insurer: string;
  insurer_grievance_email: string;
  product_name: string;
  policyholder: string;
  patient: string;
  hospital: string;
  diagnosis: string;
  treatment: string;
  claim_amount: number | null;
  settled_amount: number | null;
  disallowed_amount: number | null;
  sum_insured: number | null;
  first_inception_date: string | null; // ISO yyyy-mm-dd
  admission_date: string | null;
  repudiation_date: string | null;
  continuous_cover_months: number | null;
  rejection_reason: string;
  cited_clause: string;
  verdict: Verdict;
  confidence: number; // 0..100
  needs_human_review?: boolean | undefined;
  warnings?: string[] | undefined;
  backend_deadlines?: BackendDeadline[] | undefined;
  grievance_sent_date?: string | null | undefined;
  grievance_received_date?: string | null | undefined;
  grievance_reply_status?: GrievanceReplyStatus | undefined;
  field_sources?:
    | Partial<Record<keyof EditableFacts, { page: number; document_title: string }>>
    | undefined;
  summary: string;
  appeal_grounds: string[];
  rules: RuleEvaluation[];
  evidence: EvidenceItem[];
}

export interface AppealLetterResponse {
  case_id?: string | undefined;
  version?: number | undefined;
  text?: string | undefined;
  content?: string | undefined;
  placeholders?: string[] | undefined;
  enclosures?: string[] | undefined;
}

export type StageStatus = "pending" | "running" | "done" | "failed";

export interface ProgressStep {
  name: string;
  status: StageStatus | string;
}

export interface ProgressResponse {
  case_id?: string | undefined;
  status: string;
  current_step: string | number | null;
  steps: ProgressStep[];
}

export interface ManualFacts {
  first_inception_date?: string; // DD/MM/YYYY
  admission_date?: string;
}
