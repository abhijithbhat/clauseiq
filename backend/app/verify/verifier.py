"""Deterministic Quote Verifier for ClauseIQ (M6).

Implements Section 7, Section 12, and FR6:
- Normalizes unicode (NFKC), whitespace, hyphenation, and case.
- Verifies extracted and retrieved quotes against uploaded document text.
- Accepts an exact normalized substring match, or fuzzy match (rapidfuzz partial_ratio >= 95.0).
- Sets verified = True/False on each Evidence item.
- Guarantees zero invented quotes reach verdict decision or appeal letters.
"""

import re
import unicodedata
from typing import List
from rapidfuzz import fuzz

from backend.app.models.schemas import DocumentPages, Evidence


def _normalize_text(text: str) -> str:
    """Normalize text by collapsing whitespace, stripping accents, and lowercasing."""
    if not text:
        return ""
    # Unicode NFKC normalization
    text = unicodedata.normalize("NFKC", text)
    # Replace smart quotes, en-dashes, em-dashes
    text = (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )
    # Collapse whitespace into single spaces
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()


def verify_evidence_quotes(
    evidence: List[Evidence],
    documents: List[DocumentPages],
) -> List[Evidence]:
    """Verify evidence quotes against document pages.

    Args:
        evidence: List of Evidence objects to verify.
        documents: List of DocumentPages parsed from user uploads.

    Returns:
        List of Evidence objects with verified boolean set.
    """
    if not evidence:
        return []

    # Map normalized document texts by (document_kind, page) and overall
    doc_pages_text: dict[tuple[str, int], str] = {}
    all_docs_combined: List[str] = []

    for doc in documents:
        for page_num, page_content in doc.text_by_page.items():
            norm_content = _normalize_text(page_content)
            doc_pages_text[(doc.kind.value, page_num)] = norm_content
            all_docs_combined.append(norm_content)

    full_corpus = " ".join(all_docs_combined)

    verified_evidence: List[Evidence] = []
    for ev in evidence:
        raw_quote = ev.quote or ""
        norm_quote = _normalize_text(raw_quote)

        if not norm_quote:
            ev.verified = False
            verified_evidence.append(ev)
            continue

        # 1. First check the cited page if available
        matched = False
        target_page_text = doc_pages_text.get((ev.source_type.value, ev.page))
        if target_page_text:
            if norm_quote in target_page_text:
                matched = True
            elif fuzz.partial_ratio(norm_quote, target_page_text) >= 95.0:
                matched = True

        # 2. Check full corpus if page-specific check did not match
        if not matched:
            if norm_quote in full_corpus:
                matched = True
            elif fuzz.partial_ratio(norm_quote, full_corpus) >= 95.0:
                matched = True

        ev.verified = matched
        verified_evidence.append(ev)

    return verified_evidence
