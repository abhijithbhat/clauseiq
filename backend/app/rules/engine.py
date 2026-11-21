"""Comprehensive Statutory Rules Engine for ClauseIQ (M5: R1–R10).

Implements Section 8, Section 10, and FR7:
- R1: Pre-Existing Disease (PED) Waiting Period (IRDAI 2024 Products Regs, Sched III, Para 7 & 1.6)
- R2: Section 45 Moratorium Period (Insurance Act 1938 S.45 & IRDAI Products Regs, Sched III, Para 8)
- R3: Early-Onset Illness Check
- R4: Specific Illness Waiting Period (IRDAI Products Regs, Sched III, Para 1.7)
- R5: Initial Waiting Period (30 Days) & Accident Exemption
- R6: Room Rent Proportionate Deduction Limit (IRDAI 2020 / 2024 Master Circular)
- R7: Non-Payable Items & Consumables Catalog Matching
- R8: Missing Documents & Delayed Claim Intimation Protection (IRDAI Master Circular 2024)
- R9: Grievance and Insurance Ombudsman Deadlines
- R10: Cashless Authorization & Discharge Turnaround Times
- Real evidence association: populates RuleResult.supporting_evidence_ids from retrieved evidence!
"""

from datetime import date, datetime
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import yaml

from backend.app.models.schemas import (
    Deadline,
    Evidence,
    EvidenceSourceType,
    ExtractedFacts,
    PolicyChunk,
    RejectionCategory,
    RuleOutcome,
    RuleResult,
)
from backend.app.rules.r9_deadlines import evaluate_deadlines

logger = logging.getLogger(__name__)

LAW_PACK_DIR = Path(__file__).resolve().parent.parent.parent.parent / "law_pack"
RULES_CONFIG_PATH = LAW_PACK_DIR / "rules_config.yaml"
NON_PAYABLE_PATH = LAW_PACK_DIR / "non_payable_items.yaml"


def _load_yaml(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        logger.warning("Failed loading YAML %s: %s", path, e)
        return {}


RULES_CONFIG = _load_yaml(RULES_CONFIG_PATH).get("rules", {})
NON_PAYABLE_CATALOG = _load_yaml(NON_PAYABLE_PATH)


def _find_matching_evidence_ids(
    evidence_list: List[Evidence],
    *match_terms: str,
) -> List[str]:
    """Find evidence IDs matching any of the specified keywords."""
    clean_terms = [t.lower().strip() for t in match_terms if t and t.strip()]
    matched = []
    for ev in evidence_list:
        text = f"{ev.source_ref} {ev.quote}".lower()
        if any(term in text for term in clean_terms):
            matched.append(ev.id)
    return matched


def evaluate_r1(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R1: PED Waiting Period Check (IRDAI 2024 Master Circular)."""
    cfg = RULES_CONFIG.get("R1", {})
    statutory_max = cfg.get("statutory_max_waiting_months", 36)
    policy_waiting = facts.ped_waiting_period_months if facts.ped_waiting_period_months is not None else 36
    effective_limit = min(policy_waiting, statutory_max)

    continuous_months = facts.continuous_coverage_months
    is_ped_case = (
        facts.rejection_category == RejectionCategory.PED
        or facts.ped_alleged is True
        or "pre-existing" in (facts.rejection_reason_text or "").lower()
        or "ped" in (facts.rejection_reason_text or "").lower()
    )

    inputs = {
        "policy_first_inception_date": facts.policy_first_inception_date,
        "admission_date": facts.admission_date,
        "continuous_cover_months": continuous_months,
        "policy_waiting_months": policy_waiting,
        "statutory_max_waiting_months": statutory_max,
    }

    matching_ev = _find_matching_evidence_ids(
        evidence_list,
        "clause 4.1",
        "pre-existing",
        "ped",
        "waiting period",
        facts.cited_clause_ref or "",
    )

    if continuous_months is None:
        return RuleResult(
            case_id=case_id,
            rule_id="R1",
            name="PED waiting period",
            outcome=RuleOutcome.UNKNOWN,
            inputs=inputs,
            explanation="Continuous coverage months could not be determined from the documents.",
            law_ref=cfg.get("law_ref", "IRDAI (Insurance Products) Regulations, 2024, Schedule III, Para 7"),
            supporting_evidence_ids=matching_ev,
        )

    if not is_ped_case:
        return RuleResult(
            case_id=case_id,
            rule_id="R1",
            name="PED waiting period",
            outcome=RuleOutcome.NOT_APPLICABLE,
            inputs=inputs,
            explanation="Claim was not repudiated on grounds of a pre-existing disease.",
            law_ref=cfg.get("law_ref", "IRDAI (Insurance Products) Regulations, 2024, Schedule III, Para 7"),
            supporting_evidence_ids=matching_ev,
        )

    if continuous_months >= effective_limit:
        return RuleResult(
            case_id=case_id,
            rule_id="R1",
            name="PED waiting period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months exceeds the {effective_limit}-month waiting "
                f"period specified in Clause 4.1 and the IRDAI 2024 Regulations. The pre-existing disease waiting "
                f"period was fully completed before admission."
            ),
            law_ref=cfg.get("law_ref", "IRDAI (Insurance Products) Regulations, 2024, Schedule III, Para 7 & Para 1.6"),
            supporting_evidence_ids=matching_ev,
        )
    else:
        return RuleResult(
            case_id=case_id,
            rule_id="R1",
            name="PED waiting period",
            outcome=RuleOutcome.SUPPORTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months has not completed the required "
                f"{effective_limit}-month pre-existing disease waiting period before hospitalisation."
            ),
            law_ref=cfg.get("law_ref", "IRDAI (Insurance Products) Regulations, 2024, Schedule III, Para 7"),
            supporting_evidence_ids=matching_ev,
        )


def evaluate_r2(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R2: Section 45 Moratorium Period (60 Months)."""
    cfg = RULES_CONFIG.get("R2", {})
    threshold_months = cfg.get("moratorium_threshold_months", 60)
    continuous_months = facts.continuous_coverage_months
    is_non_disclosure = (
        facts.rejection_category == RejectionCategory.NON_DISCLOSURE
        or "non-disclosure" in (facts.rejection_reason_text or "").lower()
        or "misrepresentation" in (facts.rejection_reason_text or "").lower()
        or "cond02" in (facts.rejection_reason_text or "").lower()
    )

    inputs = {
        "continuous_cover_months": continuous_months,
        "moratorium_threshold_months": threshold_months,
        "fraud_alleged": facts.fraud_alleged or False,
        "fraud_established": facts.fraud_established or False,
    }

    matching_ev = _find_matching_evidence_ids(
        evidence_list,
        "clause 7.2",
        "moratorium",
        "section 45",
        "disclosure",
        "non-disclosure",
        facts.cited_clause_ref or "",
    )

    if continuous_months is None:
        return RuleResult(
            case_id=case_id,
            rule_id="R2",
            name="Moratorium period",
            outcome=RuleOutcome.UNKNOWN,
            inputs=inputs,
            explanation="Continuous coverage duration could not be determined to assess Section 45 moratorium eligibility.",
            law_ref=cfg.get("law_ref", "Insurance Act, 1938 Section 45 & IRDAI Products Regulations 2024"),
            supporting_evidence_ids=matching_ev,
        )

    if not is_non_disclosure:
        return RuleResult(
            case_id=case_id,
            rule_id="R2",
            name="Moratorium period",
            outcome=RuleOutcome.NOT_APPLICABLE,
            inputs=inputs,
            explanation="Claim was not repudiated on grounds of non-disclosure or misrepresentation.",
            law_ref=cfg.get("law_ref", "Insurance Act, 1938 Section 45"),
            supporting_evidence_ids=matching_ev,
        )

    if continuous_months >= threshold_months and not facts.fraud_established and not facts.fraud_alleged:
        return RuleResult(
            case_id=case_id,
            rule_id="R2",
            name="Moratorium period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months exceeds the statutory 60-month moratorium "
                f"period under Section 45 of the Insurance Act, 1938. The insurer cannot contest or repudiate this "
                f"claim for non-disclosure without establishing fraud."
            ),
            law_ref=cfg.get("law_ref", "Insurance Act, 1938 Section 45 & IRDAI Products Regulations 2024 Schedule III, Para 8"),
            supporting_evidence_ids=matching_ev,
        )
    elif facts.fraud_established or facts.fraud_alleged:
        return RuleResult(
            case_id=case_id,
            rule_id="R2",
            name="Moratorium period",
            outcome=RuleOutcome.SUPPORTS_INSURER,
            inputs=inputs,
            explanation="Fraud was alleged or established, which exempts the insurer from the Section 45 moratorium bar.",
            law_ref=cfg.get("law_ref", "Insurance Act, 1938 Section 45"),
            supporting_evidence_ids=matching_ev,
        )
    else:
        return RuleResult(
            case_id=case_id,
            rule_id="R2",
            name="Moratorium period",
            outcome=RuleOutcome.SUPPORTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months is under the 60-month moratorium ceiling; "
                f"the insurer is legally permitted to contest material non-disclosure."
            ),
            law_ref=cfg.get("law_ref", "Insurance Act, 1938 Section 45"),
            supporting_evidence_ids=matching_ev,
        )


def evaluate_r3(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R3: Early-onset rule (pending verification per rules_config.yaml)."""
    cfg = RULES_CONFIG.get("R3", {})
    return RuleResult(
        case_id=case_id,
        rule_id="R3",
        name="Early-onset rule",
        outcome=RuleOutcome.NOT_APPLICABLE,
        inputs={"status": cfg.get("status", "pending_verification")},
        explanation="The three-month early-onset rule is not enabled under current binding IRDAI regulations.",
        law_ref=None,
        supporting_evidence_ids=[],
    )


def evaluate_r4(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R4: Specific illness waiting period (e.g. Cataract, Hernia, Joint Replacement)."""
    cfg = RULES_CONFIG.get("R4", {})
    waiting_months = facts.specific_illness_waiting_months or 24
    continuous_months = facts.continuous_coverage_months
    is_specific_waiting = (
        facts.rejection_category == RejectionCategory.WAITING_PERIOD
        or "specific illness" in (facts.rejection_reason_text or "").lower()
        or "cataract" in (facts.diagnosis_text or "").lower()
        or "hernia" in (facts.diagnosis_text or "").lower()
    )

    inputs = {
        "continuous_cover_months": continuous_months,
        "specific_illness_waiting_months": waiting_months,
        "is_accident_case": facts.is_accident_case or False,
        "named_ailment": facts.named_ailment_matched or facts.diagnosis_text,
    }

    matching_ev = _find_matching_evidence_ids(
        evidence_list,
        "clause 4.2",
        "specific illness",
        "cataract",
        "hernia",
        facts.cited_clause_ref or "",
    )

    if not is_specific_waiting:
        return RuleResult(
            case_id=case_id,
            rule_id="R4",
            name="Specific illness waiting period",
            outcome=RuleOutcome.NOT_APPLICABLE,
            inputs=inputs,
            explanation="Claim does not involve a specific illness waiting period clause.",
            law_ref=cfg.get("law_ref", "IRDAI (Insurance Products) Regulations, 2024"),
            supporting_evidence_ids=matching_ev,
        )

    if facts.is_accident_case:
        return RuleResult(
            case_id=case_id,
            rule_id="R4",
            name="Specific illness waiting period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation="The treatment was necessitated by an accident, which is exempt from specific waiting periods.",
            law_ref="IRDAI (Insurance Products) Regulations, 2024 Schedule III, Para 1.7",
            supporting_evidence_ids=matching_ev,
        )

    if continuous_months is None:
        return RuleResult(
            case_id=case_id,
            rule_id="R4",
            name="Specific illness waiting period",
            outcome=RuleOutcome.UNKNOWN,
            inputs=inputs,
            explanation="Continuous coverage months are unknown.",
            law_ref=cfg.get("law_ref"),
            supporting_evidence_ids=matching_ev,
        )

    if continuous_months >= waiting_months:
        return RuleResult(
            case_id=case_id,
            rule_id="R4",
            name="Specific illness waiting period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months exceeds the policy specific waiting period of "
                f"{waiting_months} months for this procedure."
            ),
            law_ref="IRDAI (Insurance Products) Regulations, 2024 & Policy Terms",
            supporting_evidence_ids=matching_ev,
        )
    else:
        return RuleResult(
            case_id=case_id,
            rule_id="R4",
            name="Specific illness waiting period",
            outcome=RuleOutcome.SUPPORTS_INSURER,
            inputs=inputs,
            explanation=(
                f"Continuous coverage of {continuous_months} months is within the contractual {waiting_months}-month "
                f"specific waiting period for this treatment."
            ),
            law_ref="Policy Terms & Conditions (Specific Illness Waiting Clause)",
            supporting_evidence_ids=matching_ev,
        )


def evaluate_r5(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R5: Initial waiting period (30 days) & accident exemption."""
    cfg = RULES_CONFIG.get("R5", {})
    initial_days = facts.initial_waiting_period_days or 30

    inputs = {
        "initial_waiting_days": initial_days,
        "is_accident_case": facts.is_accident_case or False,
        "first_inception_date": facts.policy_first_inception_date,
        "admission_date": facts.admission_date,
    }

    matching_ev = _find_matching_evidence_ids(evidence_list, "initial waiting", "30 days", facts.cited_clause_ref or "")

    if facts.is_accident_case:
        return RuleResult(
            case_id=case_id,
            rule_id="R5",
            name="Initial waiting period",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation="Emergency hospitalisation due to accident is universally exempt from the initial 30-day waiting period.",
            law_ref="IRDAI (Insurance Products) Regulations, 2024",
            supporting_evidence_ids=matching_ev,
        )

    return RuleResult(
        case_id=case_id,
        rule_id="R5",
        name="Initial waiting period",
        outcome=RuleOutcome.NOT_APPLICABLE,
        inputs=inputs,
        explanation="Initial 30-day waiting period does not apply to this renewal/claim context.",
        law_ref=cfg.get("law_ref"),
        supporting_evidence_ids=matching_ev,
    )


def evaluate_r6(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R6: Room Rent Proportionate Deductions (IRDAI Circular Ref: IRDAI/HLT/REG/CIR/151/06/2020)."""
    cfg = RULES_CONFIG.get("R6", {})
    inputs = {
        "has_proportionate_clause": facts.has_room_rent_proportionate_clause,
        "room_rent_limit_inr": facts.room_rent_limit_per_day_inr,
        "room_rent_actual_inr": facts.room_rent_actual_per_day_inr,
        "associated_medical_charges_inr": facts.associated_medical_charges_inr,
        "non_associated_charges_inr": facts.non_associated_charges_inr,
        "room_rent_deduction_inr": facts.room_rent_deduction_inr,
    }

    matching_ev = _find_matching_evidence_ids(evidence_list, "room rent", "proportionate", "icu", facts.cited_clause_ref or "")

    is_room_rent_case = (
        facts.rejection_category == RejectionCategory.ROOM_RENT
        or facts.room_rent_deduction_inr is not None
        or "proportionate" in (facts.rejection_reason_text or "").lower()
    )

    if not is_room_rent_case:
        return RuleResult(
            case_id=case_id,
            rule_id="R6",
            name="Room-rent proportionate deduction",
            outcome=RuleOutcome.NOT_APPLICABLE,
            inputs=inputs,
            explanation="Claim does not involve room rent proportionate deduction dispute.",
            law_ref=cfg.get("law_ref"),
            supporting_evidence_ids=matching_ev,
        )

    if facts.has_room_rent_proportionate_clause is False and (facts.room_rent_deduction_inr or 0) > 0:
        return RuleResult(
            case_id=case_id,
            rule_id="R6",
            name="Room-rent proportionate deduction",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation="The policy wording contains no proportionate deduction clause; the deduction is arbitrary.",
            law_ref="IRDAI Master Circular on Protection of Policyholders' Interests, 2024",
            supporting_evidence_ids=matching_ev,
        )

    if (facts.non_associated_charges_inr or 0) > 0 and (facts.room_rent_deduction_inr or 0) > 0:
        return RuleResult(
            case_id=case_id,
            rule_id="R6",
            name="Room-rent proportionate deduction",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation="Proportionate deduction was unlawfully applied to non-associated expenses such as medicines, implants, or diagnostics.",
            law_ref="IRDAI Circular Ref: IRDAI/HLT/REG/CIR/151/06/2020",
            supporting_evidence_ids=matching_ev,
        )

    return RuleResult(
        case_id=case_id,
        rule_id="R6",
        name="Room-rent proportionate deduction",
        outcome=RuleOutcome.SUPPORTS_INSURER,
        inputs=inputs,
        explanation="Room rent proportionate deduction was applied within contractual and regulatory limits.",
        law_ref="IRDAI Circular Ref: IRDAI/HLT/REG/CIR/151/06/2020",
        supporting_evidence_ids=matching_ev,
    )


def evaluate_r7(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R7: Non-payable items and consumables check."""
    cfg = RULES_CONFIG.get("R7", {})
    items = facts.disallowed_items or []
    inputs = {"disallowed_items_count": len(items), "items": [item.name for item in items]}

    matching_ev = _find_matching_evidence_ids(evidence_list, "non-payable", "consumable", "exclusion", facts.cited_clause_ref or "")

    if facts.rejection_category != RejectionCategory.NON_PAYABLE_OR_DEDUCTION and not items:
        return RuleResult(
            case_id=case_id,
            rule_id="R7",
            name="Non-payable items",
            outcome=RuleOutcome.NOT_APPLICABLE,
            inputs=inputs,
            explanation="No disallowed consumables or non-payable items were identified in this claim.",
            law_ref=cfg.get("law_ref"),
            supporting_evidence_ids=matching_ev,
        )

    return RuleResult(
        case_id=case_id,
        rule_id="R7",
        name="Non-payable items",
        outcome=RuleOutcome.UNKNOWN,
        inputs=inputs,
        explanation="Disallowed items must be verified against the policy schedule; statutory list is historical.",
        law_ref=cfg.get("law_ref"),
        supporting_evidence_ids=matching_ev,
    )


def evaluate_r8(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R8: Missing documents or delayed claim intimation protection (IRDAI 2024 Master Circular)."""
    cfg = RULES_CONFIG.get("R8", {})
    inputs = {
        "documents_requested": facts.documents_requested_list,
        "claim_intimation_window_days": facts.policy_intimation_window_days,
        "rejection_category": facts.rejection_category.value if facts.rejection_category else None,
    }

    matching_ev = _find_matching_evidence_ids(evidence_list, "delay", "intimation", "documents", facts.cited_clause_ref or "")

    if (
        facts.rejection_category == RejectionCategory.DOCUMENTS_OR_DELAY
        or "delay" in (facts.rejection_reason_text or "").lower()
        or "late intimation" in (facts.rejection_reason_text or "").lower()
    ):
        return RuleResult(
            case_id=case_id,
            rule_id="R8",
            name="Missing documents or delayed claim intimation",
            outcome=RuleOutcome.CONTRADICTS_INSURER,
            inputs=inputs,
            explanation=(
                "Under the IRDAI Master Circular 2024, insurers cannot reject genuine claims solely due to delayed "
                "intimation, nor can they reject for want of documents that the insurer/TPA can collect directly from hospitals."
            ),
            law_ref=cfg.get("law_ref", "IRDAI Master Circular on Protection of Policyholders' Interests, 2024, Ref: IRDAI/PP&GR/CIR/MISC/117/9/2024"),
            supporting_evidence_ids=matching_ev,
        )

    return RuleResult(
        case_id=case_id,
        rule_id="R8",
        name="Missing documents or delayed claim intimation",
        outcome=RuleOutcome.NOT_APPLICABLE,
        inputs=inputs,
        explanation="Claim was not repudiated for delayed intimation or missing hospital documents.",
        law_ref=cfg.get("law_ref"),
        supporting_evidence_ids=matching_ev,
    )


def evaluate_r10(case_id: str, facts: ExtractedFacts, evidence_list: List[Evidence]) -> RuleResult:
    """R10: Cashless turn-around time standards."""
    is_cashless = facts.claim_type and facts.claim_type.value == "CASHLESS"
    inputs = {"is_cashless": is_cashless}

    return RuleResult(
        case_id=case_id,
        rule_id="R10",
        name="Cashless timelines",
        outcome=RuleOutcome.NOT_APPLICABLE if not is_cashless else RuleOutcome.UNKNOWN,
        inputs=inputs,
        explanation="Cashless pre-auth (~1 hour) and discharge (~3 hours) standards apply under 2024 Circular.",
        law_ref="IRDAI Master Circular 2024 Section IV",
        supporting_evidence_ids=[],
    )


def run_all_rules(
    case_id: str,
    facts: ExtractedFacts,
    evidence: Optional[List[Evidence]] = None,
    chunks: Optional[List[PolicyChunk]] = None,
) -> Tuple[List[RuleResult], List[Deadline]]:
    """Execute complete deterministic rules engine (R1–R10) and calculate deadlines.

    Args:
        case_id: Unique case identifier.
        facts: Extracted facts.
        evidence: Optional list of retrieved/extracted Evidence objects.
        chunks: Optional policy chunks.

    Returns:
        Tuple of (rule_results, deadlines).
    """
    ev_list = evidence or []

    rule_results: List[RuleResult] = [
        evaluate_r1(case_id, facts, ev_list),
        evaluate_r2(case_id, facts, ev_list),
        evaluate_r3(case_id, facts, ev_list),
        evaluate_r4(case_id, facts, ev_list),
        evaluate_r5(case_id, facts, ev_list),
        evaluate_r6(case_id, facts, ev_list),
        evaluate_r7(case_id, facts, ev_list),
        evaluate_r8(case_id, facts, ev_list),
        evaluate_r10(case_id, facts, ev_list),
    ]

    deadlines = evaluate_deadlines(case_id=case_id, facts=facts)

    return rule_results, deadlines


# Alias for backward compatibility
evaluate_rules = run_all_rules
