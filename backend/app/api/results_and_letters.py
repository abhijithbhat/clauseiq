"""FastAPI route handlers for Case Results, Letter Preview/Export, Facts Re-Run, and Demo Cases.

Implements Section 11, Section 14, FR10, FR12, and FR14:
- GET /cases/{case_id}: Retrieves the persisted AnalysisResult.
- GET /cases/{case_id}/letter: Returns generated appeal letter JSON or streams DOCX/PDF file download.
- PATCH /cases/{case_id}/facts: Merges edited key facts (FR12), re-executes rules, verifier, decider,
  explainer, and letter generation, returning the updated AnalysisResult.
- GET /demo-cases: Lists the 3 flagship demo cases in 0ms without AI calls (FR14).
- GET /demo-cases/{demo_key}: Serves cached AnalysisResult for the demo case in 0ms.
"""

from datetime import datetime
import json
import logging
from pathlib import Path
import re
import tempfile
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from backend.app.core.errors import ClauseIQException
from backend.app.extract.extractor import (
    compute_continuous_coverage_months,
    normalize_indian_date,
)
from backend.app.letters.exporters import export_letter_docx, export_letter_pdf
from backend.app.letters.generator import generate_appeal_letter
from backend.app.models.db import (
    get_case,
    get_case_analysis,
    get_case_chunks,
    get_case_facts,
    get_case_letter,
    save_case_analysis,
    save_case_facts,
    save_case_letter,
)
from backend.app.models.schemas import (
    AnalysisResult,
    Deadline,
    ExtractedFacts,
    GrievanceReplyStatus,
    MoneySummary,
    RuleResult,
    Verdict,
)
from backend.app.rules.engine import run_all_rules
from backend.app.verdict.decider import decide_verdict
from backend.app.verdict.explainer import generate_verdict_explanation
from backend.app.verify.verifier import verify_evidence_quotes

logger = logging.getLogger(__name__)

router = APIRouter(tags=["results_and_letters"])

MOCK_CASES_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "mock_cases"


def _clean_slug(text: Optional[str], fallback: str) -> str:
    val = (text or "").strip()
    if not val or val.lower() in ("not stated", "not specified"):
        val = fallback
    return re.sub(r"[^A-Za-z0-9]+", "-", val)


# ==============================================================================
# 1. Result & Letter Endpoints (FR10 / Section 14)
# ==============================================================================

@router.get("/cases/{case_id}", response_model=AnalysisResult)
def get_case_result(case_id: str) -> AnalysisResult:
    """Return the completed AnalysisResult for a case."""
    analysis = get_case_analysis(case_id)
    if not analysis:
        case = get_case(case_id)
        if not case:
            raise ClauseIQException(
                code="CASE_NOT_FOUND",
                message=f"Case '{case_id}' was not found.",
                hint="Please verify the case ID or start a new case.",
            )
        raise ClauseIQException(
            code="ANALYSIS_NOT_FOUND",
            message=f"Analysis has not completed for case '{case_id}'.",
            hint="Please run POST /cases/{case_id}/analyze first.",
        )
    return analysis


@router.get("/cases/{case_id}/letter")
def get_case_appeal_letter(
    case_id: str,
    format: Optional[str] = Query(default=None, description="Format to stream: docx, pdf, or json (default)."),
):
    """Return the generated letter JSON, or stream Word (.docx) / PDF (.pdf) file download."""
    analysis = get_case_analysis(case_id)
    if not analysis:
        case = get_case(case_id)
        if not case:
            raise ClauseIQException(
                code="CASE_NOT_FOUND",
                message=f"Case '{case_id}' was not found.",
                hint="Please verify the case ID.",
            )
        raise ClauseIQException(
            code="ANALYSIS_NOT_FOUND",
            message=f"Analysis for case '{case_id}' has not been performed yet.",
            hint="Analyze the case before fetching or downloading the appeal letter.",
        )

    letter_data = get_case_letter(case_id)
    if not letter_data:
        letter_data = generate_appeal_letter(
            case_id=case_id,
            facts=analysis.facts,
            verdict=analysis.verdict,
            rule_results=analysis.rules,
            verified_evidence=analysis.evidence,
            version=1,
        )
        save_case_letter(case_id, letter_data)

    claim_slug = _clean_slug(analysis.facts.claim_number, case_id)
    version = letter_data.get("version", 1)

    if format == "docx":
        temp_dir = tempfile.mkdtemp()
        docx_path = Path(temp_dir) / f"ClauseIQ_Appeal_{claim_slug}_v{version}.docx"
        export_letter_docx(letter_data, docx_path)
        return FileResponse(
            path=str(docx_path),
            filename=f"ClauseIQ_Appeal_{claim_slug}_v{version}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    if format == "pdf":
        temp_dir = tempfile.mkdtemp()
        pdf_path = Path(temp_dir) / f"ClauseIQ_Appeal_{claim_slug}_v{version}.pdf"
        export_letter_pdf(letter_data, pdf_path)
        return FileResponse(
            path=str(pdf_path),
            filename=f"ClauseIQ_Appeal_{claim_slug}_v{version}.pdf",
            media_type="application/pdf",
        )

    return letter_data


# ==============================================================================
# 2. Editable Key Facts Re-Run Endpoint (FR12)
# ==============================================================================

class PatchFactsRequest(BaseModel):
    """Payload for partial fact correction / re-analysis."""
    policy_first_inception_date: Optional[str] = None
    admission_date: Optional[str] = None
    continuous_coverage_months: Optional[int] = None
    grievance_sent_date: Optional[str] = None
    grievance_received_date: Optional[str] = None
    grievance_reply_status: Optional[GrievanceReplyStatus] = None
    claim_amount_inr: Optional[float] = None
    claim_amount: Optional[float] = None
    ped_waiting_period_months: Optional[int] = None


@router.patch("/cases/{case_id}/facts", response_model=AnalysisResult)
def patch_case_facts_and_rerun(case_id: str, payload: PatchFactsRequest) -> AnalysisResult:
    """FR12: Update user-corrected facts and re-run rules, decider, explainer, and letter."""
    existing_analysis = get_case_analysis(case_id)
    stored_facts = get_case_facts(case_id)

    if not existing_analysis and not stored_facts:
        case = get_case(case_id)
        if not case:
            raise ClauseIQException(
                code="CASE_NOT_FOUND",
                message=f"Case '{case_id}' was not found.",
                hint="Please start a new case.",
            )
        raise ClauseIQException(
            code="ANALYSIS_NOT_FOUND",
            message=f"Case '{case_id}' has not been analysed yet.",
            hint="Run initial analysis before patching facts.",
        )

    facts = stored_facts or existing_analysis.facts
    evidence = existing_analysis.evidence if existing_analysis else []
    chunks = get_case_chunks(case_id)

    # Apply partial updates with ISO date normalization
    dates_changed = False
    if payload.policy_first_inception_date is not None:
        norm_date = normalize_indian_date(payload.policy_first_inception_date)
        facts.policy_first_inception_date = norm_date
        dates_changed = True

    if payload.admission_date is not None:
        norm_date = normalize_indian_date(payload.admission_date)
        facts.admission_date = norm_date
        dates_changed = True

    if payload.continuous_coverage_months is not None:
        facts.continuous_coverage_months = payload.continuous_coverage_months
    elif dates_changed and facts.policy_first_inception_date and facts.admission_date:
        facts.continuous_coverage_months = compute_continuous_coverage_months(
            first_inception=facts.policy_first_inception_date,
            admission=facts.admission_date,
            portability_months=facts.portability_continuity_months,
        )

    if payload.grievance_sent_date is not None:
        facts.grievance_sent_date = normalize_indian_date(payload.grievance_sent_date)

    if payload.grievance_received_date is not None:
        facts.grievance_received_date = normalize_indian_date(payload.grievance_received_date)

    if payload.grievance_reply_status is not None:
        facts.grievance_reply_status = payload.grievance_reply_status

    claim_amt = payload.claim_amount_inr if payload.claim_amount_inr is not None else payload.claim_amount
    if claim_amt is not None:
        facts.claim_amount_inr = claim_amt
        facts.disallowed_amount_inr = max(0.0, claim_amt - (facts.settled_amount_inr or 0.0))

    if payload.ped_waiting_period_months is not None:
        facts.ped_waiting_period_months = payload.ped_waiting_period_months

    # Re-run Rules Engine (M5)
    rule_results, deadlines = run_all_rules(
        case_id=case_id,
        facts=facts,
        evidence=evidence,
        chunks=chunks,
    )

    # Re-run Verdict Decider (M6)
    decision: Verdict = decide_verdict(
        case_id=case_id,
        facts=facts,
        rules=rule_results,
        evidence=evidence,
    )

    # Re-run Explainer
    summary_explanation = generate_verdict_explanation(
        case_id=case_id,
        verdict_label=decision.label,
        facts=facts,
        rule_results=rule_results,
        verified_evidence=evidence,
    )
    verdict = decision.model_copy(update={"summary": summary_explanation})

    # Update Letter (increment version)
    prior_letter = get_case_letter(case_id) or {}
    new_version = prior_letter.get("version", 1) + 1
    letter_data = generate_appeal_letter(
        case_id=case_id,
        facts=facts,
        verdict=verdict,
        rule_results=rule_results,
        verified_evidence=evidence,
        version=new_version,
    )
    save_case_letter(case_id, letter_data)

    # Financial Summary
    money = MoneySummary(
        claim_amount_inr=facts.claim_amount_inr,
        settled_amount_inr=facts.settled_amount_inr,
        disallowed_amount_inr=facts.disallowed_amount_inr,
    )

    updated_analysis = AnalysisResult(
        case_id=case_id,
        verdict=verdict,
        facts=facts,
        rules=rule_results,
        evidence=evidence,
        money=money,
        deadlines=deadlines,
        letter_available=True,
        warnings=[],
    )

    save_case_facts(case_id, facts)
    save_case_analysis(case_id, updated_analysis)

    return updated_analysis


# ==============================================================================
# 3. Flagship Demo Cases Endpoints (FR14 / 0ms cached)
# ==============================================================================

@router.get("/demo-cases")
def list_demo_cases() -> List[Dict[str, Any]]:
    """FR14: Return all pre-computed demo cases in 0ms without invoking AI."""
    demo_cases = []
    for case_id in ("case_01", "case_02", "case_03"):
        expected_path = MOCK_CASES_DIR / case_id / "expected.json"
        if expected_path.exists():
            try:
                with open(expected_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                facts = data.get("facts", {})
                verdict = data.get("verdict", {})
                demo_cases.append(
                    {
                        "case_id": case_id,
                        "title": f"Demo Case {case_id.split('_')[-1]}",
                        "insurer": facts.get("insurer_name", "Insurer"),
                        "claim_number": facts.get("claim_number", "CLM-000"),
                        "claim_amount": facts.get("claim_amount_inr", 0.0),
                        "rejection_category": facts.get("rejection_category", "OTHER"),
                        "verdict_label": verdict.get("label", "LIKELY_WRONGFUL"),
                        "summary": verdict.get("summary", ""),
                    }
                )
            except Exception as e:
                logger.warning("Error reading demo case %s: %s", case_id, e)
    return demo_cases


@router.get("/demo-cases/{demo_key}", response_model=AnalysisResult)
def get_demo_case_by_key(demo_key: str) -> AnalysisResult:
    """FR14: Return full cached AnalysisResult for the demo case."""
    normalized_key = demo_key if demo_key.startswith("case_") else f"case_{demo_key.zfill(2)}"
    expected_path = MOCK_CASES_DIR / normalized_key / "expected.json"

    if not expected_path.exists():
        raise ClauseIQException(
            code="DEMO_CASE_NOT_FOUND",
            message=f"Demo case '{demo_key}' was not found.",
            hint="Available demo keys: case_01, case_02, case_03.",
        )

    with open(expected_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return AnalysisResult.model_validate(data)
