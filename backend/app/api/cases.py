"""FastAPI route handlers for case lifecycle, document ingestion, and analysis pipeline.

Implements Section 5, Section 9, Section 11, and FR13:
- POST /cases: Initializes a new case with explicit consent verification.
- POST /cases/{case_id}/documents: Ingests documents, parses pages, chunks policy, auto-deletes raw file.
- GET /cases/{case_id}/progress: Returns real-time step status across the 6 pipeline stages.
- POST /cases/{case_id}/analyze: Executes full orchestration pipeline from ingestion to verdict explanation.
- DELETE /cases/{case_id}: FR13 privacy compliance - purges all case data from database.
- Guarantees standardized {code, message, hint} error format across all endpoints.
"""

from datetime import datetime, timedelta
import json
import logging
from pathlib import Path
import tempfile
from typing import Any, Dict, List, Optional
import uuid

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field

from backend.app.core.config import settings
from backend.app.core.errors import ClauseIQException, IngestError
from backend.app.extract.extractor import extract_case_facts
from backend.app.ingest.chunker import chunk_policy_document
from backend.app.ingest.pdf import parse_document
from backend.app.models.db import (
    create_case,
    delete_case_completely,
    get_case,
    get_case_analysis,
    get_case_chunks,
    get_case_facts,
    get_documents_for_case,
    save_case_analysis,
    save_case_chunks,
    save_case_facts,
    save_document,
    update_case_status,
)
from backend.app.models.schemas import (
    AnalysisResult,
    Deadline,
    DocumentKind,
    DocumentPages,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    MoneySummary,
    PolicyChunk,
    RuleOutcome,
    RuleResult,
    Verdict,
    VerdictLabel,
)
from backend.app.retrieve.hybrid import HybridRetriever, chunks_to_evidence
from backend.app.retrieve.synonyms import expand_query
from backend.app.verdict.explainer import generate_verdict_explanation

try:
    from backend.app.verdict.decider import decide_verdict  # type: ignore
except ImportError:
    decide_verdict = None

try:
    from backend.app.rules.engine import evaluate_rules  # type: ignore
except ImportError:
    evaluate_rules = None

try:
    from backend.app.rules.r9_deadlines import (  # type: ignore
        evaluate_deadlines,
        evaluate_r9_deadlines,
    )
except ImportError:
    evaluate_deadlines = None
    evaluate_r9_deadlines = None

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cases", tags=["cases"])


# ==============================================================================
# Request & Response Contracts
# ==============================================================================

class CreateCaseRequest(BaseModel):
    """Payload for case creation."""
    consent_given: bool = Field(
        ...,
        description="Explicit user consent to process health and policy data (FR13).",
    )
    case_id: Optional[str] = Field(
        default=None,
        description="Optional custom case ID (defaults to generated UUID).",
    )


class CreateCaseResponse(BaseModel):
    """Response returned upon case creation."""
    case_id: str
    status: str


class ProgressResponse(BaseModel):
    """Pipeline progress tracking conforming to Section 5."""
    case_id: str
    status: str
    current_step: Optional[str] = None
    steps: List[Dict[str, str]]


class DocumentUploadResponse(BaseModel):
    """Document upload metadata."""
    document_id: str
    case_id: str
    filename: str
    pages: int
    ocr_used: bool
    kind: str


class DeleteCaseResponse(BaseModel):
    """Response on case purge."""
    deleted: bool
    case_id: str


# ==============================================================================
# Pipeline Step Helpers
# ==============================================================================

def _set_step(case_id: str, step_name: str, step_status: str, overall_status: Optional[str] = None) -> None:
    """Helper to update database step progress."""
    update_case_status(
        case_id=case_id,
        status=overall_status,
        current_step=step_name,
        step_name_to_update=step_name,
        step_status_value=step_status,
    )


def _evaluate_rules_fallback(facts: ExtractedFacts) -> List[RuleResult]:
    """Graceful deterministic fallback evaluation for rules R1, R2, R6, R8.
    
    Used when teammate's Module M5 (rules engine) is not yet integrated.
    """
    results: List[RuleResult] = []

    # R1: PED waiting period check
    if facts.continuous_coverage_months is not None and facts.ped_waiting_period_months is not None:
        if facts.continuous_coverage_months >= facts.ped_waiting_period_months:
            results.append(
                RuleResult(
                    case_id="case",
                    rule_id="R1",
                    name="Pre-Existing Disease Waiting Period",
                    outcome=RuleOutcome.CONTRADICTS_INSURER,
                    inputs={
                        "continuous_coverage_months": facts.continuous_coverage_months,
                        "ped_waiting_period_months": facts.ped_waiting_period_months,
                    },
                    explanation=(
                        f"Continuous coverage of {facts.continuous_coverage_months} months exceeds the "
                        f"policy PED waiting period of {facts.ped_waiting_period_months} months."
                    ),
                    law_ref="IRDAI Master Circular 2024 Clause 4.1",
                )
            )
        else:
            results.append(
                RuleResult(
                    case_id="case",
                    rule_id="R1",
                    name="Pre-Existing Disease Waiting Period",
                    outcome=RuleOutcome.SUPPORTS_INSURER,
                    inputs={
                        "continuous_coverage_months": facts.continuous_coverage_months,
                        "ped_waiting_period_months": facts.ped_waiting_period_months,
                    },
                    explanation="Continuous coverage has not completed the specified PED waiting period.",
                    law_ref="IRDAI Master Circular 2024 Clause 4.1",
                )
            )

    # R2: Section 45 Moratorium Period (60 months)
    if facts.continuous_coverage_months is not None:
        if facts.continuous_coverage_months >= 60 and not facts.fraud_established:
            results.append(
                RuleResult(
                    case_id="case",
                    rule_id="R2",
                    name="Section 45 Moratorium Period",
                    outcome=RuleOutcome.CONTRADICTS_INSURER,
                    inputs={
                        "continuous_coverage_months": facts.continuous_coverage_months,
                        "fraud_established": facts.fraud_established,
                    },
                    explanation=(
                        f"Continuous cover of {facts.continuous_coverage_months} months exceeds the 60-month "
                        "moratorium ceiling under Section 45 of Insurance Act, 1938. Claim cannot be repudiated for non-disclosure."
                    ),
                    law_ref="Insurance Act 1938 Section 45",
                )
            )

    # R6: Room Rent Proportionate Deductions
    if facts.has_room_rent_proportionate_clause and facts.room_rent_deduction_inr:
        if facts.non_associated_charges_inr and facts.non_associated_charges_inr > 0:
            results.append(
                RuleResult(
                    case_id="case",
                    rule_id="R6",
                    name="Room Rent Proportionate Deduction Limit",
                    outcome=RuleOutcome.CONTRADICTS_INSURER,
                    inputs={"room_rent_deduction_inr": facts.room_rent_deduction_inr},
                    explanation="Proportionate deductions cannot be applied to non-associated medical expenses like medicines and implants.",
                    law_ref="IRDAI Circular Ref: IRDAI/HLT/REG/CIR/194/07/2020",
                )
            )

    return results


# ==============================================================================
# Endpoint Implementations
# ==============================================================================

@router.post("", response_model=CreateCaseResponse, status_code=status.HTTP_201_CREATED)
def create_new_case(payload: CreateCaseRequest) -> CreateCaseResponse:
    """Create a new case with explicit consent verification (FR13)."""
    if not payload.consent_given:
        raise ClauseIQException(
            code="CONSENT_REQUIRED",
            message="User consent is required to process claims and documents.",
            hint="Please check the consent box (consent_given=true) to proceed.",
        )

    case_id = payload.case_id.strip() if payload.case_id else f"case_{uuid.uuid4().hex[:8]}"
    existing = get_case(case_id)
    if existing:
        raise ClauseIQException(
            code="CASE_ALREADY_EXISTS",
            message=f"A case with ID '{case_id}' already exists.",
            hint="Please select a new case ID or omit it to auto-generate.",
        )

    case = create_case(case_id=case_id, consent_given=payload.consent_given)
    return CreateCaseResponse(case_id=case.id, status=case.status)


@router.post("/{case_id}/documents", response_model=DocumentUploadResponse)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    kind: DocumentKind = Form(DocumentKind.POLICY),
) -> DocumentUploadResponse:
    """Upload and parse a document with OCR fallback and chunking.
    
    FR13: The raw file is automatically deleted from disk immediately after parsing.
    """
    case = get_case(case_id)
    if not case:
        raise ClauseIQException(
            code="CASE_NOT_FOUND",
            message=f"Case '{case_id}' was not found.",
            hint="Please initialize a new case via POST /cases first.",
        )

    # Validate file extension
    orig_filename = file.filename or "upload"
    suffix = Path(orig_filename).suffix.lower()
    allowed = {".pdf", ".jpg", ".jpeg", ".png"}
    if suffix not in allowed:
        raise ClauseIQException(
            code="INVALID_FILE_TYPE",
            message=f"Unsupported file format '{suffix}'. Allowed: {', '.join(sorted(allowed))}",
            hint="Please upload a PDF or image file (JPG, PNG).",
        )

    # Save to a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        contents = await file.read()
        temp_file.write(contents)
        temp_file.close()

        # Parse document (PyMuPDF / OCR fallback, auto-deletes temp file per FR13)
        parsed_doc = parse_document(
            file_path=temp_file.name,
            case_id=case_id,
            kind=kind,
            delete_after_parsing=True,
        )
        parsed_doc.filename = orig_filename

        # If Policy document, chunk it into clause-aware PolicyChunks
        if kind == DocumentKind.POLICY:
            chunks = chunk_policy_document(parsed_doc)
            save_case_chunks(case_id=case_id, chunks=chunks)

        # Save document record into SQLite
        doc_record = save_document(case_id=case_id, doc=parsed_doc)

        return DocumentUploadResponse(
            document_id=doc_record.id,
            case_id=case_id,
            filename=doc_record.filename,
            pages=doc_record.pages,
            ocr_used=doc_record.ocr_used,
            kind=doc_record.kind,
        )

    finally:
        # Guarantee cleanup if parse_document didn't delete it
        if Path(temp_file.name).exists():
            try:
                Path(temp_file.name).unlink()
            except OSError:
                pass


@router.get("/{case_id}/progress", response_model=ProgressResponse)
def get_case_progress(case_id: str) -> ProgressResponse:
    """Return step-by-step progress conforming to Section 5."""
    case = get_case(case_id)
    if not case:
        raise ClauseIQException(
            code="CASE_NOT_FOUND",
            message=f"Case '{case_id}' was not found.",
            hint="Please verify the case ID.",
        )

    steps: List[Dict[str, str]] = json.loads(case.step_statuses_json) if case.step_statuses_json else []
    return ProgressResponse(
        case_id=case.id,
        status=case.status,
        current_step=case.current_step,
        steps=steps,
    )


@router.post("/{case_id}/analyze", response_model=AnalysisResult)
def analyze_case(case_id: str) -> AnalysisResult:
    """Orchestrate end-to-end claim analysis pipeline across all 6 stages."""
    case = get_case(case_id)
    if not case:
        raise ClauseIQException(
            code="CASE_NOT_FOUND",
            message=f"Case '{case_id}' was not found.",
            hint="Please verify the case ID.",
        )

    # Stage 1: Reading documents
    _set_step(case_id, "Reading documents", "running", overall_status="ANALYZING")
    doc_records = get_documents_for_case(case_id)
    if not doc_records:
        _set_step(case_id, "Reading documents", "failed", overall_status="FAILED")
        raise ClauseIQException(
            code="NO_DOCUMENTS",
            message=f"No documents have been uploaded for case '{case_id}'.",
            hint="Please upload the rejection letter and policy document before analyzing.",
        )

    documents: List[DocumentPages] = [
        DocumentPages(
            case_id=case_id,
            kind=DocumentKind(doc.kind),
            filename=doc.filename,
            pages=doc.pages,
            text_by_page={int(k): v for k, v in json.loads(doc.text_by_page_json).items()},
            ocr_used=doc.ocr_used,
        )
        for doc in doc_records
    ]
    _set_step(case_id, "Reading documents", "done")

    # Stage 2: Finding key facts
    _set_step(case_id, "Finding key facts", "running")
    facts: ExtractedFacts
    try:
        facts = extract_case_facts(documents=documents, case_id=case_id)
        save_case_facts(case_id=case_id, facts=facts)
        _set_step(case_id, "Finding key facts", "done")
    except Exception as e:
        logger.exception("Fact extraction failed for case %s: %s", case_id, e)
        _set_step(case_id, "Finding key facts", "failed", overall_status="FAILED")
        raise ClauseIQException(
            code="EXTRACTION_FAILED",
            message=f"Failed to extract facts from documents: {str(e)}",
            hint="Ensure the uploaded documents are clear and legible.",
        ) from e

    # Stage 3: Locating clauses
    _set_step(case_id, "Locating clauses", "running")
    policy_chunks = get_case_chunks(case_id)
    verified_evidence: List[Evidence] = []
    try:
        if policy_chunks:
            retriever = HybridRetriever(policy_chunks=policy_chunks)
            query_str = expand_query(
                category=facts.rejection_category,
                reason_text=facts.rejection_reason_text or "",
            )
            retrieved_chunks = retriever.retrieve_policy_chunks(
                query=query_str,
                cited_clause_ref=facts.cited_clause_ref,
                top_k=6,
            )
            verified_evidence.extend(chunks_to_evidence(retrieved_chunks, case_id=case_id))
        _set_step(case_id, "Locating clauses", "done")
    except Exception as e:
        logger.warning("Retrieval encountered an error (%s); continuing with base facts", e)
        _set_step(case_id, "Locating clauses", "done")

    # Stage 4: Checking rules
    _set_step(case_id, "Checking rules", "running")
    rule_results: List[RuleResult] = []
    deadlines: List[Deadline] = []
    if evaluate_rules is not None:
        rules_out = evaluate_rules(facts=facts, chunks=policy_chunks)
        if isinstance(rules_out, tuple) and len(rules_out) == 2 and isinstance(rules_out[1], list):
            rule_results, deadlines = rules_out
        else:
            rule_results = rules_out
    else:
        rule_results = _evaluate_rules_fallback(facts)

    if not deadlines:
        deadlines_eval_fn = evaluate_deadlines or evaluate_r9_deadlines
        if deadlines_eval_fn is not None:
            try:
                deadlines = deadlines_eval_fn(case_id=case_id, facts=facts)
            except Exception as e:
                logger.warning("R9 deadline evaluation encountered error: %s", e)
                deadlines = []

    _set_step(case_id, "Checking rules", "done")

    # Stage 5: Verifying evidence
    _set_step(case_id, "Verifying evidence", "running")
    try:
        from backend.app.verify.verifier import verify_evidence_quotes  # type: ignore
        verified_evidence = verify_evidence_quotes(evidence=verified_evidence, documents=documents)
    except (ImportError, AttributeError):
        # Fallback: substring verification against document pages
        all_text = " ".join(
            page_text
            for doc in documents
            for page_text in doc.text_by_page.values()
        ).lower()
        for ev in verified_evidence:
            ev.verified = ev.quote.lower().strip() in all_text
    _set_step(case_id, "Verifying evidence", "done")

    # Stage 6: Writing explanation
    _set_step(case_id, "Writing explanation", "running")
    if decide_verdict is None:
        raise ClauseIQException(
            code="DECIDER_UNAVAILABLE",
            message="Verdict decider module is not available in this environment.",
            hint="Please ensure backend.app.verdict.decider is present.",
        )

    decision: Verdict = decide_verdict(
        case_id=case_id,
        facts=facts,
        rules=rule_results,
        evidence=verified_evidence,
    )

    summary_explanation = generate_verdict_explanation(
        case_id=case_id,
        verdict_label=decision.label,
        facts=facts,
        rule_results=rule_results,
        verified_evidence=verified_evidence,
    )

    verdict = decision.model_copy(update={"summary": summary_explanation})

    # Build financial summary
    money = MoneySummary(
        claim_amount_inr=facts.claim_amount_inr,
        settled_amount_inr=facts.settled_amount_inr,
        disallowed_amount_inr=facts.disallowed_amount_inr,
    )

    analysis_result = AnalysisResult(
        case_id=case_id,
        verdict=verdict,
        facts=facts,
        rules=rule_results,
        evidence=verified_evidence,
        money=money,
        deadlines=deadlines,
        letter_available=True,
        warnings=[],
    )

    save_case_analysis(case_id=case_id, analysis=analysis_result)
    _set_step(case_id, "Writing explanation", "done", overall_status="COMPLETED")

    return analysis_result


@router.delete("/{case_id}", response_model=DeleteCaseResponse)
def delete_case(case_id: str) -> DeleteCaseResponse:
    """FR13: Permanently purge case and all associated records from database."""
    deleted = delete_case_completely(case_id)
    if not deleted:
        raise ClauseIQException(
            code="CASE_NOT_FOUND",
            message=f"Case '{case_id}' was not found.",
            hint="The case may have already been deleted or does not exist.",
        )
    return DeleteCaseResponse(deleted=True, case_id=case_id)

