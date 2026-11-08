"""Fact extraction module for ClauseIQ."""

from backend.app.extract.extractor import (
    extract_case_facts,
    format_documents_for_extraction,
    normalize_indian_date,
)

__all__ = [
    "extract_case_facts",
    "format_documents_for_extraction",
    "normalize_indian_date",
]
