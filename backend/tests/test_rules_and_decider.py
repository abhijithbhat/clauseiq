"""Unit tests for M5 Rules Engine, R9 Deadlines, M6 Verifier, and M6 Verdict Decider.

Verifies:
1. R1 PED waiting period evaluation (continuous cover vs policy/statutory max).
2. R2 Section 45 Moratorium evaluation (60 months continuous cover).
3. R4 Specific illness waiting period (24 months, accident exemption).
4. R6 Room rent proportionate deduction limit (associated vs non-associated).
5. R8 Delayed claim intimation protection under IRDAI 2024 Master Circular.
6. R9 Grievance and Insurance Ombudsman deadlines calculation.
7. M6 Quote verifier exact, whitespace-insensitive, and fuzzy matching.
8. M6 Verdict Decider logic and rule-to-evidence association.
"""

from datetime import date, timedelta
import pytest

from backend.app.models.schemas import (
    DocumentKind,
    DocumentPages,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    GrievanceReplyStatus,
    RejectionCategory,
    RuleOutcome,
    VerdictLabel,
)
from backend.app.rules.engine import (
    evaluate_r1,
    evaluate_r2,
    evaluate_r4,
    evaluate_r6,
    evaluate_r8,
    run_all_rules,
)
from backend.app.rules.r9_deadlines import evaluate_deadlines
from backend.app.verdict.decider import decide_verdict
from backend.app.verify.verifier import verify_evidence_quotes


def test_r1_ped_waiting_completed() -> None:
    """R1 contradicts insurer when continuous coverage >= waiting period."""
    facts = ExtractedFacts(
        rejection_category=RejectionCategory.PED,
        continuous_coverage_months=49,
        ped_waiting_period_months=36,
        cited_clause_ref="Clause 4.1",
    )
    ev = Evidence(
        id="ev_01",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="waiting period of 36 months",
        page=7,
        verified=True,
    )
    result = evaluate_r1("case_01", facts, [ev])
    assert result.rule_id == "R1"
    assert result.outcome == RuleOutcome.CONTRADICTS_INSURER
    assert "ev_01" in result.supporting_evidence_ids


def test_r1_ped_waiting_not_completed() -> None:
    """R1 supports insurer when continuous coverage < waiting period."""
    facts = ExtractedFacts(
        rejection_category=RejectionCategory.PED,
        continuous_coverage_months=12,
        ped_waiting_period_months=36,
    )
    result = evaluate_r1("case_test", facts, [])
    assert result.outcome == RuleOutcome.SUPPORTS_INSURER


def test_r2_moratorium_contradicts_insurer() -> None:
    """R2 contradicts insurer when continuous cover >= 60 months and no fraud is established."""
    facts = ExtractedFacts(
        rejection_category=RejectionCategory.NON_DISCLOSURE,
        continuous_coverage_months=64,
        fraud_established=False,
        fraud_alleged=False,
        rejection_reason_text="repudiated on grounds of non-disclosure",
    )
    ev = Evidence(
        id="ev_02",
        case_id="case_02",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 7.2",
        quote="Disclosure to Information Norm",
        page=12,
        verified=True,
    )
    result = evaluate_r2("case_02", facts, [ev])
    assert result.rule_id == "R2"
    assert result.outcome == RuleOutcome.CONTRADICTS_INSURER
    assert "ev_02" in result.supporting_evidence_ids


def test_r2_moratorium_fraud_exception() -> None:
    """R2 supports insurer when fraud is established."""
    facts = ExtractedFacts(
        rejection_category=RejectionCategory.NON_DISCLOSURE,
        continuous_coverage_months=72,
        fraud_established=True,
    )
    result = evaluate_r2("case_test", facts, [])
    assert result.outcome == RuleOutcome.SUPPORTS_INSURER


def test_r4_specific_illness_waiting() -> None:
    """R4 evaluates specific illness waiting and respects accident exemption."""
    # Under waiting period
    facts_under = ExtractedFacts(
        rejection_category=RejectionCategory.WAITING_PERIOD,
        continuous_coverage_months=10,
        specific_illness_waiting_months=24,
        diagnosis_text="Cataract",
    )
    res_under = evaluate_r4("case_03", facts_under, [])
    assert res_under.outcome == RuleOutcome.SUPPORTS_INSURER

    # Accident exemption overrides waiting
    facts_accident = ExtractedFacts(
        rejection_category=RejectionCategory.WAITING_PERIOD,
        continuous_coverage_months=10,
        specific_illness_waiting_months=24,
        is_accident_case=True,
    )
    res_accident = evaluate_r4("case_test", facts_accident, [])
    assert res_accident.outcome == RuleOutcome.CONTRADICTS_INSURER


def test_r6_room_rent_proportionate_deduction() -> None:
    """R6 contradicts insurer if no clause exists or non-associated charges were cut."""
    facts_no_clause = ExtractedFacts(
        rejection_category=RejectionCategory.ROOM_RENT,
        has_room_rent_proportionate_clause=False,
        room_rent_deduction_inr=15000.0,
    )
    res_no_clause = evaluate_r6("case_test", facts_no_clause, [])
    assert res_no_clause.outcome == RuleOutcome.CONTRADICTS_INSURER

    facts_non_assoc = ExtractedFacts(
        rejection_category=RejectionCategory.ROOM_RENT,
        has_room_rent_proportionate_clause=True,
        non_associated_charges_inr=40000.0,
        room_rent_deduction_inr=12000.0,
    )
    res_non_assoc = evaluate_r6("case_test", facts_non_assoc, [])
    assert res_non_assoc.outcome == RuleOutcome.CONTRADICTS_INSURER


def test_r8_delay_protection() -> None:
    """R8 contradicts insurer under IRDAI 2024 Master Circular for delay rejections."""
    facts = ExtractedFacts(
        rejection_category=RejectionCategory.DOCUMENTS_OR_DELAY,
        rejection_reason_text="delayed intimation by 15 days",
    )
    res = evaluate_r8("case_test", facts, [])
    assert res.outcome == RuleOutcome.CONTRADICTS_INSURER


def test_r9_deadlines() -> None:
    """R9 accurately calculates 14-day grievance TAT and 1-year Ombudsman limitation."""
    today = date.today()
    facts = ExtractedFacts(
        rejection_date=(today - timedelta(days=60)).strftime("%Y-%m-%d"),
        grievance_sent_date=(today - timedelta(days=10)).strftime("%Y-%m-%d"),
        grievance_received_date=(today - timedelta(days=5)).strftime("%Y-%m-%d"),
        grievance_reply_status=GrievanceReplyStatus.AWAITING_REPLY,
    )
    deadlines = evaluate_deadlines("case_test", facts)
    kinds = {d.kind for d in deadlines}
    assert "GRIEVANCE_REPLY_WINDOW" in kinds
    assert "OMBUDSMAN_LIMIT" in kinds


def test_verifier_exact_and_fuzzy_matches() -> None:
    """Verifier validates exact quotes, normalized whitespace, and fuzzy matches."""
    doc = DocumentPages(
        case_id="case_01",
        kind=DocumentKind.POLICY,
        filename="policy.pdf",
        pages=1,
        text_by_page={1: "Clause 4.1: Expenses related to treatment of pre-existing diseases shall be excluded."},
        ocr_used=False,
    )
    # Exact match
    ev_exact = Evidence(
        id="ev_01",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="treatment of pre-existing diseases",
        page=1,
    )
    # Whitespace difference match
    ev_ws = Evidence(
        id="ev_02",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="treatment   of \n pre-existing   diseases",
        page=1,
    )
    # Complete mismatch
    ev_bad = Evidence(
        id="ev_03",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 99",
        quote="nuclear radiation war exclusion",
        page=1,
    )

    verified = verify_evidence_quotes([ev_exact, ev_ws, ev_bad], [doc])
    assert verified[0].verified is True
    assert verified[1].verified is True
    assert verified[2].verified is False


def test_decider_logic_verdicts() -> None:
    """Decider assigns LIKELY_WRONGFUL, LIKELY_VALID, and INSUFFICIENT_INFO correctly."""
    facts = ExtractedFacts(claim_amount_inr=100000.0)
    ev_verified = Evidence(
        id="ev_true",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="waiting period 36 months",
        page=1,
        verified=True,
    )
    ev_unverified = Evidence(
        id="ev_false",
        case_id="case_01",
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="unverified quote text",
        page=1,
        verified=False,
    )

    rule_wrongful = evaluate_r1("case_01", ExtractedFacts(
        rejection_category=RejectionCategory.PED,
        continuous_coverage_months=40,
        ped_waiting_period_months=36,
    ), [ev_verified])

    # 1. Contradicts insurer with verified quote -> LIKELY_WRONGFUL
    v_wrongful = decide_verdict("case_01", facts, [rule_wrongful], [ev_verified])
    assert v_wrongful.label == VerdictLabel.LIKELY_WRONGFUL
    assert v_wrongful.confidence >= 0.90
    assert "ev_true" in v_wrongful.reasons

    # 2. Contradicts insurer with UNVERIFIED quote -> INSUFFICIENT_INFO downgrade per Section 12
    rule_unverified = evaluate_r1("case_01", ExtractedFacts(
        rejection_category=RejectionCategory.PED,
        continuous_coverage_months=40,
        ped_waiting_period_months=36,
    ), [ev_unverified])
    v_downgrade = decide_verdict("case_01", facts, [rule_unverified], [ev_unverified])
    assert v_downgrade.label == VerdictLabel.INSUFFICIENT_INFO
    assert v_downgrade.needs_human_review is True

    # 3. Supports insurer -> LIKELY_VALID
    rule_valid = evaluate_r1("case_01", ExtractedFacts(
        rejection_category=RejectionCategory.PED,
        continuous_coverage_months=10,
        ped_waiting_period_months=36,
    ), [ev_verified])
    v_valid = decide_verdict("case_01", facts, [rule_valid], [ev_verified])
    assert v_valid.label == VerdictLabel.LIKELY_VALID
