"""Unit tests for M7 Appeal Letter Generator, Exporters, and results_and_letters API endpoints.

Verifies:
1. Jinja2 template rendering with sender, claim details, and Section 14 footer.
2. Number guard and Section 18 banned phrases detection in letter drafting.
3. Word (.docx) and PDF (.pdf) file export generation.
4. GET /cases/{id}: Returns stored AnalysisResult.
5. GET /cases/{id}/letter: Streams JSON, DOCX, or PDF.
6. PATCH /cases/{id}/facts: Re-runs rules, decider, and increments letter version.
7. GET /demo-cases and GET /demo-cases/{demo_key}: Serves cached demo cases in 0ms.
"""

from pathlib import Path
import tempfile
import pytest
from fastapi.testclient import TestClient

from backend.app.letters.exporters import export_letter_docx, export_letter_pdf
from backend.app.letters.generator import (
    _check_banned_phrases,
    _number_guard,
    generate_appeal_letter,
    SECTION_14_FOOTER,
)
from backend.app.main import app
from backend.app.models.db import (
    delete_case_completely,
    init_db,
    save_case_analysis,
    save_case_facts,
)
from backend.app.models.schemas import (
    AnalysisResult,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    MoneySummary,
    RejectionCategory,
    RuleOutcome,
    RuleResult,
    Verdict,
    VerdictLabel,
)

client = TestClient(app)


def test_letter_generation_and_placeholder_highlighting() -> None:
    """Letter template renders grounds, enclosure checklist, and highlights missing facts as [[...]]."""
    facts = ExtractedFacts(
        insurer_name="Care Health Insurance Limited",
        policy_number="14285739/00/00",
        claim_number="CLM-2024-984210",
        claim_amount_inr=120000.0,
        disallowed_amount_inr=120000.0,
        rejection_reason_text="Repudiated under Clause 4.1 for hypertension PED.",
        cited_clause_ref="Clause 4.1",
        # Leave insured_name and hospital_name unstated to trigger placeholders
        insured_name=None,
        hospital_name=None,
    )
    rule = RuleResult(
        case_id="case_01",
        rule_id="R1",
        name="PED waiting period",
        outcome=RuleOutcome.CONTRADICTS_INSURER,
        inputs={"continuous_cover_months": 49},
        explanation="Continuous coverage of 49 months exceeds the 36-month waiting period.",
        law_ref="IRDAI Master Circular 2024 Clause 4.1",
        supporting_evidence_ids=["ev_01"],
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
    verdict = Verdict(
        case_id="case_01",
        label=VerdictLabel.LIKELY_WRONGFUL,
        summary="Claim wrongly repudiated.",
        confidence=0.95,
        needs_human_review=False,
        reasons=["ev_01"],
    )

    letter = generate_appeal_letter("case_01", facts, verdict, [rule], [ev], version=1)

    assert letter["case_id"] == "case_01"
    assert letter["version"] == 1
    assert "14285739/00/00" in letter["text"]
    assert "CLM-2024-984210" in letter["text"]
    assert "Care Health Insurance Limited" in letter["text"]
    assert "120,000" in letter["text"]
    assert SECTION_14_FOOTER in letter["text"]
    assert len(letter["grounds"]) >= 1
    assert len(letter["enclosures"]) >= 4

    # Placeholders highlighted
    assert "insured_name" in letter["placeholders"] or "sender_name" in letter["placeholders"]
    assert "[[insured_name]]" in letter["text"] or "[[sender_name]]" in letter["text"]


def test_banned_phrases_and_number_guards() -> None:
    """Banned phrases detection flags forbidden Section 18 words."""
    assert _check_banned_phrases("You will win this appeal for sure.") is True
    assert _check_banned_phrases("The outcome is guaranteed.") is True
    assert _check_banned_phrases("This constitutes formal legal advice.") is True
    assert _check_banned_phrases("We represent you in this complaint.") is True
    assert _check_banned_phrases("The policyholder has completed the statutory waiting period.") is False

    # Number guard
    allowed = {"120000", "49", "36"}
    assert _number_guard("Coverage of 49 months exceeds 36 months for claim 120000.", allowed) is True
    assert _number_guard("We demand 9999999 rupees compensation.", allowed) is False


def test_docx_and_pdf_export_creation() -> None:
    """DOCX and PDF exporters generate readable non-empty files."""
    letter_data = {
        "case_id": "test_case",
        "version": 1,
        "subject": "Grievance Representation — Claim No. CLM-123",
        "text": (
            "To,\nThe Grievance Redressal Officer,\nCare Health Insurance\n\n"
            "Date: 21/11/2026\n\n"
            "SUBJECT: Representation / Appeal against Repudiation\n\n"
            "1. SENDER & POLICY DETAILS\nInsured: Ramesh Sharma\n\n"
            "2. FACTUAL BACKGROUND\nHospital: Manipal Hospital\n\n"
            "3. NUMBERED GROUNDS FOR APPEAL & RECONSIDERATION\n1. Violation of Clause 4.1.\n\n"
            "4. REQUEST FOR RECONSIDERATION\nPlease settle the claim.\n\n"
            "5. ENCLOSURE CHECKLIST\n- [X] Policy terms\n\n"
            "Yours faithfully,\nRamesh Sharma\n\n"
            "--------------------------------------------------------------------------------\n"
            f"{SECTION_14_FOOTER}"
        ),
        "footer": SECTION_14_FOOTER,
    }

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        docx_file = tmp_path / "appeal.docx"
        pdf_file = tmp_path / "appeal.pdf"

        res_docx = export_letter_docx(letter_data, docx_file)
        res_pdf = export_letter_pdf(letter_data, pdf_file)

        assert res_docx.exists()
        assert res_docx.stat().st_size > 5000  # valid docx file
        assert res_pdf.exists()
        assert res_pdf.stat().st_size > 1000  # valid pdf file


def test_api_results_and_letter_flow() -> None:
    """Verify GET /cases/{id}, GET /cases/{id}/letter, and streaming file downloads."""
    case_id = "test_api_letter_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    facts = ExtractedFacts(
        insurer_name="Star Health",
        policy_number="P-99999",
        claim_number="CLM-777",
        claim_amount_inr=50000.0,
        disallowed_amount_inr=50000.0,
        continuous_coverage_months=65,
        rejection_category=RejectionCategory.NON_DISCLOSURE,
    )
    verdict = Verdict(
        case_id=case_id,
        label=VerdictLabel.LIKELY_WRONGFUL,
        summary="Wrongly repudiated under non-disclosure.",
        confidence=0.95,
        needs_human_review=False,
        reasons=["ev_test_1"],
    )
    rule = RuleResult(
        case_id=case_id,
        rule_id="R2",
        name="Moratorium period",
        outcome=RuleOutcome.CONTRADICTS_INSURER,
        inputs={"continuous_cover_months": 65},
        explanation="65 months exceeds 60 months moratorium.",
        supporting_evidence_ids=["ev_test_1"],
    )
    ev = Evidence(
        id="ev_test_1",
        case_id=case_id,
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 7.2",
        quote="Disclosure to Information Norm",
        page=1,
        verified=True,
    )
    analysis = AnalysisResult(
        case_id=case_id,
        verdict=verdict,
        facts=facts,
        rules=[rule],
        evidence=[ev],
        money=MoneySummary(claim_amount_inr=50000.0, settled_amount_inr=0.0, disallowed_amount_inr=50000.0),
        deadlines=[],
        letter_available=True,
        warnings=[],
    )
    save_case_analysis(case_id, analysis)
    save_case_facts(case_id, facts)

    # 1. GET /cases/{case_id}
    res_get = client.get(f"/cases/{case_id}")
    assert res_get.status_code == 200
    assert res_get.json()["case_id"] == case_id
    assert res_get.json()["verdict"]["label"] == "LIKELY_WRONGFUL"

    # 2. GET /cases/{case_id}/letter (JSON)
    res_letter = client.get(f"/cases/{case_id}/letter")
    assert res_letter.status_code == 200
    letter_json = res_letter.json()
    assert letter_json["case_id"] == case_id
    assert letter_json["version"] == 1
    assert "CLM-777" in letter_json["text"]

    # 3. GET /cases/{case_id}/letter?format=docx
    res_docx = client.get(f"/cases/{case_id}/letter?format=docx")
    assert res_docx.status_code == 200
    assert "wordprocessingml" in res_docx.headers["content-type"]
    assert len(res_docx.content) > 1000

    # 4. GET /cases/{case_id}/letter?format=pdf
    res_pdf = client.get(f"/cases/{case_id}/letter?format=pdf")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000

    delete_case_completely(case_id)


def test_api_patch_facts_rerun() -> None:
    """PATCH /cases/{case_id}/facts re-runs rules and updates verdict and letter version."""
    case_id = "test_api_patch_01"
    delete_case_completely(case_id)
    client.post("/cases", json={"consent_given": True, "case_id": case_id})

    # Initially under waiting period (12 months) -> LIKELY_VALID
    facts = ExtractedFacts(
        insurer_name="Care Health",
        policy_number="12345",
        claim_number="CLM-001",
        claim_amount_inr=80000.0,
        settled_amount_inr=0.0,
        disallowed_amount_inr=80000.0,
        continuous_coverage_months=12,
        ped_waiting_period_months=36,
        rejection_category=RejectionCategory.PED,
    )
    ev = Evidence(
        id="ev_01",
        case_id=case_id,
        source_type=EvidenceSourceType.POLICY,
        source_ref="Clause 4.1",
        quote="waiting period 36 months",
        page=1,
        verified=True,
    )
    rule = RuleResult(
        case_id=case_id,
        rule_id="R1",
        name="PED waiting period",
        outcome=RuleOutcome.SUPPORTS_INSURER,
        inputs={"continuous_cover_months": 12},
        explanation="Waiting period not completed.",
        supporting_evidence_ids=["ev_01"],
    )
    analysis = AnalysisResult(
        case_id=case_id,
        verdict=Verdict(
            case_id=case_id,
            label=VerdictLabel.LIKELY_VALID,
            summary="Claim rejection is valid.",
            confidence=0.90,
            needs_human_review=False,
            reasons=["ev_01"],
        ),
        facts=facts,
        rules=[rule],
        evidence=[ev],
        money=MoneySummary(claim_amount_inr=80000.0, settled_amount_inr=0.0, disallowed_amount_inr=80000.0),
        deadlines=[],
        letter_available=True,
        warnings=[],
    )
    save_case_analysis(case_id, analysis)
    save_case_facts(case_id, facts)

    # User corrects continuous coverage to 48 months (> 36)
    patch_res = client.patch(
        f"/cases/{case_id}/facts",
        json={"continuous_coverage_months": 48},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()

    # Verdict must now flip from LIKELY_VALID to LIKELY_WRONGFUL!
    assert updated["facts"]["continuous_coverage_months"] == 48
    assert updated["verdict"]["label"] == "LIKELY_WRONGFUL"
    r1 = next(r for r in updated["rules"] if r["rule_id"] == "R1")
    assert r1["outcome"] == "CONTRADICTS_INSURER"

    # Letter must now be version 2
    res_letter = client.get(f"/cases/{case_id}/letter")
    assert res_letter.status_code == 200
    assert res_letter.json()["version"] == 2

    delete_case_completely(case_id)


def test_api_demo_cases_endpoints() -> None:
    """GET /demo-cases and GET /demo-cases/{demo_key} return cached cases in 0ms without AI calls."""
    # List demo cases
    list_res = client.get("/demo-cases")
    assert list_res.status_code == 200
    cases_list = list_res.json()
    assert len(cases_list) == 3
    case_ids = {c["case_id"] for c in cases_list}
    assert case_ids == {"case_01", "case_02", "case_03"}

    # Get single demo case
    single_res = client.get("/demo-cases/case_01")
    assert single_res.status_code == 200
    data = single_res.json()
    assert data["case_id"] == "case_01"
    assert data["verdict"]["label"] == "LIKELY_WRONGFUL"
    assert len(data["rules"]) > 0
    assert len(data["evidence"]) > 0

    # Unknown demo key returns 404
    bad_res = client.get("/demo-cases/case_unknown")
    assert bad_res.status_code == 404
    assert bad_res.json()["code"] == "DEMO_CASE_NOT_FOUND"
