"""Shared Pydantic v2 schemas and contracts for ClauseIQ (v0.1).

Defines canonical domain entities, API payloads, fact shapes, rule outcomes,
and analysis results conforming to Sections 7, 9, 10, and 11 of the ClauseIQ Specification.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ==============================================================================
# Enumerations (Sections 7, 9, 10)
# ==============================================================================

class PolicyType(str, Enum):
    """Health insurance policy cover structure."""
    INDIVIDUAL = "INDIVIDUAL"
    FLOATER = "FLOATER"
    GROUP = "GROUP"
    UNKNOWN = "UNKNOWN"


class ClaimType(str, Enum):
    """Claim settlement mechanism."""
    CASHLESS = "CASHLESS"
    REIMBURSEMENT = "REIMBURSEMENT"
    UNKNOWN = "UNKNOWN"


class RejectionCategory(str, Enum):
    """The six core rejection / deduction categories supported in v0.1."""
    PED = "PED"
    NON_DISCLOSURE = "NON_DISCLOSURE"
    WAITING_PERIOD = "WAITING_PERIOD"
    NON_PAYABLE_OR_DEDUCTION = "NON_PAYABLE_OR_DEDUCTION"
    ROOM_RENT = "ROOM_RENT"
    DOCUMENTS_OR_DELAY = "DOCUMENTS_OR_DELAY"
    OTHER = "OTHER"


class RuleOutcome(str, Enum):
    """Outcome produced by a deterministic rule check."""
    SUPPORTS_INSURER = "SUPPORTS_INSURER"
    CONTRADICTS_INSURER = "CONTRADICTS_INSURER"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    UNKNOWN = "UNKNOWN"


class VerdictLabel(str, Enum):
    """Overall 4-way verdict assigned by deterministic decision logic."""
    LIKELY_WRONGFUL = "LIKELY_WRONGFUL"
    CONTESTABLE = "CONTESTABLE"
    LIKELY_VALID = "LIKELY_VALID"
    INSUFFICIENT_INFO = "INSUFFICIENT_INFO"


class DocumentKind(str, Enum):
    """Type of document uploaded or parsed."""
    POLICY = "POLICY"
    REJECTION_LETTER = "REJECTION_LETTER"
    DISCHARGE = "DISCHARGE"
    OTHER = "OTHER"


class EvidenceSourceType(str, Enum):
    """Origin of a piece of quoted evidence."""
    POLICY = "POLICY"
    LAW_PACK = "LAW_PACK"
    LETTER = "LETTER"


class GrievanceReplyStatus(str, Enum):
    """Status of insurer's reply to policyholder's grievance representation."""
    REPLY_RECEIVED = "REPLY_RECEIVED"
    AWAITING_REPLY = "AWAITING_REPLY"
    CONFIRMED_NO_RESPONSE = "CONFIRMED_NO_RESPONSE"
    UNKNOWN = "UNKNOWN"


# ==============================================================================
# Supporting Sub-Models
# ==============================================================================

class SourceSpan(BaseModel):
    """Pointer linking an extracted fact directly to its verbatim text and page."""
    model_config = ConfigDict(extra="forbid")

    document: DocumentKind
    page: int
    quote: str


class DisallowedItem(BaseModel):
    """Individual item deducted or disallowed from a claim bill."""
    model_config = ConfigDict(extra="forbid")

    name: str
    amount_inr: float


class MoneySummary(BaseModel):
    """Summary of financial claim amounts."""
    model_config = ConfigDict(extra="forbid")

    claim_amount_inr: Optional[float] = None
    settled_amount_inr: Optional[float] = None
    disallowed_amount_inr: Optional[float] = None


class Deadline(BaseModel):
    """Grievance or Ombudsman statutory / policy deadline."""
    model_config = ConfigDict(extra="forbid")

    case_id: str
    kind: str  # e.g., "GRIEVANCE_REPLY_WINDOW", "OMBUDSMAN_LIMIT"
    due_date: str  # ISO YYYY-MM-DD
    status: str  # e.g., "UPCOMING", "DUE_SOON", "PASSED"


# ==============================================================================
# Core Fact Extraction Model (Section 10)
# ==============================================================================

class ExtractedFacts(BaseModel):
    """Structured facts extracted from documents.
    
    Rule: Never guess dates. Indian dates DD/MM/YYYY must be stored as ISO YYYY-MM-DD.
    Every non-null field must carry a source quote and page in `source_spans`.
    """
    model_config = ConfigDict(extra="forbid")

    insurer_name: Optional[str] = None
    policy_number: Optional[str] = None
    policy_type: PolicyType = PolicyType.UNKNOWN
    insured_name: Optional[str] = None
    claim_number: Optional[str] = None
    claim_type: ClaimType = ClaimType.UNKNOWN

    claim_amount_inr: Optional[float] = None
    settled_amount_inr: Optional[float] = None
    disallowed_amount_inr: Optional[float] = None

    rejection_date: Optional[str] = None  # ISO YYYY-MM-DD
    rejection_category: RejectionCategory = RejectionCategory.OTHER
    rejection_reason_text: Optional[str] = None  # verbatim reason from rejection letter
    cited_clause_ref: Optional[str] = None  # clause reference cited by insurer
    cited_clause_text: Optional[str] = None  # clause text as cited or extracted

    policy_first_inception_date: Optional[str] = None  # ISO YYYY-MM-DD
    current_period_start: Optional[str] = None  # ISO YYYY-MM-DD
    current_period_end: Optional[str] = None  # ISO YYYY-MM-DD
    admission_date: Optional[str] = None  # ISO YYYY-MM-DD
    discharge_date: Optional[str] = None  # ISO YYYY-MM-DD

    diagnosis_text: Optional[str] = None
    treatment_text: Optional[str] = None
    hospital_name: Optional[str] = None

    ped_alleged: Optional[bool] = None
    fraud_alleged: Optional[bool] = None

    room_rent_limit_per_day_inr: Optional[float] = None
    room_rent_actual_per_day_inr: Optional[float] = None

    # --- Rule Input Fields (R1 - R10) ---
    # R1 & R3: PED & Early Onset
    ped_waiting_period_months: Optional[int] = None
    diagnosis_date: Optional[str] = None  # ISO YYYY-MM-DD
    prior_symptoms_or_consultation_evidence: Optional[bool] = None

    # R2: Moratorium, Continuity & Sum Insured
    continuous_coverage_months: Optional[int] = None
    portability_continuity_months: Optional[int] = None
    sum_insured_inr: Optional[float] = None
    base_sum_insured_inr: Optional[float] = None
    sum_insured_enhanced_recently: Optional[bool] = None
    sum_insured_enhancement_date: Optional[str] = None  # ISO YYYY-MM-DD
    sum_insured_enhancement_amount_inr: Optional[float] = None
    fraud_established: Optional[bool] = None

    # R4 & R5: Waiting Periods & Accident Exemption
    initial_waiting_period_days: Optional[int] = None
    specific_illness_waiting_months: Optional[int] = None
    named_ailment_matched: Optional[str] = None
    is_accident_case: Optional[bool] = None

    # R6: Room Rent Proportionate Deduction
    has_room_rent_proportionate_clause: Optional[bool] = None
    associated_medical_charges_inr: Optional[float] = None
    non_associated_charges_inr: Optional[float] = None
    room_rent_deduction_inr: Optional[float] = None

    # R8: Documents & Intimation Delay
    claim_intimation_date: Optional[str] = None  # ISO YYYY-MM-DD
    policy_intimation_window_days: Optional[int] = None
    documents_requested_list: List[str] = Field(default_factory=list)

    # R9 & R10: Grievance Deadlines & Cashless Timelines
    grievance_sent_date: Optional[str] = None  # ISO YYYY-MM-DD
    grievance_received_date: Optional[str] = None  # ISO YYYY-MM-DD
    grievance_reply_received_date: Optional[str] = None  # ISO YYYY-MM-DD
    grievance_reply_status: GrievanceReplyStatus = GrievanceReplyStatus.UNKNOWN
    grievance_satisfactory: Optional[bool] = None

    disallowed_items: List[DisallowedItem] = Field(default_factory=list)
    fields_confidence: Dict[str, float] = Field(default_factory=dict)
    source_spans: Dict[str, SourceSpan] = Field(default_factory=dict)


# ==============================================================================
# Document & Ingestion Models (Section 9)
# ==============================================================================

class DocumentPages(BaseModel):
    """Parsed document pages with OCR indicators."""
    model_config = ConfigDict(extra="forbid")

    case_id: str
    kind: DocumentKind
    filename: str
    pages: int
    text_by_page: Dict[int, str]
    ocr_used: bool = False


class PolicyChunk(BaseModel):
    """Granular chunk of policy text representing a clause or section."""
    model_config = ConfigDict(extra="forbid")

    id: str
    case_id: str
    clause_ref: str
    heading: str
    text: str
    page_start: int
    page_end: int


# ==============================================================================
# Verification, Rules & Verdict Models (Sections 7, 8, 9, 10)
# ==============================================================================

class Evidence(BaseModel):
    """Verified quote from policy text, law pack, or rejection letter."""
    model_config = ConfigDict(extra="forbid")

    id: str
    case_id: str
    source_type: EvidenceSourceType
    source_ref: str  # e.g., "Clause 4.1", "IRDAI Master Circular 2024 Para 12"
    quote: str  # verbatim excerpt
    page: int
    verified: bool = False


class RuleResult(BaseModel):
    """Outcome of a single deterministic rule evaluation."""
    model_config = ConfigDict(extra="forbid")

    case_id: str
    rule_id: str  # e.g., "R1", "R2"
    name: str  # e.g., "PED waiting period"
    outcome: RuleOutcome
    inputs: Dict[str, Any]
    explanation: str
    law_ref: Optional[str] = None
    supporting_evidence_ids: List[str] = Field(default_factory=list)


class Verdict(BaseModel):
    """Consolidated verdict generated by code-driven decision logic."""
    model_config = ConfigDict(extra="forbid")

    case_id: str
    label: VerdictLabel
    summary: str  # Plain 2-sentence explanation at ~class 8 level
    confidence: float
    needs_human_review: bool
    reasons: List[str]  # List of Evidence IDs supporting the verdict


# ==============================================================================
# Consolidated Analysis & API Responses (Sections 10, 11)
# ==============================================================================

class AnalysisResult(BaseModel):
    """Complete analysis payload returned to the frontend (Section 10)."""
    model_config = ConfigDict(extra="forbid")

    case_id: str
    verdict: Verdict
    facts: ExtractedFacts
    rules: List[RuleResult]
    evidence: List[Evidence]
    money: MoneySummary
    deadlines: List[Deadline]
    letter_available: bool = False
    warnings: List[str] = Field(default_factory=list)


class ApiError(BaseModel):
    """Stable standardized error response {code, message, hint} (Section 11)."""
    model_config = ConfigDict(extra="forbid")

    code: str
    message: str
    hint: str

