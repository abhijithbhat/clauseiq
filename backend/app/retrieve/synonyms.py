"""Synonym mappings and query expansion for ClauseIQ Section 13 retrieval."""

from typing import Dict, List, Optional
from backend.app.models.schemas import RejectionCategory

REJECTION_SYNONYMS: Dict[RejectionCategory, List[str]] = {
    RejectionCategory.PED: [
        "pre-existing disease",
        "PED waiting period",
        "continuous coverage",
        "prior illness",
        "36 months",
    ],
    RejectionCategory.NON_DISCLOSURE: [
        "material fact",
        "misrepresentation",
        "non-disclosure",
        "proposal form",
        "moratorium period",
        "60 months",
    ],
    RejectionCategory.WAITING_PERIOD: [
        "initial waiting period",
        "30 days waiting",
        "specific waiting period",
        "named ailment",
        "accident exemption",
    ],
    RejectionCategory.NON_PAYABLE_OR_DEDUCTION: [
        "non-payable items",
        "consumables",
        "deductions",
        "proportionate deduction",
        "Annexure",
    ],
    RejectionCategory.ROOM_RENT: [
        "room rent limit",
        "ICU charges",
        "proportionate deduction",
        "associated medical expenses",
    ],
    RejectionCategory.DOCUMENTS_OR_DELAY: [
        "claim intimation",
        "submission timeline",
        "condonation of delay",
        "supporting documents",
    ],
    RejectionCategory.OTHER: [
        "terms and conditions",
        "exclusions",
        "claim procedure",
    ],
}


def get_synonyms_for_category(category: RejectionCategory) -> List[str]:
    """Retrieve synonym list for a given rejection category."""
    return list(REJECTION_SYNONYMS.get(category, REJECTION_SYNONYMS[RejectionCategory.OTHER]))


def expand_query(
    category: RejectionCategory,
    reason_text: Optional[str] = None,
) -> str:
    """Expand user rejection reason with category-specific synonyms for hybrid retrieval.

    Args:
        category: Core RejectionCategory.
        reason_text: Verbatim rejection reason text from the rejection letter.

    Returns:
        Expanded query string incorporating original text and domain synonyms.
    """
    synonyms = get_synonyms_for_category(category)
    parts: List[str] = []
    if reason_text and reason_text.strip():
        parts.append(reason_text.strip())
    parts.extend(synonyms)
    return " ".join(parts)

