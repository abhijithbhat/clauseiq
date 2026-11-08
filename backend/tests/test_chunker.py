"""Unit tests for the Clause-Aware Policy Document Chunker (M2)."""

import pytest
from backend.app.ingest.chunker import (
    MAX_CHUNK_CHARS,
    chunk_policy_document,
    extract_heading_info,
)
from backend.app.models.schemas import DocumentKind, DocumentPages, PolicyChunk


def test_extract_heading_patterns() -> None:
    """Verify regex patterns for Indian insurance heading structures."""
    # Pattern 1: Explicit Section / Clause / Exclusion
    res1 = extract_heading_info("Section 1: Definitions")
    assert res1 == ("Section 1", "Section 1: Definitions")

    res2 = extract_heading_info("Clause 4.1: Pre-Existing Diseases Waiting Period")
    assert res2 == ("Clause 4.1", "Clause 4.1: Pre-Existing Diseases Waiting Period")

    res3 = extract_heading_info("Clause 4.2: Specific Waiting Periods")
    assert res3 == ("Clause 4.2", "Clause 4.2: Specific Waiting Periods")

    res4 = extract_heading_info("Exclusion 12: Non-Payable Items")
    assert res4 == ("Exclusion 12", "Exclusion 12: Non-Payable Items")

    # Pattern 2: Numbered section
    res5 = extract_heading_info("4.1 Pre-existing Diseases")
    assert res5 == ("Clause 4.1", "4.1 Pre-existing Diseases")

    # Pattern 3: Named insurance headings
    res6 = extract_heading_info("Waiting Periods")
    assert res6 == ("Waiting Periods", "Waiting Periods")

    res7 = extract_heading_info("Room Rent Sub-limits: Applicable 1% of Sum Insured")
    assert res7 == ("Room Rent Sub-Limits", "Room Rent Sub-limits: Applicable 1% of Sum Insured")

    # Non-headings (body text / bullet points)
    assert extract_heading_info("1. The claim intimation must be given within 24 hours.") is None
    assert extract_heading_info("Any condition, ailment or injury diagnosed prior to policy inception.") is None


def test_multi_page_clause_boundary_preservation() -> None:
    """Verify that chunks accurately capture page_start and page_end, especially across page breaks."""
    text_by_page = {
        1: (
            "Care Health Insurance Limited - Policy Schedule\n"
            "Section 1: Definitions\n"
            "1.1 Company means Care Health Insurance Limited.\n"
            "1.2 Policyholder means the person named in the schedule."
        ),
        2: (
            "Clause 4.1: Pre-Existing Diseases Waiting Period\n"
            "Expenses related to the treatment of a pre-existing disease (PED) and its direct complications "
            "shall be excluded until the expiry of 36 months of continuous coverage after the date of inception "
            "of the first policy with us.\n"
            "Medical records of past treatments must be submitted upon intimation of claim under this section."
        ),
        3: (
            "Continued from Clause 4.1: If the insured person has continuous coverage without break with another insurer, "
            "the waiting period shall be reduced by the number of months of prior continuous cover.\n"
            "Clause 4.2: Specific Waiting Periods\n"
            "A waiting period of 24 months shall apply to the treatment of named conditions including cataract, "
            "hernia, and hydrocele.\n"
            "Exclusion 12: Non-Payable Items\n"
            "Expenses incurred towards non-medical items and consumables as listed in Annexure A shall not be payable."
        ),
    }

    doc = DocumentPages(
        case_id="case_m2_01",
        kind=DocumentKind.POLICY,
        filename="care_policy_multi.pdf",
        pages=3,
        text_by_page=text_by_page,
        ocr_used=False,
    )

    chunks = chunk_policy_document(doc)

    assert len(chunks) >= 4

    # Verify Preamble on page 1
    preamble = next((c for c in chunks if c.clause_ref == "Preamble"), None)
    assert preamble is not None
    assert preamble.page_start == 1
    assert preamble.page_end == 1
    assert "Policy Schedule" in preamble.text

    # Verify Section 1 on page 1
    sec1 = next((c for c in chunks if c.clause_ref == "Section 1"), None)
    assert sec1 is not None
    assert sec1.heading == "Section 1: Definitions"
    assert sec1.page_start == 1
    assert sec1.page_end == 1
    assert "Company means" in sec1.text

    # Verify Clause 4.1 crosses from Page 2 to Page 3
    clause41 = next((c for c in chunks if c.clause_ref == "Clause 4.1"), None)
    assert clause41 is not None
    assert clause41.heading == "Clause 4.1: Pre-Existing Diseases Waiting Period"
    assert clause41.page_start == 2
    assert clause41.page_end == 3  # Spans page break from 2 to 3
    assert "expiry of 36 months" in clause41.text
    assert "reduced by the number of months" in clause41.text

    # Verify Clause 4.2 on page 3
    clause42 = next((c for c in chunks if c.clause_ref == "Clause 4.2"), None)
    assert clause42 is not None
    assert clause42.heading == "Clause 4.2: Specific Waiting Periods"
    assert clause42.page_start == 3
    assert clause42.page_end == 3

    # Verify Exclusion 12 on page 3
    excl12 = next((c for c in chunks if c.clause_ref == "Exclusion 12"), None)
    assert excl12 is not None
    assert excl12.heading == "Exclusion 12: Non-Payable Items"
    assert excl12.page_start == 3
    assert excl12.page_end == 3


def test_sliding_window_character_ceiling_for_large_clauses() -> None:
    """Verify that clauses exceeding ~400 tokens (~1,600 chars) are split with overlap and ceiling <= 1800 chars."""
    # Build a 3,500-character clause spanning page 1 and page 2
    paragraph_p1 = [f"Page 1 Item {i}: Detailed explanation of terms and conditions covering hospitalization." for i in range(25)]
    paragraph_p2 = [f"Page 2 Item {i}: Further conditions and exclusions applicable to reimbursement claims." for i in range(25)]

    text_by_page = {
        1: "Clause 7: Comprehensive Benefits\n" + "\n".join(paragraph_p1),
        2: "\n".join(paragraph_p2),
    }

    doc = DocumentPages(
        case_id="case_m2_02",
        kind=DocumentKind.POLICY,
        filename="large_clause_policy.pdf",
        pages=2,
        text_by_page=text_by_page,
        ocr_used=False,
    )

    chunks = chunk_policy_document(doc)

    # Must produce multiple chunks for Clause 7
    clause7_chunks = [c for c in chunks if c.clause_ref == "Clause 7"]
    assert len(clause7_chunks) >= 2

    # Every chunk must adhere to the MAX_CHUNK_CHARS ceiling
    for chunk in clause7_chunks:
        assert len(chunk.text) <= MAX_CHUNK_CHARS, f"Chunk {chunk.id} exceeded ceiling: {len(chunk.text)}"
        assert chunk.heading == "Clause 7: Comprehensive Benefits"

    # Verify sequential IDs
    assert clause7_chunks[0].id == "case_m2_02_chunk_001"
    assert clause7_chunks[1].id == "case_m2_02_chunk_002"

    # Verify page progression
    assert clause7_chunks[0].page_start == 1
    assert clause7_chunks[-1].page_end == 2


def test_empty_document_pages() -> None:
    """Verify that an empty document returns an empty chunk list without errors."""
    doc = DocumentPages(
        case_id="case_m2_03",
        kind=DocumentKind.POLICY,
        filename="empty.pdf",
        pages=0,
        text_by_page={},
        ocr_used=False,
    )
    chunks = chunk_policy_document(doc)
    assert chunks == []

