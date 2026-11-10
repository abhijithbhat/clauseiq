"""Plain-language verdict explanation generator for ClauseIQ.

Implements FR9, Section 12, and Section 18:
- Generates a 2-3 sentence plain-English summary at a Class 8 reading level.
- Explains the verdict using ONLY verified evidence and rule results.
- Enforces Section 18 safety guardrails: strictly bans phrases like "you will win",
  "guaranteed", "we represent you", "legal advice", or "certain".
- Enforces Section 12 Number Guard: ensures every number, date, or amount in the
  explanation is grounded in facts or rule results; triggers deterministic fallback if violated.
- Provides a 100% deterministic template fallback generator when safety or number guards fail.
"""

import logging
import re
from typing import List, Optional, Set

from backend.app.core.llm_client import generate_text
from backend.app.models.schemas import (
    Evidence,
    ExtractedFacts,
    RejectionCategory,
    RuleOutcome,
    RuleResult,
    VerdictLabel,
)

logger = logging.getLogger(__name__)

# Section 18: Prohibited language patterns
BANNED_PHRASES: List[str] = [
    "you will win",
    "you'll win",
    "we will win",
    "guaranteed",
    "guarantee",
    "we represent you",
    "we will represent you",
    "represent you in court",
    "legal advice",
    "certain",
    "100% chance",
    "sure win",
]


def format_inr(amount: float) -> str:
    """Format currency in Indian numbering system (e.g. 120000 -> ₹1,20,000)."""
    s = str(int(amount))
    if len(s) <= 3:
        return f"₹{s}"
    last_three = s[-3:]
    remaining = s[:-3]
    groups = []
    while len(remaining) > 2:
        groups.append(remaining[-2:])
        remaining = remaining[:-2]
    if remaining:
        groups.append(remaining)
    groups.reverse()
    return f"₹{','.join(groups)},{last_three}"


def check_banned_phrases(text: str) -> bool:
    """Return True if any prohibited phrase or word is present in the text."""
    lowered = text.lower()
    for phrase in BANNED_PHRASES:
        pattern = r"\b" + re.escape(phrase) + r"\b"
        if re.search(pattern, lowered):
            return True
    return False


def _extract_allowed_numeric_strings(
    facts: ExtractedFacts,
    rule_results: List[RuleResult],
    verified_evidence: List[Evidence],
) -> Set[str]:
    """Collect all authorized numeric values, dates, and amounts across inputs."""
    allowed: Set[str] = set()

    def add_from_val(val: object) -> None:
        if val is None:
            return
        if isinstance(val, (int, float)):
            int_val = int(val)
            allowed.add(str(int_val))
            allowed.add(f"{int_val:,}")
            allowed.add(format_inr(val).replace("₹", ""))
            if isinstance(val, float):
                allowed.add(str(val))
        elif isinstance(val, str):
            nums = re.findall(r"\d+", val)
            for num in nums:
                allowed.add(num)
                allowed.add(str(int(num)))
        elif isinstance(val, dict):
            for k, v in val.items():
                add_from_val(k)
                add_from_val(v)
        elif isinstance(val, list):
            for item in val:
                add_from_val(item)

    # 1. Facts
    facts_dict = facts.model_dump()
    for v in facts_dict.values():
        add_from_val(v)

    # 2. Rule Results
    for r in rule_results:
        add_from_val(r.rule_id)
        add_from_val(r.inputs)
        add_from_val(r.explanation)
        add_from_val(r.law_ref)

    # 3. Verified Evidence
    for ev in verified_evidence:
        add_from_val(ev.page)
        add_from_val(ev.source_ref)
        add_from_val(ev.quote)

    # Common grammatical numbers allowed (e.g. 1, 2, 3 sentences or Section 45)
    allowed.update({"1", "2", "3", "8", "45"})
    return allowed


def check_hallucinated_numbers(
    text: str,
    facts: ExtractedFacts,
    rule_results: List[RuleResult],
    verified_evidence: List[Evidence],
) -> bool:
    """Return True if text contains numbers, dates, or amounts not present in inputs.

    Section 12 Number Guard: Checks every numeric token in generated text against allowed inputs.
    """
    allowed_numeric = _extract_allowed_numeric_strings(facts, rule_results, verified_evidence)

    # Extract all numbers or currency figures from the explanation text
    found_tokens = re.findall(r"(?:₹\s*)?(\d+(?:[,\.]\d+)*)", text)
    for token in found_tokens:
        clean_token = token.replace(",", "").replace(".", "")
        if not clean_token:
            continue

        raw_int_str = str(int(clean_token)) if clean_token.isdigit() else clean_token
        if (
            token not in allowed_numeric
            and clean_token not in allowed_numeric
            and raw_int_str not in allowed_numeric
        ):
            logger.warning("Number Guard triggered: hallucinated number detected '%s'", token)
            return True

    return False


def generate_deterministic_verdict_explanation(
    verdict_label: VerdictLabel,
    facts: ExtractedFacts,
    rule_results: List[RuleResult],
) -> str:
    """Generate a 100% deterministic plain-English 2-3 sentence summary."""
    claim_amount = facts.claim_amount_inr or facts.disallowed_amount_inr
    amount_str = format_inr(claim_amount) if claim_amount else "your claim"
    insurer_str = facts.insurer_name or "the insurer"

    category_display_map = {
        RejectionCategory.PED: "pre-existing disease (PED)",
        RejectionCategory.NON_DISCLOSURE: "non-disclosure",
        RejectionCategory.WAITING_PERIOD: "waiting period",
        RejectionCategory.NON_PAYABLE_OR_DEDUCTION: "non-payable deduction",
        RejectionCategory.ROOM_RENT: "room rent proportionate deduction",
        RejectionCategory.DOCUMENTS_OR_DELAY: "document delay",
        RejectionCategory.OTHER: "policy terms",
    }
    category = category_display_map.get(facts.rejection_category, "policy terms")

    if verdict_label == VerdictLabel.LIKELY_WRONGFUL:
        if facts.continuous_coverage_months and facts.ped_waiting_period_months:
            return (
                f"Your claim of {amount_str} was wrongly rejected by {insurer_str} under the {category} clause. "
                f"Your continuous coverage of {facts.continuous_coverage_months} months exceeds the "
                f"{facts.ped_waiting_period_months}-month waiting period specified in your policy and regulatory rules. "
                f"You have strong grounds to submit a grievance appeal."
            )
        elif facts.continuous_coverage_months and facts.continuous_coverage_months >= 60:
            return (
                f"Your claim of {amount_str} was wrongly rejected by {insurer_str}. "
                f"Your policy has completed {facts.continuous_coverage_months} months of continuous coverage, "
                f"which surpasses the 60-month moratorium period under Section 45. "
                f"The rejection appears invalid under regulatory guidelines."
            )
        else:
            contradicting = [r for r in rule_results if r.outcome == RuleOutcome.CONTRADICTS_INSURER]
            reason = contradicting[0].explanation if contradicting else f"applicable terms for {category}"
            return (
                f"Your claim of {amount_str} was rejected by {insurer_str} under {category}. "
                f"This rejection contradicts the applicable rules: {reason}. "
                f"You have grounds to appeal this decision."
            )

    elif verdict_label == VerdictLabel.CONTESTABLE:
        return (
            f"Your claim of {amount_str} was rejected or partially settled by {insurer_str}. "
            f"Several aspects of your case, such as documentation or waiting period applicability, may be contested upon review. "
            f"You can request clarification or file an appeal with additional supporting records."
        )

    elif verdict_label == VerdictLabel.LIKELY_VALID:
        return (
            f"Your claim of {amount_str} was rejected by {insurer_str} under policy terms for {category}. "
            f"Based on the provided policy documents and dates, the insurer's decision appears to align with standard terms. "
            f"You may still consult a grievance representative if any dates or records were recorded incorrectly."
        )

    else:  # INSUFFICIENT_INFO
        return (
            f"We could not confirm whether the claim rejection of {amount_str} is valid or wrongful. "
            f"Key documentation such as policy terms, complete discharge records, or the itemized rejection letter is missing. "
            f"Please upload complete documents to enable a full legal assessment."
        )


def generate_verdict_explanation(
    case_id: str,
    verdict_label: VerdictLabel,
    facts: ExtractedFacts,
    rule_results: List[RuleResult],
    verified_evidence: List[Evidence],
) -> str:
    """Generate a plain-language verdict explanation with safety and number guards.

    Args:
        case_id: Unique case identifier.
        verdict_label: Consolidated 4-way verdict.
        facts: Extracted case facts.
        rule_results: List of deterministic rule outcomes.
        verified_evidence: List of verified quotes and references.

    Returns:
        A 2-3 sentence explanation in plain English (Class 8 reading level).
    """
    facts_summary = (
        f"Insurer: {facts.insurer_name}, Claim Amount: {facts.claim_amount_inr}, "
        f"Continuous Coverage: {facts.continuous_coverage_months} months, "
        f"PED Waiting Period: {facts.ped_waiting_period_months} months, "
        f"Rejection Category: {facts.rejection_category.value}, "
        f"Rejection Reason: {facts.rejection_reason_text}"
    )
    rules_summary = "; ".join(
        f"{r.rule_id} ({r.name}): {r.outcome.value} - {r.explanation}"
        for r in rule_results
    )
    evidence_summary = "; ".join(
        f"[{ev.source_ref} p.{ev.page}]: \"{ev.quote}\""
        for ev in verified_evidence
        if ev.verified
    )

    prompt = f"""You are a plain-language legal assistant writing for an Indian policyholder.
Explain the following claim verdict in exactly 2 or 3 sentences at a Class 8 reading level.

CRITICAL RULES:
1. Explain the verdict using ONLY the verified evidence and rule results provided below.
2. Strictly forbid phrases like "you will win", "guaranteed", "we represent you", "legal advice", or "certain".
3. Use only exact numbers, dates, and amounts that appear in the facts or rule results below. Never invent numbers.
4. Keep the tone empathetic, clear, objective, and simple.

Verdict: {verdict_label.value}
Facts: {facts_summary}
Rule Outcomes: {rules_summary}
Verified Evidence: {evidence_summary}

Explanation:"""

    try:
        explanation = generate_text(prompt=prompt, case_id=case_id)
        cleaned = explanation.strip()

        # Enforce Section 18 safety guardrails
        if check_banned_phrases(cleaned):
            logger.warning("Banned phrase detected in LLM output for case %s. Falling back to template.", case_id)
            return generate_deterministic_verdict_explanation(verdict_label, facts, rule_results)

        # Enforce Section 12 Number Guard
        if check_hallucinated_numbers(cleaned, facts, rule_results, verified_evidence):
            logger.warning("Hallucinated numbers detected in LLM output for case %s. Falling back to template.", case_id)
            return generate_deterministic_verdict_explanation(verdict_label, facts, rule_results)

        return cleaned

    except Exception as e:
        logger.info("LLM explanation generation unavailable or failed (%s). Using deterministic template.", e)
        return generate_deterministic_verdict_explanation(verdict_label, facts, rule_results)
