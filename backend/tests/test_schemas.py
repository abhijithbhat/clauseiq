"""Unit tests for ClauseIQ shared Pydantic v2 schemas and mock case fixture."""

import json
from pathlib import Path
import pytest
from pydantic import ValidationError

from backend.app.models.schemas import (
    AnalysisResult,
    ApiError,
    ClaimType,
    Deadline,
    DisallowedItem,
    DocumentKind,
    DocumentPages,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    GrievanceReplyStatus,
    MoneySummary,
    PolicyChunk,
    PolicyType,
    RejectionCategory,
    RuleOutcome,
    RuleResult,
    SourceSpan,
    Verdict,
    VerdictLabel,
)


def get_mock_case_01_path() -> Path:
    """Resolve absolute path to mock case 01 expected.json."""
    base_dir = Path(__file__).resolve().parent.parent.parent
    return base_dir / "data" / "mock_cases" / "case_01" / "expected.json"


def test_mock_case_01_validates_as_analysis_result() -> None:
    """Ensure mock case 01 conforms 100% to the AnalysisResult schema."""
    fixture_path = get_mock_case_01_path()
    assert fixture_path.exists(), f"Fixture file not found at {fixture_path}"

    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    result = AnalysisResult.model_validate(data)

    # Validate top-level analysis result
    assert result.case_id == "case_01"
    assert result.letter_available is True
    assert result.warnings == []

    # Validate verdict
    assert result.verdict.label == VerdictLabel.LIKELY_WRONGFUL
    assert result.verdict.confidence == 0.95
    assert result.verdict.needs_human_review is False
    assert len(result.verdict.reasons) == 2

    # Validate extracted facts
    assert result.facts.insurer_name == "Care Health Insurance Limited"
    assert result.facts.policy_type == PolicyType.INDIVIDUAL
    assert result.facts.claim_type == ClaimType.REIMBURSEMENT
    assert result.facts.claim_amount_inr == 120000.0
    assert result.facts.rejection_category == RejectionCategory.PED
    assert result.facts.policy_first_inception_date == "2020-04-15"
    assert result.facts.admission_date == "2024-05-20"
    assert result.facts.discharge_date == "2024-05-24"
    assert result.facts.ped_waiting_period_months == 36
    assert result.facts.continuous_coverage_months == 49
    assert result.facts.diagnosis_date == "2024-05-18"
    assert result.facts.is_accident_case is False
    assert result.facts.has_room_rent_proportionate_clause is True
    assert result.facts.associated_medical_charges_inr == 80000.0
    assert result.facts.claim_intimation_date == "2024-05-21"
    assert result.facts.base_sum_insured_inr == 500000.0
    assert result.facts.sum_insured_enhancement_date is None
    assert result.facts.sum_insured_enhancement_amount_inr is None
    assert result.facts.fraud_established is False
    assert result.facts.grievance_received_date == "2024-06-22"
    assert result.facts.grievance_reply_status == GrievanceReplyStatus.UNKNOWN
    assert len(result.facts.disallowed_items) == 1
    assert result.facts.disallowed_items[0].amount_inr == 120000.0

    # Validate rules output
    assert len(result.rules) == 1
    rule_r1 = result.rules[0]
    assert rule_r1.rule_id == "R1"
    assert rule_r1.outcome == RuleOutcome.CONTRADICTS_INSURER
    assert rule_r1.inputs["continuous_cover_months"] == 49
    assert rule_r1.inputs["policy_waiting_months"] == 36
    assert rule_r1.supporting_evidence_ids == ["ev_01_ped_clause", "ev_02_repudiation_notice"]

    # Validate evidence
    assert len(result.evidence) == 2
    assert all(e.verified is True for e in result.evidence)
    assert result.evidence[0].source_type == EvidenceSourceType.POLICY
    assert result.evidence[1].source_type == EvidenceSourceType.LETTER

    # Validate money summary
    assert result.money.claim_amount_inr == 120000.0
    assert result.money.settled_amount_inr == 0.0
    assert result.money.disallowed_amount_inr == 120000.0

    # Validate deadlines
    assert len(result.deadlines) == 2
    assert result.deadlines[0].kind == "GRIEVANCE_REPLY_WINDOW"
    assert result.deadlines[1].kind == "OMBUDSMAN_LIMIT"


def test_extracted_facts_schema_validation() -> None:
    """Ensure ExtractedFacts parses standalone and validates source spans."""
    fixture_path = get_mock_case_01_path()
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    facts = ExtractedFacts.model_validate(data["facts"])
    assert facts.policy_number == "14285739/00/00"
    assert "policy_number" in facts.source_spans
    span = facts.source_spans["policy_number"]
    assert span.document == DocumentKind.POLICY
    assert span.page == 1
    assert span.quote == "Policy No: 14285739/00/00"


def test_serialization_roundtrip() -> None:
    """Ensure AnalysisResult serializes to dict and deserializes cleanly without data loss."""
    fixture_path = get_mock_case_01_path()
    with open(fixture_path, "r", encoding="utf-8") as f:
        original_data = json.load(f)

    model = AnalysisResult.model_validate(original_data)
    dumped = model.model_dump(mode="json")
    reloaded = AnalysisResult.model_validate(dumped)

    assert reloaded == model


def test_schema_forbids_extra_fields() -> None:
    """Ensure strict contract validation: models must reject unknown/extraneous fields."""
    fixture_path = get_mock_case_01_path()
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    data_with_extra = dict(data)
    data_with_extra["hallucinated_legal_statute"] = "IRDAI Section 9999"

    with pytest.raises(ValidationError):
        AnalysisResult.model_validate(data_with_extra)


def test_api_error_schema() -> None:
    """Ensure ApiError complies with {code, message, hint} contract from Section 11."""
    err = ApiError(
        code="UNREADABLE_FILE",
        message="The uploaded document has no readable text layer.",
        hint="Please ensure the file is not password protected or re-upload a higher quality scan.",
    )
    assert err.code == "UNREADABLE_FILE"
    assert "password" in err.hint


def test_policy_chunk_and_document_pages() -> None:
    """Ensure document ingestion contracts can be instantiated cleanly."""
    chunk = PolicyChunk(
        id="chunk_01",
        case_id="case_01",
        clause_ref="Clause 4.1",
        heading="Pre-existing Diseases",
        text="Expenses related to PED excluded for 36 months.",
        page_start=7,
        page_end=8,
    )
    assert chunk.page_end == 8

    pages = DocumentPages(
        case_id="case_01",
        kind=DocumentKind.POLICY,
        filename="care_policy.pdf",
        pages=12,
        text_by_page={1: "Welcome to Care", 2: "Schedule"},
        ocr_used=False,
    )
    assert pages.ocr_used is False
    assert len(pages.text_by_page) == 2


def test_grievance_reply_status_and_supporting_evidence_defaults() -> None:
    """Ensure grievance_reply_status defaults to UNKNOWN with 4 states and supporting_evidence_ids defaults to []."""
    facts = ExtractedFacts()
    assert facts.grievance_reply_status == GrievanceReplyStatus.UNKNOWN
    assert facts.grievance_reply_status.value == "UNKNOWN"

    # Verify all 4 states
    assert GrievanceReplyStatus.REPLY_RECEIVED.value == "REPLY_RECEIVED"
    assert GrievanceReplyStatus.AWAITING_REPLY.value == "AWAITING_REPLY"
    assert GrievanceReplyStatus.CONFIRMED_NO_RESPONSE.value == "CONFIRMED_NO_RESPONSE"
    assert GrievanceReplyStatus.UNKNOWN.value == "UNKNOWN"

    rule = RuleResult(
        case_id="case_test",
        rule_id="R1",
        name="Test Rule",
        outcome=RuleOutcome.SUPPORTS_INSURER,
        inputs={},
        explanation="Test explanation",
    )
    assert rule.supporting_evidence_ids == []
    assert isinstance(rule.supporting_evidence_ids, list)

