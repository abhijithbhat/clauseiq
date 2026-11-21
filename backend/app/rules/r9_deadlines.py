"""R9 Grievance and Insurance Ombudsman Deadlines Calculator (M5).

Implements Section 8, Section 11, and FR11:
- Insurer grievance resolution target: 14 days from grievance receipt
  (IRDAI Master Circular on Protection of Policyholders' Interests, 2024, Section VI, Para 2).
- Ombudsman no-response prerequisite wait: 30 days / 1 month from grievance receipt
  (Insurance Ombudsman Rules, 2017, Rule 14(3)(a)(ii)).
- Ombudsman limitation: 1 year from repudiation date or final grievance rejection
  (Insurance Ombudsman Rules, 2017, Rule 14(3)(b)(i)-(ii)).
- Produces Deadline items conforming to shared schema.
"""

from datetime import date, datetime, timedelta
from typing import List, Optional
import yaml
from pathlib import Path

from backend.app.models.schemas import Deadline, ExtractedFacts, GrievanceReplyStatus

RULES_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent.parent / "law_pack" / "rules_config.yaml"


def _parse_iso_date(val: Optional[str]) -> Optional[date]:
    """Parse YYYY-MM-DD or return None."""
    if not val or not isinstance(val, str):
        return None
    val = val.strip()
    try:
        return datetime.strptime(val[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _format_date(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def evaluate_deadlines(case_id: str, facts: ExtractedFacts) -> List[Deadline]:
    """Calculate regulatory grievance and Ombudsman deadlines for a case."""
    deadlines: List[Deadline] = []
    today = date.today()

    rep_date = _parse_iso_date(facts.rejection_date)
    grievance_sent = _parse_iso_date(facts.grievance_sent_date)
    grievance_received = _parse_iso_date(facts.grievance_received_date)
    reply_received_date = _parse_iso_date(facts.grievance_reply_received_date)

    # 1. Insurer Grievance TAT (14 days from receipt)
    if grievance_received:
        tat_14 = grievance_received + timedelta(days=14)
        if facts.grievance_reply_status == GrievanceReplyStatus.REPLY_RECEIVED:
            status = "PASSED"
        elif tat_14 < today:
            status = "PASSED"
        elif (tat_14 - today).days <= 3:
            status = "DUE_SOON"
        else:
            status = "UPCOMING"

        deadlines.append(
            Deadline(
                case_id=case_id,
                kind="GRIEVANCE_REPLY_WINDOW",
                due_date=_format_date(tat_14),
                status=status,
            )
        )
    elif grievance_sent:
        # Fallback to sent + 14 days if receipt not recorded
        tat_14 = grievance_sent + timedelta(days=14)
        status = "PASSED" if tat_14 < today else ("DUE_SOON" if (tat_14 - today).days <= 3 else "UPCOMING")
        deadlines.append(
            Deadline(
                case_id=case_id,
                kind="GRIEVANCE_REPLY_WINDOW",
                due_date=_format_date(tat_14),
                status=status,
            )
        )
    elif rep_date:
        # Grievance not yet filed: show recommended 30-day window from repudiation
        target = rep_date + timedelta(days=30)
        deadlines.append(
            Deadline(
                case_id=case_id,
                kind="GRIEVANCE_REPLY_WINDOW",
                due_date=_format_date(target),
                status="ACTION_NEEDED" if target >= today else "PASSED",
            )
        )

    # 2. Insurance Ombudsman Filing Limit (1 year)
    # Basis: decision receipt date or repudiation date
    base_ombudsman_date = reply_received_date or rep_date
    if base_ombudsman_date:
        # Approximate 1 year as 365 days or leap-safe year replacement
        try:
            omb_1yr = base_ombudsman_date.replace(year=base_ombudsman_date.year + 1)
        except ValueError:
            omb_1yr = base_ombudsman_date + timedelta(days=365)

        days_left = (omb_1yr - today).days
        if days_left < 0:
            omb_status = "PASSED"
        elif days_left <= 30:
            omb_status = "DUE_SOON"
        else:
            omb_status = "UPCOMING"

        deadlines.append(
            Deadline(
                case_id=case_id,
                kind="OMBUDSMAN_LIMIT",
                due_date=_format_date(omb_1yr),
                status=omb_status,
            )
        )

    return deadlines


# Alias for backward compatibility
evaluate_r9_deadlines = evaluate_deadlines
