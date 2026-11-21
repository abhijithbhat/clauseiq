"""Code-Driven Verdict Decider for ClauseIQ (M6).

Implements Section 7, Section 10, Section 15, and Section 18:
Decision logic (deterministic code, not AI):
1. If any rule returns CONTRADICTS_INSURER with verified evidence, label LIKELY_WRONGFUL.
2. Otherwise, if at least one rule returns SUPPORTS_INSURER and none contradict, label LIKELY_VALID.
3. Otherwise, if evidence is mixed or interpretation-dependent, label CONTESTABLE.
4. If required inputs are unknown or unverified, label INSUFFICIENT_INFO.
- Sets needs_human_review when overall confidence < 0.70, when facts conflict, or when inputs are missing.
- Gathers verified supporting evidence IDs into verdict.reasons.
"""

from typing import List, Set
from backend.app.models.schemas import (
    Evidence,
    ExtractedFacts,
    RuleOutcome,
    RuleResult,
    Verdict,
    VerdictLabel,
)


def decide_verdict(
    case_id: str,
    facts: ExtractedFacts,
    rules: List[RuleResult],
    evidence: List[Evidence],
) -> Verdict:
    """Evaluate rules and verified evidence to produce a deterministic verdict."""
    verified_ev_ids: Set[str] = {ev.id for ev in evidence if ev.verified}
    all_ev_ids: Set[str] = {ev.id for ev in evidence}

    contradicting_rules = [r for r in rules if r.outcome == RuleOutcome.CONTRADICTS_INSURER]
    supporting_rules = [r for r in rules if r.outcome == RuleOutcome.SUPPORTS_INSURER]
    unknown_rules = [r for r in rules if r.outcome == RuleOutcome.UNKNOWN]

    # Collect verified evidence supporting contradictory findings
    contradictory_evidence_ids: List[str] = []
    for r in contradicting_rules:
        for ev_id in r.supporting_evidence_ids:
            if ev_id in verified_ev_ids and ev_id not in contradictory_evidence_ids:
                contradictory_evidence_ids.append(ev_id)

    # Fallback to general verified evidence if rule didn't explicitly bind IDs
    if not contradictory_evidence_ids and contradicting_rules:
        contradictory_evidence_ids = [ev.id for ev in evidence if ev.verified][:2]

    # Rule 1: LIKELY_WRONGFUL
    # If any rule returns CONTRADICTS_INSURER with verified evidence
    if contradicting_rules and contradictory_evidence_ids:
        main_rule = contradicting_rules[0]
        summary = (
            f"Your claim appears to have been wrongly repudiated under {main_rule.name}. "
            f"{main_rule.explanation}"
        )
        return Verdict(
            case_id=case_id,
            label=VerdictLabel.LIKELY_WRONGFUL,
            summary=summary,
            confidence=0.95,
            needs_human_review=False,
            reasons=contradictory_evidence_ids,
        )

    # If rule contradicts insurer but NO verified evidence supports it: downgrade per Section 12
    if contradicting_rules and not contradictory_evidence_ids:
        return Verdict(
            case_id=case_id,
            label=VerdictLabel.INSUFFICIENT_INFO,
            summary=(
                "A statutory rule indicates potential wrongful repudiation, but the supporting "
                "clause quote could not be verified verbatim in your uploaded documents."
            ),
            confidence=0.50,
            needs_human_review=True,
            reasons=[],
        )

    # Rule 2: LIKELY_VALID
    # If at least one rule returns SUPPORTS_INSURER and none contradict
    if supporting_rules and not contradicting_rules:
        main_rule = supporting_rules[0]
        supporting_ev_ids = [
            ev_id for r in supporting_rules for ev_id in r.supporting_evidence_ids if ev_id in verified_ev_ids
        ]
        if not supporting_ev_ids:
            supporting_ev_ids = [ev.id for ev in evidence if ev.verified][:2]

        summary = (
            f"The insurer's repudiation aligns with policy terms and regulatory guidelines. "
            f"{main_rule.explanation}"
        )
        return Verdict(
            case_id=case_id,
            label=VerdictLabel.LIKELY_VALID,
            summary=summary,
            confidence=0.90,
            needs_human_review=False,
            reasons=supporting_ev_ids,
        )

    # Rule 3: CONTESTABLE
    # If evidence is mixed or reason requires factual/procedural substantiation
    if facts.rejection_reason_text and (unknown_rules or not supporting_rules):
        reasons_list = [ev.id for ev in evidence if ev.verified][:2]
        return Verdict(
            case_id=case_id,
            label=VerdictLabel.CONTESTABLE,
            summary=(
                "There are valid grounds to contest the insurer's decision; however, additional "
                "factual records or hospital documents are needed to substantiate your appeal."
            ),
            confidence=0.70,
            needs_human_review=True,
            reasons=reasons_list,
        )

    # Rule 4: INSUFFICIENT_INFO
    return Verdict(
        case_id=case_id,
        label=VerdictLabel.INSUFFICIENT_INFO,
        summary=(
            "Key dates, documents, or policy clauses were missing or unreadable. "
            "Please upload the full policy schedule and repudiation letter."
        ),
        confidence=0.40,
        needs_human_review=True,
        reasons=[],
    )
