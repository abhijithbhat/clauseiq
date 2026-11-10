"""Tests for the 3 flagship demo cases in /data/mock_cases/ (FR14, Section 5, Section 20).

Validates:
1. All 3 expected.json contracts conform 100% to AnalysisResult (Pydantic v2).
2. The synthetic policy.pdf and rejection_letter.pdf parse cleanly with M1 parse_document.
3. Every quote in expected.json (source_spans and evidence) appears VERBATIM on the cited page.
4. M2 chunk_policy_document extracts the cited clauses with correct headings and page numbers.
"""

import json
from pathlib import Path
import pytest

from backend.app.ingest.chunker import chunk_policy_document
from backend.app.ingest.pdf import parse_document
from backend.app.models.schemas import AnalysisResult, DocumentKind, EvidenceSourceType

MOCK_CASES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mock_cases"
CASES = ["case_01", "case_02", "case_03"]


@pytest.mark.parametrize("case_id", CASES)
def test_demo_case_expected_json_schema(case_id: str):
    """Confirm expected.json is valid AnalysisResult and has expected properties."""
    case_dir = MOCK_CASES_DIR / case_id
    expected_path = case_dir / "expected.json"
    assert expected_path.exists(), f"Missing expected.json for {case_id}"

    with open(expected_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Must pass Pydantic validation strictly
    result = AnalysisResult.model_validate(data)
    assert result.case_id == case_id
    assert result.verdict is not None
    assert len(result.rules) > 0
    assert len(result.evidence) > 0
    assert result.facts is not None


@pytest.mark.parametrize("case_id", CASES)
def test_demo_case_pdf_parsing_and_quote_verification(case_id: str):
    """Parse synthetic PDFs and verify 100% verbatim quote match on cited pages."""
    case_dir = MOCK_CASES_DIR / case_id
    policy_path = case_dir / "policy.pdf"
    letter_path = case_dir / "rejection_letter.pdf"
    expected_path = case_dir / "expected.json"

    assert policy_path.exists(), f"Missing policy.pdf for {case_id}"
    assert letter_path.exists(), f"Missing rejection_letter.pdf for {case_id}"

    with open(expected_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    result = AnalysisResult.model_validate(data)

    # 1. Parse both documents with M1 PDF parser (preserve files on disk)
    parsed_policy = parse_document(
        policy_path,
        case_id=case_id,
        kind=DocumentKind.POLICY,
        delete_after_parsing=False,
    )
    parsed_letter = parse_document(
        letter_path,
        case_id=case_id,
        kind=DocumentKind.REJECTION_LETTER,
        delete_after_parsing=False,
    )

    docs_by_kind = {
        DocumentKind.POLICY: parsed_policy,
        DocumentKind.REJECTION_LETTER: parsed_letter,
    }

    # 2. Verify all source_spans in facts appear verbatim on cited page
    for span in result.facts.source_spans.values():
        doc = docs_by_kind.get(span.document)
        assert doc is not None, f"Unknown document kind {span.document} in source span"
        assert span.page in doc.text_by_page, (
            f"Page {span.page} not in parsed {span.document} (pages: {list(doc.text_by_page.keys())})"
        )
        page_text = doc.text_by_page[span.page]
        assert span.quote in page_text, (
            f"[{case_id}] Source span quote not found on page {span.page} of {span.document}:\n"
            f"Quote: '{span.quote}'\nPage Text excerpt: '{page_text[:200]}...'"
        )

    # 3. Verify all evidence quotes appear verbatim on cited page
    for ev in result.evidence:
        if ev.source_type == EvidenceSourceType.POLICY:
            target_doc = parsed_policy
        elif ev.source_type == EvidenceSourceType.LETTER:
            target_doc = parsed_letter
        else:
            continue  # IRDAI or other external sources

        assert ev.page is not None, f"Evidence {ev.id} is missing page number"
        assert ev.page in target_doc.text_by_page, (
            f"Page {ev.page} not in parsed {ev.source_type} for {case_id}"
        )
        page_text = target_doc.text_by_page[ev.page]
        assert ev.quote in page_text, (
            f"[{case_id}] Evidence {ev.id} quote not found on page {ev.page} of {ev.source_type}:\n"
            f"Quote: '{ev.quote}'\nPage Text: '{page_text}'"
        )

    # 4. Run M2 chunk_policy_document and verify clauses are extracted
    chunks = chunk_policy_document(parsed_policy)
    assert len(chunks) > 0, f"No chunks extracted from policy for {case_id}"

    # Verify that the key clause for each case is recognized by heading
    if case_id == "case_01":
        ped_chunks = [c for c in chunks if "4.1" in (c.heading or "")]
        assert len(ped_chunks) > 0, "Case 01 Clause 4.1 not extracted as a chunk"
        assert ped_chunks[0].page_start <= 7 <= ped_chunks[0].page_end
    elif case_id == "case_02":
        mora_chunks = [c for c in chunks if "7.2" in (c.heading or "")]
        assert len(mora_chunks) > 0, "Case 02 Clause 7.2 not extracted as a chunk"
        assert mora_chunks[0].page_start <= 5 <= mora_chunks[0].page_end
    elif case_id == "case_03":
        spec_chunks = [c for c in chunks if "4.2" in (c.heading or "")]
        assert len(spec_chunks) > 0, "Case 03 Clause 4.2 not extracted as a chunk"
        assert spec_chunks[0].page_start <= 6 <= spec_chunks[0].page_end
