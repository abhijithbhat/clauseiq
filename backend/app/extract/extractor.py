"""Fact extractor for Indian health insurance claims using Gemini.

Implements FR4, Section 10, and Section 12:
- Formats document pages with explicit [DOC: ... | PAGE: ...] tags.
- Invokes model-agnostic generate_json with ExtractedFacts schema and temperature=0.0.
- Guarantees verbatim quote extraction in source_spans.
- Normalizes Indian dates (DD/MM/YYYY) into ISO YYYY-MM-DD.
- Deterministically computes continuous coverage months.
- Transforms source_spans into initial unverified Evidence instances.
"""

import datetime
import re
from typing import List, Optional, Tuple

from backend.app.core.llm_client import generate_json
from backend.app.models.schemas import (
    DocumentKind,
    DocumentPages,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
)


def normalize_indian_date(date_str: Optional[str]) -> Optional[str]:
    """Deterministically convert Indian dates (DD/MM/YYYY or DD-MM-YYYY) to ISO YYYY-MM-DD.

    Args:
        date_str: Date string in various common formats.

    Returns:
        ISO YYYY-MM-DD string, or original/None if invalid or absent.
    """
    if not date_str or not isinstance(date_str, str):
        return None

    cleaned = date_str.strip()
    if not cleaned:
        return None

    # Already ISO format: YYYY-MM-DD
    if re.match(r"^\d{4}-\d{2}-\d{2}$", cleaned):
        return cleaned

    # Common Indian format: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    match_dmy = re.match(r"^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$", cleaned)
    if match_dmy:
        d, m, y = int(match_dmy.group(1)), int(match_dmy.group(2)), int(match_dmy.group(3))
        # Basic sanity check
        if 1 <= d <= 31 and 1 <= m <= 12 and 1950 <= y <= 2100:
            return f"{y:04d}-{m:02d}-{d:02d}"

    # Alternate: YYYY/MM/DD or YYYY.MM.DD
    match_ymd = re.match(r"^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$", cleaned)
    if match_ymd:
        y, m, d = int(match_ymd.group(1)), int(match_ymd.group(2)), int(match_ymd.group(3))
        if 1 <= d <= 31 and 1 <= m <= 12 and 1950 <= y <= 2100:
            return f"{y:04d}-{m:02d}-{d:02d}"

    return cleaned


def compute_continuous_coverage_months(
    first_inception: Optional[str],
    admission: Optional[str],
    portability_months: Optional[int] = 0,
) -> Optional[int]:
    """Calculate whole months of continuous cover between first inception and admission.

    Args:
        first_inception: First inception date (ISO or Indian date).
        admission: Hospital admission date (ISO or Indian date).
        portability_months: Continuity credit months carried over via portability.

    Returns:
        Whole completed months of continuous cover, or None if dates are absent/invalid.
    """
    if not first_inception or not admission:
        return None

    norm_start = normalize_indian_date(first_inception)
    norm_end = normalize_indian_date(admission)
    if not norm_start or not norm_end:
        return None

    try:
        d_start = datetime.date.fromisoformat(norm_start)
        d_end = datetime.date.fromisoformat(norm_end)
    except ValueError:
        return None

    if d_end < d_start:
        return 0

    months = (d_end.year - d_start.year) * 12 + (d_end.month - d_start.month)
    if d_end.day < d_start.day:
        months -= 1

    credit = portability_months if portability_months is not None else 0
    return max(0, months + credit)


def format_documents_for_extraction(documents: List[DocumentPages]) -> str:
    """Format document pages into labeled text blocks with explicit page identifiers."""
    sections: List[str] = []
    for doc in documents:
        for page_num in sorted(doc.text_by_page.keys()):
            page_text = (doc.text_by_page[page_num] or "").strip()
            if page_text:
                header = f"[DOC: {doc.kind.value} | FILENAME: {doc.filename} | PAGE: {page_num}]"
                sections.append(f"{header}\n{page_text}")
    return "\n\n".join(sections)


def _convert_source_spans_to_evidence(
    case_id: str, facts: ExtractedFacts
) -> List[Evidence]:
    """Convert every extracted source span into an unverified Evidence item."""
    evidence_items: List[Evidence] = []
    for field_name, span in facts.source_spans.items():
        # Map DocumentKind to EvidenceSourceType
        if span.document == DocumentKind.POLICY:
            source_type = EvidenceSourceType.POLICY
        elif span.document == DocumentKind.REJECTION_LETTER:
            source_type = EvidenceSourceType.LETTER
        else:
            source_type = EvidenceSourceType.LETTER

        ev_id = f"ev_{case_id}_{field_name}"
        evidence_items.append(
            Evidence(
                id=ev_id,
                case_id=case_id,
                source_type=source_type,
                source_ref=f"Fact: {field_name}",
                quote=span.quote,
                page=span.page,
                verified=False,  # Unverified until Module M6 verifier runs
            )
        )
    return evidence_items


def build_extraction_prompt(doc_text: str) -> str:
    """Construct the strict extraction prompt adhering to Sections 10 and 12."""
    return f"""You are the senior fact extraction engine for ClauseIQ, an assistive platform for Indian health insurance claims.
Extract structured facts from the uploaded claim documents below into JSON conforming to ExtractedFacts.

EXTRACTION INSTRUCTIONS (SECTIONS 8, 10 & 12):
1. Verbatim Quotes:
   - For every extracted field, you MUST include an entry in `source_spans[field_name]`.
   - The `quote` MUST be an EXACT, verbatim, character-for-character substring of the document text. Do NOT reword or extrapolate.
   - Record the exact `page` number and `document` kind (POLICY, REJECTION_LETTER, DISCHARGE, OTHER).
2. Dates:
   - Extract Indian dates (DD/MM/YYYY) and convert them to ISO format (YYYY-MM-DD).
   - If a date is not stated, return null. Never guess or infer dates.
3. Money Amounts:
   - Extract numbers as floats in INR (e.g. 120000.0). Do not include currency symbols.
4. Pre-Existing Disease (PED) & Fraud (R1, R2, R3):
   - `ped_alleged`: boolean if insurer states or alleges pre-existing disease, else null.
   - `ped_waiting_period_months`: integer months of PED waiting period in policy (typically 36 or 48).
   - `diagnosis_date`: date of diagnosis from discharge summary or rejection letter (YYYY-MM-DD).
   - `prior_symptoms_or_consultation_evidence`: boolean if medical history shows prior consultation before policy start.
   - `fraud_alleged`: boolean if insurer alleges fraud or intentional misrepresentation.
   - `fraud_established`: boolean, true only if insurer provides documentary proof of established fraud, distinct from mere allegation.
   - `continuous_coverage_months`: integer whole months of continuous cover if explicitly stated in schedule.
   - `portability_continuity_months`: portability credit months if mentioned.
   - `sum_insured_inr`: total current sum insured (float in INR).
   - `base_sum_insured_inr`: original base sum insured before any enhancement (float in INR).
   - `sum_insured_enhanced_recently`: boolean if sum insured was increased in recent renewal.
   - `sum_insured_enhancement_date`: date when sum insured was increased/enhanced (YYYY-MM-DD).
   - `sum_insured_enhancement_amount_inr`: added sum insured amount (float in INR) for separate 60-month moratorium calculation.
5. Waiting Periods & Accidents (R4, R5):
   - `initial_waiting_period_days`: initial waiting days in policy (typically 30).
   - `specific_illness_waiting_months`: waiting months for named ailments in policy (typically 24).
   - `named_ailment_matched`: name of specific illness if cited by insurer.
   - `is_accident_case`: boolean, true if hospitalisation resulted from accident or emergency trauma.
6. Room Rent & Deductions (R6):
   - `has_room_rent_proportionate_clause`: boolean, true if policy allows proportionate deduction on room rent.
   - `room_rent_limit_per_day_inr` and `room_rent_actual_per_day_inr`.
   - `associated_medical_charges_inr`: doctor fees, OT charges subject to room proportionate cut.
   - `non_associated_charges_inr`: pharmacy, implants, consumables exempt from proportionate cut.
   - `room_rent_deduction_inr`: deduction amount under room rent clause.
7. Documents & Deadlines (R8, R9, R10):
   - `claim_intimation_date`: date claim was notified to insurer/TPA (YYYY-MM-DD).
   - `policy_intimation_window_days`: allowed days in policy clause for intimation (e.g. 30 days).
   - `documents_requested_list`: list of specific missing documents requested.
   - `grievance_sent_date`: date grievance letter was sent to GRO (YYYY-MM-DD), or null if not yet sent.
   - `grievance_received_date`: date insurer received the grievance representation (YYYY-MM-DD) per Rule 14 of Ombudsman Rules 2017.
   - `grievance_reply_status`: Default to "UNKNOWN" unless uploaded document text EXPLICITLY states:
     * "REPLY_RECEIVED": text explicitly states that a grievance reply was received from the insurer (also extract `grievance_reply_received_date` if stated).
     * "AWAITING_REPLY": text explicitly states that a grievance representation is currently pending reply from the insurer.
     * "CONFIRMED_NO_RESPONSE": text explicitly states or confirms with a supporting record that the insurer failed to respond.
     Never infer "CONFIRMED_NO_RESPONSE" from elapsed time or the absence of a reply document, and do NOT calculate 14-day TAT or 1-calendar-month Ombudsman deadlines (those belong strictly to the deterministic R9 rule engine).
8. Missing Facts:
   - If any fact is absent from the documents, return null. Do NOT assume or invent facts.
9. Rejection reason:
   - `rejection_reason_text`: Extract the exact verbatim repudiation sentence from the rejection letter.
   - `cited_clause_ref`: The clause number/name cited (e.g. "Clause 4.1").
   - `rejection_category`: Choose from [PED, NON_DISCLOSURE, WAITING_PERIOD, NON_PAYABLE_OR_DEDUCTION, ROOM_RENT, DOCUMENTS_OR_DELAY, OTHER].

DOCUMENTS:
{doc_text}
"""


def extract_case_facts(
    case_id: str,
    documents: List[DocumentPages],
    model: Optional[str] = None,
) -> Tuple[ExtractedFacts, List[Evidence]]:
    """Extract structured facts and build initial evidence from document pages.

    Args:
        case_id: The case identifier.
        documents: List of parsed DocumentPages objects.
        model: Optional model override.

    Returns:
        Tuple of (ExtractedFacts, list[Evidence]).
    """
    doc_text = format_documents_for_extraction(documents)
    prompt = build_extraction_prompt(doc_text)

    # Call LLM through model-agnostic client with ExtractedFacts schema
    facts = generate_json(
        prompt=prompt,
        schema=ExtractedFacts,
        model=model,
        case_id=case_id,
    )

    # Deterministic date post-processing: guarantee ISO YYYY-MM-DD format
    facts.rejection_date = normalize_indian_date(facts.rejection_date)
    facts.policy_first_inception_date = normalize_indian_date(facts.policy_first_inception_date)
    facts.current_period_start = normalize_indian_date(facts.current_period_start)
    facts.current_period_end = normalize_indian_date(facts.current_period_end)
    facts.admission_date = normalize_indian_date(facts.admission_date)
    facts.discharge_date = normalize_indian_date(facts.discharge_date)
    facts.diagnosis_date = normalize_indian_date(facts.diagnosis_date)
    facts.sum_insured_enhancement_date = normalize_indian_date(facts.sum_insured_enhancement_date)
    facts.claim_intimation_date = normalize_indian_date(facts.claim_intimation_date)
    facts.grievance_sent_date = normalize_indian_date(facts.grievance_sent_date)
    facts.grievance_received_date = normalize_indian_date(facts.grievance_received_date)
    facts.grievance_reply_received_date = normalize_indian_date(facts.grievance_reply_received_date)

    # Deterministic continuous coverage month computation fallback
    if facts.continuous_coverage_months is None:
        computed_months = compute_continuous_coverage_months(
            first_inception=facts.policy_first_inception_date,
            admission=facts.admission_date,
            portability_months=facts.portability_continuity_months,
        )
        facts.continuous_coverage_months = computed_months

    # Transform all source spans into initial unverified Evidence instances
    evidence_items = _convert_source_spans_to_evidence(case_id, facts)

    return facts, evidence_items
