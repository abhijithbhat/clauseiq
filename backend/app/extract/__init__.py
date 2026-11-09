"""Fact extraction module for ClauseIQ."""

from backend.app.extract.extractor import (
    compute_continuous_coverage_months,
    extract_case_facts,
    format_documents_for_extraction,
    normalize_indian_date,
)

__all__ = [
    "compute_continuous_coverage_months",
    "extract_case_facts",
    "format_documents_for_extraction",
    "normalize_indian_date",
]
