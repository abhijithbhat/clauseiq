"""Fact extractor for Indian health insurance claims using Gemini.

Implements FR4, Section 10, and Section 12:
- Formats document pages with explicit [DOC: ... | PAGE: ...] tags.
- Invokes model-agnostic generate_json with ExtractedFacts schema and temperature=0.0.
- Guarantees verbatim quote extraction in source_spans.
- Normalizes Indian dates (DD/MM/YYYY) into ISO YYYY-MM-DD.
- Transforms source_spans into initial unverified Evidence instances.
"""

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
Extract structured facts from the uploaded claim documents below.

EXTRACTION INSTRUCTIONS (SECTIONS 10 & 12):
1. Verbatim Quotes:
   - For every extracted field, you MUST include an entry in `source_spans[field_name]`.
   - The `quote` MUST be an EXACT, verbatim, character-for-character substring of the document text. Do NOT reword.
   - Record the exact `page` number and `document` kind (POLICY, REJECTION_LETTER, DISCHARGE, OTHER).
2. Dates:
   - Extract Indian dates (DD/MM/YYYY) and convert them to ISO format (YYYY-MM-DD).
   - If a date is not stated, return null. Never guess or infer dates.
3. Money Amounts:
   - Extract numbers as floats in INR (e.g. 120000.0). Do not include currency symbols.
4. Pre-Existing Disease & Fraud:
   - `ped_alleged`: boolean if insurer states or alleges pre-existing disease, else null.
   - `fraud_alleged`: boolean if insurer alleges fraud/misrepresentation, else false/null.
5. Missing Facts:
   - If any fact is absent from the documents, return null. Do NOT assume or invent facts.
6. Rejection reason:
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

    # Transform all source spans into initial unverified Evidence instances
    evidence_items = _convert_source_spans_to_evidence(case_id, facts)

    return facts, evidence_items

