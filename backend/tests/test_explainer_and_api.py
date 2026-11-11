"""Unit and integration tests for Explainer (FR9, Section 12, Section 18) and Cases API (Section 11)."""

import json
from pathlib import Path
import tempfile
from unittest.mock import patch

from fastapi.testclient import TestClient
import fitz  # PyMuPDF
import pytest

from backend.app.core.config import settings
from backend.app.core.errors import RateLimitError
from backend.app.main import app
from backend.app.models.db import (
    delete_case_completely,
    get_case,
    get_case_chunks,
    init_db,
)
from backend.app.models.schemas import (
    Deadline,
    DocumentKind,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    PolicyType,
    RejectionCategory,
    RuleOutcome,
    RuleResult,
    Verdict,
    VerdictLabel,
)
from backend.app.verdict.explainer import (
    check_banned_phrases,
    check_hallucinated_numbers,
    generate_deterministic_verdict_explanation,
    generate_verdict_explanation,
)

# TestClient instance
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database() -> None:
    """Ensure database schema is fresh and ready before each test."""
    init_db()


def _create_sample_pdf(text: str) -> bytes:
    """Generate a valid single-page PDF with given text."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# ==============================================================================
# Explainer Unit Tests (FR9, Section 12, Section 18)
# ==============================================================================

def test_banned_phrases_detection() -> None:
    """Verify Section 18 safety guardrail: detect prohibited phrases."""
    assert check_banned_phrases("We guarantee you will win your appeal.") is True
    assert check_banned_phrases("You will win this case in court.") is True
    assert check_banned_phrases("We represent you in all legal proceedings.") is True
    assert check_banned_phrases("This advice constitutes legal advice.") is True
    assert check_banned_phrases("It is certain that you are entitled to full settlement.") is True
    assert check_banned_phrases("There is a 100% chance of success.") is True

    # Benign text
    assert check_banned_phrases("Your claim appears to contradict policy waiting period terms.") is False
    assert check_banned_phrases("You have grounds to request a review by the grievance officer.") is False


def test_number_guard_allowed_and_hallucinated_numbers() -> None:
    """Verify Section 12 Number Guard: accept valid numbers, reject hallucinations."""
    facts = ExtractedFacts(
        insurer_name="Care Health Insurance Limited",
        claim_amount_inr=120000.0,
        continuous_coverage_months=49,
        ped_waiting_period_months=36,
        rejection_category=RejectionCategory.PED,
        rejection_reason_text="Repudiated under Clause 4.1",
    )
    rule_results = [
        RuleResult(
            case_id="case_01",
            rule_id="R1",
            name="PED waiting period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs={"continuous_coverage_months": 49, "ped_waiting_period_months": 36},
            explanation="Coverage of 49 months exceeds 36 months waiting period.",
            law_ref="IRDAI Master Circular 2024",
        )
    ]
    verified_evidence = [
        Evidence(
            id="ev_01",
            case_id="case_01",
            source_type=EvidenceSourceType.POLICY,
            source_ref="Clause 4.1",
            quote="Pre-existing diseases excluded for 36 months.",
            page=2,
            verified=True,
        )
    ]

    # Grounded text using valid numbers (120,000, 49, 36)
    valid_text = (
        "Your claim of ₹1,20,000 was wrongly rejected under the pre-existing disease clause. "
        "Your continuous coverage of 49 months exceeds the 36-month waiting period specified in your policy. "
        "You have strong grounds to submit a grievance appeal."
    )
    assert check_hallucinated_numbers(valid_text, facts, rule_results, verified_evidence) is False

    # Hallucinated numbers (₹95,000 and 72 months)
    hallucinated_text = (
        "Your claim of ₹95,000 was rejected. "
        "Your policy requires 72 months of coverage."
    )
    assert check_hallucinated_numbers(hallucinated_text, facts, rule_results, verified_evidence) is True


def test_explainer_fallback_when_banned_words_detected() -> None:
    """Verify explainer falls back to deterministic template when banned words appear in LLM text."""
    facts = ExtractedFacts(
        insurer_name="Care Health",
        claim_amount_inr=120000.0,
        continuous_coverage_months=49,
        ped_waiting_period_months=36,
        rejection_category=RejectionCategory.PED,
    )
    rule_results = [
        RuleResult(
            case_id="case_01",
            rule_id="R1",
            name="PED Waiting Period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs={"continuous_coverage_months": 49},
            explanation="Exceeds 36 months.",
        )
    ]

    banned_llm_response = "You will win this appeal. It is guaranteed that you get ₹1,20,000 back."

    with patch("backend.app.verdict.explainer.generate_text", return_value=banned_llm_response):
        explanation = generate_verdict_explanation(
            case_id="case_01",
            verdict_label=VerdictLabel.LIKELY_WRONGFUL,
            facts=facts,
            rule_results=rule_results,
            verified_evidence=[],
        )

    # Must NOT contain banned words
    assert "guaranteed" not in explanation.lower()
    assert "you will win" not in explanation.lower()
    # Must contain deterministic explanation elements
    assert "₹1,20,000" in explanation
    assert "49 months" in explanation


def test_explainer_fallback_when_hallucinated_numbers_detected() -> None:
    """Verify explainer falls back to deterministic template when hallucinated numbers appear."""
    facts = ExtractedFacts(
        insurer_name="Star Health",
        claim_amount_inr=50000.0,
        continuous_coverage_months=20,
        ped_waiting_period_months=36,
        rejection_category=RejectionCategory.PED,
    )
    rule_results = [
        RuleResult(
            case_id="case_02",
            rule_id="R1",
            name="PED Waiting Period",
            outcome=RuleOutcome.SUPPORTS_INSURER,
            inputs={"continuous_coverage_months": 20},
            explanation="Waiting period not completed.",
        )
    ]

    hallucinated_llm_response = "Your claim of ₹888,888 was rejected because of a 99-month waiting period."

    with patch("backend.app.verdict.explainer.generate_text", return_value=hallucinated_llm_response):
        explanation = generate_verdict_explanation(
            case_id="case_02",
            verdict_label=VerdictLabel.LIKELY_VALID,
            facts=facts,
            rule_results=rule_results,
            verified_evidence=[],
        )

    assert "888,888" not in explanation
    assert "99-month" not in explanation
    assert "₹50,000" in explanation


def test_deterministic_explainer_all_verdicts() -> None:
    """Verify deterministic explanations generate clean text across all 4 verdict labels."""
    facts = ExtractedFacts(
        insurer_name="HDFC ERGO",
        claim_amount_inr=85000.0,
        rejection_category=RejectionCategory.ROOM_RENT,
    )
    rules = []

    for label in VerdictLabel:
        text = generate_deterministic_verdict_explanation(label, facts, rules)
        assert len(text) > 30
        assert not check_banned_phrases(text)
        assert "₹85,000" in text or "HDFC ERGO" in text


# ==============================================================================
# API Endpoints Integration Tests (Section 11)
# ==============================================================================

def test_health_endpoint() -> None:
    """Verify GET /health returns standard 200 payload."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "clauseiq"}


def test_create_case_consent_validation() -> None:
    """Verify POST /cases validates consent flag (FR13) and returns standardized errors."""
    # Consent = False
    fail_res = client.post("/cases", json={"consent_given": False})
    assert fail_res.status_code == 400
    data = fail_res.json()
    assert data["code"] == "CONSENT_REQUIRED"
    assert "consent is required" in data["message"].lower()
    assert "hint" in data

    # Consent = True
    case_id = "test_case_api_consent_01"
    delete_case_completely(case_id)  # clean up if present
    success_res = client.post("/cases", json={"consent_given": True, "case_id": case_id})
    assert success_res.status_code == 201
    assert success_res.json() == {"case_id": case_id, "status": "CREATED"}

    # Duplicate case ID
    dup_res = client.post("/cases", json={"consent_given": True, "case_id": case_id})
    assert dup_res.status_code == 400
    assert dup_res.json()["code"] == "CASE_ALREADY_EXISTS"

    delete_case_completely(case_id)


def test_upload_policy_document_and_chunking() -> None:
    """Verify POST /cases/{id}/documents parses PDF, chunks policy, and persists to DB."""
    case_id = "test_case_doc_upload_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    policy_text = (
        "Clause 4.1: Pre-Existing Disease Waiting Period\n"
        "Expenses related to the treatment of a pre-existing disease (PED) shall be "
        "excluded until the expiry of 36 months of continuous coverage after the date of inception.\n\n"
        "Clause 4.2: Specific Illness Waiting Period\n"
        "Expenses related to treatment of listed conditions are excluded for 24 months."
    )
    pdf_bytes = _create_sample_pdf(policy_text)

    response = client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("policy.pdf", pdf_bytes, "application/pdf")},
        data={"kind": "POLICY"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == case_id
    assert data["filename"] == "policy.pdf"
    assert data["pages"] == 1
    assert data["kind"] == "POLICY"
    assert data["ocr_used"] is False

    # Verify Policy Chunks were extracted and saved into DB
    chunks = get_case_chunks(case_id)
    assert len(chunks) >= 1
    assert any("4.1" in c.clause_ref or "Waiting Period" in c.heading for c in chunks)

    delete_case_completely(case_id)


def test_upload_invalid_file_type() -> None:
    """Verify uploading an unsupported file format returns standardized INVALID_FILE_TYPE error."""
    case_id = "test_case_invalid_ext"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    response = client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("document.exe", b"fake binary", "application/octet-stream")},
        data={"kind": "POLICY"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "INVALID_FILE_TYPE"
    assert "hint" in data

    delete_case_completely(case_id)


def test_check_progress_endpoint() -> None:
    """Verify GET /cases/{id}/progress returns Section 5 progress tracking steps."""
    case_id = "test_case_progress_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    res = client.get(f"/cases/{case_id}/progress")
    assert res.status_code == 200
    data = res.json()
    assert data["case_id"] == case_id
    assert data["status"] == "CREATED"
    assert len(data["steps"]) == 6
    step_names = [s["name"] for s in data["steps"]]
    assert "Reading documents" in step_names
    assert "Finding key facts" in step_names
    assert "Locating clauses" in step_names
    assert "Checking rules" in step_names
    assert "Verifying evidence" in step_names
    assert "Writing explanation" in step_names

    # Check 404 for nonexistent case
    err_res = client.get("/cases/nonexistent_case_00000/progress")
    assert err_res.status_code == 404
    assert err_res.json()["code"] == "CASE_NOT_FOUND"

    delete_case_completely(case_id)


def test_delete_case_completely() -> None:
    """Verify DELETE /cases/{id} completely wipes case and document records (FR13)."""
    case_id = "test_case_delete_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    # Upload document
    pdf_bytes = _create_sample_pdf("Policy content.")
    client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("policy.pdf", pdf_bytes, "application/pdf")},
        data={"kind": "POLICY"},
    )

    # Ensure case exists
    assert get_case(case_id) is not None

    # Delete case
    del_res = client.delete(f"/cases/{case_id}")
    assert del_res.status_code == 200
    assert del_res.json() == {"deleted": True, "case_id": case_id}

    # Verify completely purged from SQLite
    assert get_case(case_id) is None

    # Secondary delete returns 404
    second_del = client.delete(f"/cases/{case_id}")
    assert second_del.status_code == 404
    assert second_del.json()["code"] == "CASE_NOT_FOUND"


def test_analyze_pipeline_end_to_end() -> None:
    """Verify POST /cases/{id}/analyze runs full pipeline and returns AnalysisResult."""
    case_id = "test_case_analyze_e2e"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    # Upload policy document
    policy_pdf = _create_sample_pdf(
        "Care Health Insurance Limited\n"
        "Policy No: 14285739/00/00\n"
        "Clause 4.1 Pre-Existing Disease Waiting Period\n"
        "Pre-existing diseases excluded until expiry of 36 months of continuous coverage.\n"
    )
    client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("policy.pdf", policy_pdf, "application/pdf")},
        data={"kind": "POLICY"},
    )

    # Upload rejection letter
    rejection_pdf = _create_sample_pdf(
        "Care Health Insurance Limited\n"
        "Rejection Letter: Claim No CLM-2024-984210\n"
        "Claim Amount: Rs. 1,20,000\n"
        "Repudiation reason: Repudiated under Clause 4.1 as patient has pre-existing hypertension.\n"
    )
    client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("rejection.pdf", rejection_pdf, "application/pdf")},
        data={"kind": "REJECTION_LETTER"},
    )

    mock_facts = ExtractedFacts(
        insurer_name="Care Health Insurance Limited",
        policy_number="14285739/00/00",
        claim_number="CLM-2024-984210",
        claim_amount_inr=120000.0,
        rejection_date="2024-06-15",
        rejection_category=RejectionCategory.PED,
        rejection_reason_text="Repudiated under Clause 4.1",
        cited_clause_ref="Clause 4.1",
        continuous_coverage_months=49,
        ped_waiting_period_months=36,
    )

    mock_verdict = Verdict(
        case_id=case_id,
        label=VerdictLabel.LIKELY_WRONGFUL,
        summary="",
        confidence=0.95,
        needs_human_review=False,
        reasons=["ev_01_ped_clause"],
    )
    mock_deadline = Deadline(
        case_id=case_id,
        kind="OMBUDSMAN_LIMIT",
        due_date="2025-06-15",
        status="UPCOMING",
    )

    with (
        patch("backend.app.api.cases.extract_case_facts", return_value=mock_facts),
        patch("backend.app.api.cases.decide_verdict", return_value=mock_verdict) as mock_decide,
        patch("backend.app.api.cases.evaluate_deadlines", return_value=[mock_deadline], create=True),
    ):
        res = client.post(f"/cases/{case_id}/analyze")

    assert res.status_code == 200
    mock_decide.assert_called_once()
    assert mock_decide.call_args.kwargs["case_id"] == case_id
    assert mock_decide.call_args.kwargs["facts"] == mock_facts
    assert "rules" in mock_decide.call_args.kwargs
    assert "evidence" in mock_decide.call_args.kwargs

    analysis = res.json()
    assert analysis["case_id"] == case_id
    assert analysis["verdict"]["label"] == "LIKELY_WRONGFUL"
    assert analysis["verdict"]["confidence"] == 0.95
    assert analysis["verdict"]["needs_human_review"] is False
    assert analysis["verdict"]["reasons"] == ["ev_01_ped_clause"]
    assert "₹1,20,000" in analysis["verdict"]["summary"]
    assert len(analysis["rules"]) >= 1
    assert analysis["rules"][0]["rule_id"] == "R1"
    assert analysis["rules"][0]["outcome"] == "CONTRADICTS_INSURER"
    assert analysis["money"]["claim_amount_inr"] == 120000.0
    assert len(analysis["deadlines"]) == 1
    assert analysis["deadlines"][0]["kind"] == "OMBUDSMAN_LIMIT"
    assert analysis["deadlines"][0]["due_date"] == "2025-06-15"

    # Verify progress indicates completed
    prog_res = client.get(f"/cases/{case_id}/progress")
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["status"] == "COMPLETED"
    assert all(s["status"] == "done" for s in prog_data["steps"])

    delete_case_completely(case_id)


def test_cors_allows_frontend_dev_origins() -> None:
    """Verify CORS allows both Lovable/Vite port 8080 and standard Vite port 5173."""
    assert "http://localhost:8080" in settings.cors_origin_list
    assert "http://localhost:5173" in settings.cors_origin_list

    for origin in ("http://localhost:8080", "http://localhost:5173"):
        res = client.options(
            "/cases",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == origin


def test_analyze_accepts_optional_manual_dates_and_tuple_extraction() -> None:
    """Verify POST /cases/{id}/analyze accepts optional manual dates and tuple output from extractor."""
    case_id = "test_case_manual_dates_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    policy_pdf = _create_sample_pdf(
        "Care Health Insurance Limited\nClause 4.1 Pre-Existing Disease Waiting Period 36 months.\n"
    )
    client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("policy.pdf", policy_pdf, "application/pdf")},
        data={"kind": "POLICY"},
    )

    mock_facts = ExtractedFacts(
        insurer_name="Care Health Insurance Limited",
        claim_amount_inr=120000.0,
        rejection_category=RejectionCategory.PED,
        ped_waiting_period_months=36,
    )
    extracted_ev = [
        Evidence(
            id="ev_extract_01",
            case_id=case_id,
            source_type=EvidenceSourceType.POLICY,
            source_ref="Clause 4.1",
            quote="Pre-Existing Disease Waiting Period 36 months",
            page=1,
            verified=False,
        )
    ]
    mock_verdict = Verdict(
        case_id=case_id,
        label=VerdictLabel.LIKELY_WRONGFUL,
        summary="",
        confidence=0.9,
        needs_human_review=False,
        reasons=["ev_extract_01"],
    )

    # Invalid manual date returns standardized error
    bad_res = client.post(
        f"/cases/{case_id}/analyze",
        json={"first_inception_date": "99/99/2020"},
    )
    assert bad_res.status_code == 400
    assert bad_res.json()["code"] == "INVALID_DATE"

    with (
        patch("backend.app.api.cases.extract_case_facts", return_value=(mock_facts, extracted_ev)),
        patch("backend.app.api.cases.decide_verdict", return_value=mock_verdict) as mock_decide,
        patch("backend.app.api.cases.evaluate_deadlines", return_value=[], create=True),
    ):
        res = client.post(
            f"/cases/{case_id}/analyze",
            json={
                "first_inception_date": "2020-04-15",
                "admission_date": "2024-05-20",
            },
        )

    assert res.status_code == 200
    analysis = res.json()
    assert analysis["facts"]["policy_first_inception_date"] == "2020-04-15"
    assert analysis["facts"]["admission_date"] == "2024-05-20"
    assert analysis["facts"]["continuous_coverage_months"] == 49
    assert mock_decide.call_args.kwargs["facts"].continuous_coverage_months == 49
    assert any(ev["id"] == "ev_extract_01" and ev["verified"] is True for ev in analysis["evidence"])

    delete_case_completely(case_id)


def test_analyze_preserves_rate_limit_429() -> None:
    """Verify RateLimitError propagates as HTTP 429 with {code, message, hint}."""
    case_id = "test_case_rate_limit_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    pdf_bytes = _create_sample_pdf("Policy text content for rate limit test.")
    client.post(
        f"/cases/{case_id}/documents",
        files={"file": ("policy.pdf", pdf_bytes, "application/pdf")},
        data={"kind": "POLICY"},
    )

    with patch("backend.app.api.cases.extract_case_facts", side_effect=RateLimitError()):
        res = client.post(f"/cases/{case_id}/analyze", json={})

    assert res.status_code == 429
    body = res.json()
    assert body["code"] == "AI_RATE_LIMIT"
    assert "message" in body and "hint" in body

    delete_case_completely(case_id)

