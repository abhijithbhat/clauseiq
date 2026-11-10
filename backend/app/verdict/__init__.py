"""Verdict module: Four-way deterministic verdict synthesizer and plain-language explainer."""

from backend.app.verdict.explainer import (
    check_banned_phrases,
    check_hallucinated_numbers,
    generate_deterministic_verdict_explanation,
    generate_verdict_explanation,
)

__all__ = [
    "check_banned_phrases",
    "check_hallucinated_numbers",
    "generate_deterministic_verdict_explanation",
    "generate_verdict_explanation",
]
