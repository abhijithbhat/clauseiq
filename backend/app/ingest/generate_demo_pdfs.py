"""Deterministic generator for synthetic Demo Cases (FR14, Section 5, Section 20).

Creates realistic multi-page Indian health insurance policy PDFs, rejection letters,
and expected.json analysis contracts inside /data/mock_cases/ for:
1. case_01 (LIKELY_WRONGFUL — PED Waiting Period Completed)
2. case_02 (LIKELY_WRONGFUL — 60-Month Moratorium vs Non-Disclosure)
3. case_03 (LIKELY_VALID — Specific Illness Waiting Period Not Completed)
"""

import json
from pathlib import Path
from typing import Any, Dict, List
from reportlab.pdfgen import canvas

from backend.app.models.schemas import AnalysisResult


def _draw_page_lines(c: canvas.Canvas, lines: List[str], start_y: int = 900, leading: int = 14) -> None:
    """Helper to draw multi-line text on a single PDF page."""
    text_obj = c.beginText(50, start_y)
    text_obj.setFont("Helvetica", 10)
    text_obj.setLeading(leading)
    for line in lines:
        text_obj.textLine(line)
    c.drawText(text_obj)
    c.showPage()


def _generate_pdf(file_path: Path, pages_lines: List[List[str]]) -> None:
    """Create a multi-page PDF using ReportLab canvas."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(file_path), pagesize=(1400, 1000))
    for page_lines in pages_lines:
        _draw_page_lines(c, page_lines)
    c.save()


def build_case_01(base_dir: Path) -> None:
    """Case 01: PED Waiting Period Completed (1,20,000 INR, LIKELY_WRONGFUL)."""
    case_dir = base_dir / "case_01"
    case_dir.mkdir(parents=True, exist_ok=True)

    # 1. Policy PDF (8 pages, Clause 4.1 on page 7)
    policy_pages = [
        # Page 1: Policy Schedule
        [
            "Care Health Insurance Limited",
            "Policy Schedule - Care Classic Health Insurance",
            "Policy No: 14285739/00/00",
            "Insured Name: Ramesh Kumar Sharma",
            "First Inception Date: 15/04/2020",
            "Policy Period: 15/04/2024 to 14/04/2025",
            "Base Sum Insured: Rs. 5,00,000",
            "Cumulative Bonus: Rs. 50,000",
            "Total Sum Insured: Rs. 5,50,000",
        ],
        # Page 2: Definitions
        [
            "Section 1: Definitions and Interpretations",
            "1.1 Accident: An accident means sudden, unforeseen and involuntary event caused by external, visible means.",
            "1.2 Congenital Anomaly: Condition which is present according to medical norms from birth.",
            "1.3 Continuous Coverage: Unbroken period during which the insured has maintained cover under the policy.",
        ],
        # Page 3: Benefits
        [
            "Section 2: Scope of Coverage and Inpatient Hospitalisation",
            "2.1 Room Rent: Daily room rent capped at 1% of Sum Insured per day.",
            "2.2 ICU Charges: Intensive Care Unit charges covered up to 2% of Sum Insured per day.",
            "2.3 Nursing and Consultant Fees: Directly associated hospitalisation expenses covered.",
        ],
        # Page 4: Terms
        [
            "Section 3: General Terms and Conditions",
            "3.1 Renewal Terms: Policy is renewable lifelong except on grounds of established fraud.",
            "3.2 Portability: Waiting period credits will be carried forward under IRDAI portability regulations.",
        ],
        # Page 5: Waiting Periods
        [
            "Section 4: Exclusions and Waiting Periods",
            "4.0 Initial Waiting Period: Expenses related to treatment of any illness within 30 days from policy inception shall be excluded, except accidental injuries.",
        ],
        # Page 6: Specific Exclusions
        [
            "Section 4.2: Specific Illness Waiting Period",
            "Expenses related to the treatment of Cataract, Hernia, and Joint Replacement are excluded for 24 months.",
        ],
        # Page 7: Clause 4.1 (PED Clause)
        [
            "Clause 4.1: Pre-existing Disease Waiting Period",
            "Pre-existing Diseases (Code- Excl01): Expenses related to the treatment of a pre-existing disease (PED) and its direct complications shall be excluded until the expiry of 36 months of continuous coverage after the date of inception of the first policy with us.",
            "All complications arising directly out of pre-existing conditions shall also follow this waiting period schedule.",
        ],
        # Page 8: Grievance Redressal
        [
            "Section 5: Claims Procedure and Grievance Redressal",
            "5.1 Intimation: Claim intimation must be submitted within 30 days of hospital discharge.",
            "5.2 Grievance Officer: In case of dispute, insured may contact the Grievance Redressal Officer at gro@careinsurance.com.",
            "5.3 Ombudsman: Insured may approach the Insurance Ombudsman within 1 year from rejection.",
        ],
    ]
    _generate_pdf(case_dir / "policy.pdf", policy_pages)

    # 2. Rejection Letter PDF (1 page)
    rejection_pages = [
        [
            "Care Health Insurance Limited",
            "Grievance and Claims Management Division",
            "Date of Repudiation: 15/06/2024",
            "",
            "To: Ramesh Kumar Sharma",
            "Policy No: 14285739/00/00",
            "Claim Number: CLM-2024-984210",
            "Hospital: Manipal Hospital, Bengaluru",
            "Date of Admission: 20/05/2024",
            "Date of Discharge: 24/05/2024",
            "Diagnosis: Hypertension with symptomatic Cholelithiasis",
            "Treatment: Laparoscopic Cholecystectomy",
            "Claimed Amount: Rs. 1,20,000",
            "Disallowed Amount: Rs. 1,20,000",
            "",
            "Repudiation Reason:",
            "We regret to inform you that your claim is repudiated under Clause 4.1 (Pre-Existing Disease Waiting Period) as the patient has history of Hypertension which is a pre-existing condition.",
            "",
            "If you are not satisfied with this decision, you may file a representation before our Grievance Redressal Officer within 30 days.",
        ]
    ]
    _generate_pdf(case_dir / "rejection_letter.pdf", rejection_pages)

    # 3. Expected JSON contract
    expected_data: Dict[str, Any] = {
        "case_id": "case_01",
        "verdict": {
            "case_id": "case_01",
            "label": "LIKELY_WRONGFUL",
            "summary": "Your claim of ₹1,20,000 was wrongly rejected under the pre-existing disease clause. Your continuous coverage of 49 months exceeds the 36-month waiting period specified in your policy and regulatory rules.",
            "confidence": 0.95,
            "needs_human_review": False,
            "reasons": ["ev_01_ped_clause", "ev_02_repudiation_reason"],
        },
        "facts": {
            "insurer_name": "Care Health Insurance Limited",
            "policy_number": "14285739/00/00",
            "policy_type": "INDIVIDUAL",
            "insured_name": "Ramesh Kumar Sharma",
            "claim_number": "CLM-2024-984210",
            "claim_type": "REIMBURSEMENT",
            "claim_amount_inr": 120000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 120000.0,
            "rejection_date": "2024-06-15",
            "rejection_category": "PED",
            "rejection_reason_text": "We regret to inform you that your claim is repudiated under Clause 4.1 (Pre-Existing Disease Waiting Period) as the patient has history of Hypertension which is a pre-existing condition.",
            "cited_clause_ref": "Clause 4.1",
            "cited_clause_text": "Pre-existing Diseases (Code- Excl01): Expenses related to the treatment of a pre-existing disease (PED) and its direct complications shall be excluded until the expiry of 36 months of continuous coverage after the date of inception of the first policy with us.",
            "policy_first_inception_date": "2020-04-15",
            "current_period_start": "2024-04-15",
            "current_period_end": "2025-04-14",
            "admission_date": "2024-05-20",
            "discharge_date": "2024-05-24",
            "diagnosis_text": "Hypertension with symptomatic Cholelithiasis",
            "treatment_text": "Laparoscopic Cholecystectomy",
            "hospital_name": "Manipal Hospital, Bengaluru",
            "ped_alleged": True,
            "fraud_alleged": False,
            "room_rent_limit_per_day_inr": 5000.0,
            "room_rent_actual_per_day_inr": 4500.0,
            "ped_waiting_period_months": 36,
            "diagnosis_date": "2024-05-18",
            "prior_symptoms_or_consultation_evidence": True,
            "continuous_coverage_months": 49,
            "portability_continuity_months": 0,
            "sum_insured_inr": 500000.0,
            "base_sum_insured_inr": 500000.0,
            "sum_insured_enhanced_recently": False,
            "sum_insured_enhancement_date": None,
            "sum_insured_enhancement_amount_inr": None,
            "fraud_established": False,
            "initial_waiting_period_days": 30,
            "specific_illness_waiting_months": 24,
            "named_ailment_matched": None,
            "is_accident_case": False,
            "has_room_rent_proportionate_clause": True,
            "associated_medical_charges_inr": 80000.0,
            "non_associated_charges_inr": 40000.0,
            "room_rent_deduction_inr": 0.0,
            "claim_intimation_date": "2024-05-21",
            "policy_intimation_window_days": 30,
            "documents_requested_list": [],
            "grievance_sent_date": "2024-06-20",
            "grievance_received_date": "2024-06-22",
            "grievance_reply_received_date": None,
            "grievance_reply_status": "UNKNOWN",
            "grievance_satisfactory": None,
            "disallowed_items": [
                {"name": "Hospitalisation and surgery expenses", "amount_inr": 120000.0}
            ],
            "fields_confidence": {
                "insurer_name": 1.0,
                "policy_number": 1.0,
                "policy_type": 1.0,
                "claim_amount_inr": 1.0,
                "rejection_category": 1.0,
                "policy_first_inception_date": 0.98,
                "admission_date": 0.98,
            },
            "source_spans": {
                "insurer_name": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Care Health Insurance Limited",
                },
                "policy_number": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "Policy No: 14285739/00/00",
                },
                "policy_first_inception_date": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "First Inception Date: 15/04/2020",
                },
                "admission_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Admission: 20/05/2024",
                },
                "discharge_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Discharge: 24/05/2024",
                },
                "rejection_reason_text": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "We regret to inform you that your claim is repudiated under Clause 4.1 (Pre-Existing Disease Waiting Period) as the patient has history of Hypertension which is a pre-existing condition.",
                },
            },
        },
        "rules": [
            {
                "case_id": "case_01",
                "rule_id": "R1",
                "name": "PED waiting period",
                "outcome": "CONTRADICTS_INSURER",
                "inputs": {
                    "policy_first_inception_date": "2020-04-15",
                    "admission_date": "2024-05-20",
                    "continuous_cover_months": 49,
                    "policy_waiting_months": 36,
                    "statutory_max_waiting_months": 36,
                },
                "explanation": "Continuous coverage of 49 months exceeds the 36-month waiting period specified in Clause 4.1 and the IRDAI 2024 Master Circular. The pre-existing disease waiting period was fully completed before admission.",
                "law_ref": "IRDAI Master Circular on Operations and Allied Matters of Insurers - Health Insurance 2024, Clause 4.1 & Insurance Ombudsman Rules 2017",
                "supporting_evidence_ids": ["ev_01_ped_clause", "ev_02_repudiation_notice"],
            }
        ],
        "evidence": [
            {
                "id": "ev_01_ped_clause",
                "case_id": "case_01",
                "source_type": "POLICY",
                "source_ref": "Clause 4.1",
                "quote": "Expenses related to the treatment of a pre-existing disease (PED) and its direct complications shall be excluded until the expiry of 36 months of continuous coverage after the date of inception of the first policy with us.",
                "page": 7,
                "verified": True,
            },
            {
                "id": "ev_02_repudiation_reason",
                "case_id": "case_01",
                "source_type": "LETTER",
                "source_ref": "Repudiation Notice",
                "quote": "We regret to inform you that your claim is repudiated under Clause 4.1 (Pre-Existing Disease Waiting Period) as the patient has history of Hypertension which is a pre-existing condition.",
                "page": 1,
                "verified": True,
            },
        ],
        "money": {
            "claim_amount_inr": 120000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 120000.0,
        },
        "deadlines": [
            {
                "case_id": "case_01",
                "kind": "GRIEVANCE_REPLY_WINDOW",
                "due_date": "2024-07-15",
                "status": "PASSED",
            },
            {
                "case_id": "case_01",
                "kind": "OMBUDSMAN_LIMIT",
                "due_date": "2025-06-15",
                "status": "UPCOMING",
            },
        ],
        "letter_available": True,
        "warnings": [],
    }

    # Validate against AnalysisResult schema
    AnalysisResult.model_validate(expected_data)

    with open(case_dir / "expected.json", "w", encoding="utf-8") as f:
        json.dump(expected_data, f, indent=2)


def build_case_02(base_dir: Path) -> None:
    """Case 02: 60-Month Moratorium vs Non-Disclosure (2,45,000 INR, LIKELY_WRONGFUL)."""
    case_dir = base_dir / "case_02"
    case_dir.mkdir(parents=True, exist_ok=True)

    # 1. Policy PDF (8 pages, Clause 7.2 on page 5)
    policy_pages = [
        # Page 1: Policy Schedule
        [
            "Star Health and Allied Insurance Co. Ltd.",
            "Policy Schedule - Comprehensive Health Insurance Policy",
            "Policy Number: P/110022/01/2024/004567",
            "Insured Name: Sunita Sharma",
            "First Inception Date: 15/02/2019",
            "Policy Period: 15/02/2024 to 14/02/2025",
            "Base Sum Insured: Rs. 5,00,000",
            "Zone of Cover: Tier 1 - All India",
        ],
        # Page 2: Definitions
        [
            "Section 1: Definitions and Operating Guidelines",
            "1.1 Hospital: An institution established for indoor care and treatment of sick and injured persons.",
            "1.2 Day Care Treatment: Medical treatment or surgical procedure undertaken under general or local anaesthesia.",
        ],
        # Page 3: Benefits
        [
            "Section 2: Benefits and Hospitalisation Expenses",
            "2.1 Inpatient Hospitalisation: Room, board, nursing expenses as provided by hospital.",
            "2.2 Cardiac and Vascular Surgery: Coronary angioplasty and stenting covered up to Sum Insured.",
        ],
        # Page 4: Waiting Periods
        [
            "Section 3: Waiting Periods and Exclusions",
            "3.1 30-Day Waiting Period: Covered after 30 days except for accidents.",
            "3.2 Two-Year Exclusions: Specified illnesses excluded for 24 months.",
        ],
        # Page 5: Clause 7.2 (Disclosure Norm)
        [
            "Clause 7.2: Disclosure to Information Norm",
            "Disclosure to Information Norm (Code- Cond02): The policy shall be void and all premium paid hereon shall be forfeited to the Company in the event of misrepresentation, mis-description or non-disclosure of any material fact.",
            "The insured must disclose all medical history and pre-existing conditions accurately at the time of proposal.",
        ],
        # Page 6: Moratorium Benefits
        [
            "Section 8: Moratorium and Portability Benefits",
            "8.1 Moratorium Period: After completion of sixty continuous months under the policy, no claim shall be contestable by the insurer on grounds of misstatement or non-disclosure, except in cases of proven fraud under Section 45 of the Insurance Act.",
        ],
        # Page 7: Claims Procedure
        [
            "Section 9: Claims Procedure and Notice",
            "9.1 Intimation: Notice of claim to be submitted within 24 hours of emergency hospitalisation.",
            "9.2 Document Submission: Discharge summary, itemised bills, and receipts must be submitted within 15 days.",
        ],
        # Page 8: Ombudsman
        [
            "Section 10: Grievance Redressal and Ombudsman Scheme",
            "Insured may contact the Grievance Redressal Officer or approach the Insurance Ombudsman having jurisdiction.",
        ],
    ]
    _generate_pdf(case_dir / "policy.pdf", policy_pages)

    # 2. Rejection Letter PDF (1 page)
    rejection_pages = [
        [
            "Star Health and Allied Insurance Co. Ltd.",
            "Claims Management and Repudiation Department",
            "Date of Repudiation: 10/08/2024",
            "",
            "To: Sunita Sharma",
            "Policy Number: P/110022/01/2024/004567",
            "Claim Number: CIR/2024/110022/0987654",
            "Hospital: Apollo Hospitals, Chennai",
            "Date of Admission: 20/06/2024",
            "Date of Discharge: 25/06/2024",
            "Diagnosis: Acute Coronary Syndrome - Unstable Angina",
            "Treatment: Coronary Angiography and PTCA Stenting",
            "Claimed Amount: Rs. 2,45,000",
            "Disallowed Amount: Rs. 2,45,000",
            "",
            "Repudiation Reason:",
            "Your claim is repudiated under Clause 7.2 (Disclosure to Information Norm) on grounds of non-disclosure of pre-existing hypertension at the time of proposal.",
            "",
            "You may approach our Grievance Redressal Department if you wish to appeal this decision.",
        ]
    ]
    _generate_pdf(case_dir / "rejection_letter.pdf", rejection_pages)

    # 3. Expected JSON contract
    expected_data: Dict[str, Any] = {
        "case_id": "case_02",
        "verdict": {
            "case_id": "case_02",
            "label": "LIKELY_WRONGFUL",
            "summary": "Your claim of ₹2,45,000 was wrongly rejected by Star Health and Allied Insurance Co. Ltd. under Clause 7.2 for non-disclosure. Your policy has completed 64 months of continuous coverage, which surpasses the statutory 60-month moratorium period under Section 45 of the Insurance Act. The insurer cannot repudiate this claim without establishing fraud.",
            "confidence": 0.95,
            "needs_human_review": False,
            "reasons": ["ev_01_moratorium_clause", "ev_02_repudiation_notice"],
        },
        "facts": {
            "insurer_name": "Star Health and Allied Insurance Co. Ltd.",
            "policy_number": "P/110022/01/2024/004567",
            "policy_type": "INDIVIDUAL",
            "insured_name": "Sunita Sharma",
            "claim_number": "CIR/2024/110022/0987654",
            "claim_type": "REIMBURSEMENT",
            "claim_amount_inr": 245000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 245000.0,
            "rejection_date": "2024-08-10",
            "rejection_category": "NON_DISCLOSURE",
            "rejection_reason_text": "Your claim is repudiated under Clause 7.2 (Disclosure to Information Norm) on grounds of non-disclosure of pre-existing hypertension at the time of proposal.",
            "cited_clause_ref": "Clause 7.2",
            "cited_clause_text": "Disclosure to Information Norm (Code- Cond02): The policy shall be void and all premium paid hereon shall be forfeited to the Company in the event of misrepresentation, mis-description or non-disclosure of any material fact.",
            "policy_first_inception_date": "2019-02-15",
            "current_period_start": "2024-02-15",
            "current_period_end": "2025-02-14",
            "admission_date": "2024-06-20",
            "discharge_date": "2024-06-25",
            "diagnosis_text": "Acute Coronary Syndrome - Unstable Angina",
            "treatment_text": "Coronary Angiography and PTCA Stenting",
            "hospital_name": "Apollo Hospitals, Chennai",
            "ped_alleged": True,
            "fraud_alleged": False,
            "room_rent_limit_per_day_inr": 5000.0,
            "room_rent_actual_per_day_inr": 4800.0,
            "ped_waiting_period_months": 36,
            "diagnosis_date": "2024-06-18",
            "prior_symptoms_or_consultation_evidence": True,
            "continuous_coverage_months": 64,
            "portability_continuity_months": 0,
            "sum_insured_inr": 500000.0,
            "base_sum_insured_inr": 500000.0,
            "sum_insured_enhanced_recently": False,
            "sum_insured_enhancement_date": None,
            "sum_insured_enhancement_amount_inr": None,
            "fraud_established": False,
            "initial_waiting_period_days": 30,
            "specific_illness_waiting_months": 24,
            "named_ailment_matched": None,
            "is_accident_case": False,
            "has_room_rent_proportionate_clause": False,
            "associated_medical_charges_inr": 180000.0,
            "non_associated_charges_inr": 65000.0,
            "room_rent_deduction_inr": 0.0,
            "claim_intimation_date": "2024-06-21",
            "policy_intimation_window_days": 30,
            "documents_requested_list": [],
            "grievance_sent_date": "2024-08-18",
            "grievance_received_date": "2024-08-20",
            "grievance_reply_received_date": None,
            "grievance_reply_status": "UNKNOWN",
            "grievance_satisfactory": None,
            "disallowed_items": [
                {"name": "Hospitalisation and Angioplasty Surgery", "amount_inr": 245000.0}
            ],
            "fields_confidence": {
                "insurer_name": 1.0,
                "policy_number": 1.0,
                "policy_type": 1.0,
                "claim_amount_inr": 1.0,
                "rejection_category": 1.0,
                "policy_first_inception_date": 0.98,
                "admission_date": 0.98,
            },
            "source_spans": {
                "insurer_name": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Star Health and Allied Insurance Co. Ltd.",
                },
                "policy_number": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "Policy Number: P/110022/01/2024/004567",
                },
                "policy_first_inception_date": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "First Inception Date: 15/02/2019",
                },
                "admission_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Admission: 20/06/2024",
                },
                "discharge_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Discharge: 25/06/2024",
                },
                "rejection_reason_text": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Your claim is repudiated under Clause 7.2 (Disclosure to Information Norm) on grounds of non-disclosure of pre-existing hypertension at the time of proposal.",
                },
            },
        },
        "rules": [
            {
                "case_id": "case_02",
                "rule_id": "R2",
                "name": "Section 45 Moratorium Period",
                "outcome": "CONTRADICTS_INSURER",
                "inputs": {
                    "continuous_coverage_months": 64,
                    "fraud_established": False,
                    "moratorium_threshold_months": 60,
                    "base_sum_insured_inr": 500000.0,
                },
                "explanation": "The policy has completed 64 months of continuous coverage without break, which exceeds the statutory 60-month moratorium ceiling under Section 45 of the Insurance Act, 1938 and IRDAI Master Circular 2024. No claim can be repudiated on grounds of misstatement or non-disclosure after expiry of 60 months unless fraud is established.",
                "law_ref": "Insurance Act 1938 Section 45 & IRDAI Master Circular 2024 Para 12",
                "supporting_evidence_ids": ["ev_01_moratorium_clause", "ev_02_repudiation_notice"],
            }
        ],
        "evidence": [
            {
                "id": "ev_01_moratorium_clause",
                "case_id": "case_02",
                "source_type": "POLICY",
                "source_ref": "Clause 7.2",
                "quote": "Disclosure to Information Norm (Code- Cond02): The policy shall be void and all premium paid hereon shall be forfeited to the Company in the event of misrepresentation, mis-description or non-disclosure of any material fact.",
                "page": 5,
                "verified": True,
            },
            {
                "id": "ev_02_repudiation_notice",
                "case_id": "case_02",
                "source_type": "LETTER",
                "source_ref": "Repudiation Letter",
                "quote": "Your claim is repudiated under Clause 7.2 (Disclosure to Information Norm) on grounds of non-disclosure of pre-existing hypertension at the time of proposal.",
                "page": 1,
                "verified": True,
            },
        ],
        "money": {
            "claim_amount_inr": 245000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 245000.0,
        },
        "deadlines": [
            {
                "case_id": "case_02",
                "kind": "GRIEVANCE_REPLY_WINDOW",
                "due_date": "2024-09-09",
                "status": "PASSED",
            },
            {
                "case_id": "case_02",
                "kind": "OMBUDSMAN_LIMIT",
                "due_date": "2025-08-10",
                "status": "UPCOMING",
            },
        ],
        "letter_available": True,
        "warnings": [],
    }

    AnalysisResult.model_validate(expected_data)

    with open(case_dir / "expected.json", "w", encoding="utf-8") as f:
        json.dump(expected_data, f, indent=2)


def build_case_03(base_dir: Path) -> None:
    """Case 03: Specific Illness Waiting Period Not Completed (85,000 INR, LIKELY_VALID)."""
    case_dir = base_dir / "case_03"
    case_dir.mkdir(parents=True, exist_ok=True)

    # 1. Policy PDF (8 pages, Clause 4.2 on page 6)
    policy_pages = [
        # Page 1: Policy Schedule
        [
            "Niva Bupa Health Insurance Co. Ltd.",
            "Policy Schedule - ReAssure 2.0 Health Plan",
            "Policy Number: NB-30918274-01",
            "Insured Name: Anand Verma",
            "First Inception Date: 01/11/2023",
            "Policy Period: 01/11/2023 to 31/10/2024",
            "Base Sum Insured: Rs. 4,00,000",
            "Cover Type: Individual Standard",
        ],
        # Page 2: Definitions
        [
            "Section 1: Definitions and Operating Rules",
            "1.1 Day Care Centre: Any institution established for day care treatment of illness and/or injuries.",
            "1.2 Deductible: A cost-sharing requirement in an insurance policy that provides that insurer will not be liable for specified amount.",
        ],
        # Page 3: Coverage Scope
        [
            "Section 2: Inpatient Treatment and Modern Treatments",
            "2.1 Modern Treatments: Treatments including Robotic Surgery, Stereotactic surgery, and Phacoemulsification covered up to Sum Insured.",
        ],
        # Page 4: General Waiting Periods
        [
            "Section 3: Waiting Periods and Exclusions",
            "3.1 Initial Waiting Period: Expenses related to any illness within 30 days are excluded except accidents.",
        ],
        # Page 5: PED Exclusions
        [
            "Section 4: Pre-Existing Disease Waiting Period",
            "4.1 PED Cover: Expenses related to pre-existing conditions shall be covered after 36 months of continuous cover.",
        ],
        # Page 6: Clause 4.2 (Specific Illness Waiting Period)
        [
            "Clause 4.2: Specific Illness Waiting Period",
            "Specific Illness Waiting Period (Code- Excl02): Expenses related to the treatment of Cataract, Benign Prostatic Hypertrophy, Hernia, Hydrocele, and Joint Replacement Surgeries shall be excluded until the expiry of 24 months of continuous coverage after the date of inception of the first policy.",
            "This exclusion shall not apply if the treatment is necessitated by an unforeseen accidental injury.",
        ],
        # Page 7: Terms & Conditions
        [
            "Section 5: General Policy Terms and Conditions",
            "5.1 Free Look Period: Insured has a period of 15 days from receipt to review policy terms.",
            "5.2 Grace Period: A grace period of 30 days is permissible for renewal of the policy.",
        ],
        # Page 8: Claims & Ombudsman
        [
            "Section 6: Claim Settlement and Grievance Redressal",
            "Claims must be intimated within 48 hours of admission. Insurance Ombudsman contact details listed herein.",
        ],
    ]
    _generate_pdf(case_dir / "policy.pdf", policy_pages)

    # 2. Rejection Letter PDF (1 page)
    rejection_pages = [
        [
            "Niva Bupa Health Insurance Co. Ltd.",
            "Claims Redressal and Repudiation Department",
            "Date of Repudiation: 12/09/2024",
            "",
            "To: Anand Verma",
            "Policy Number: NB-30918274-01",
            "Claim Number: NB-CLM-2024-55412",
            "Hospital: Dr. Agarwal's Eye Hospital, Bengaluru",
            "Date of Admission: 02/09/2024",
            "Date of Discharge: 03/09/2024",
            "Diagnosis: Mature Senile Cataract Left Eye",
            "Treatment: Phacoemulsification with Foldable IOL Implantation",
            "Claimed Amount: Rs. 85,000",
            "Disallowed Amount: Rs. 85,000",
            "",
            "Repudiation Reason:",
            "We regret to inform you that your claim for Cataract Surgery is repudiated under Clause 4.2 (Specific Illness Waiting Period) as the surgery occurred within the 24-month specific waiting period from the date of policy inception.",
            "",
            "Should you have any grievances, you may contact our Grievance Redressal Officer.",
        ]
    ]
    _generate_pdf(case_dir / "rejection_letter.pdf", rejection_pages)

    # 3. Expected JSON contract
    expected_data: Dict[str, Any] = {
        "case_id": "case_03",
        "verdict": {
            "case_id": "case_03",
            "label": "LIKELY_VALID",
            "summary": "Your claim of ₹85,000 was rejected by Niva Bupa Health Insurance Co. Ltd. under policy terms for waiting period. The policy documents confirm a 24-month specific waiting period for cataract surgery, whereas your continuous coverage is 10 months. Because this was not caused by an accident, the insurer's rejection aligns with the contractual waiting period.",
            "confidence": 0.95,
            "needs_human_review": False,
            "reasons": ["ev_01_specific_waiting_clause", "ev_02_repudiation_notice"],
        },
        "facts": {
            "insurer_name": "Niva Bupa Health Insurance Co. Ltd.",
            "policy_number": "NB-30918274-01",
            "policy_type": "INDIVIDUAL",
            "insured_name": "Anand Verma",
            "claim_number": "NB-CLM-2024-55412",
            "claim_type": "REIMBURSEMENT",
            "claim_amount_inr": 85000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 85000.0,
            "rejection_date": "2024-09-12",
            "rejection_category": "WAITING_PERIOD",
            "rejection_reason_text": "We regret to inform you that your claim for Cataract Surgery is repudiated under Clause 4.2 (Specific Illness Waiting Period) as the surgery occurred within the 24-month specific waiting period from the date of policy inception.",
            "cited_clause_ref": "Clause 4.2",
            "cited_clause_text": "Specific Illness Waiting Period (Code- Excl02): Expenses related to the treatment of Cataract, Benign Prostatic Hypertrophy, Hernia, Hydrocele, and Joint Replacement Surgeries shall be excluded until the expiry of 24 months of continuous coverage after the date of inception of the first policy.",
            "policy_first_inception_date": "2023-11-01",
            "current_period_start": "2023-11-01",
            "current_period_end": "2024-10-31",
            "admission_date": "2024-09-02",
            "discharge_date": "2024-09-03",
            "diagnosis_text": "Mature Senile Cataract Left Eye",
            "treatment_text": "Phacoemulsification with Foldable IOL Implantation",
            "hospital_name": "Dr. Agarwal's Eye Hospital, Bengaluru",
            "ped_alleged": False,
            "fraud_alleged": False,
            "room_rent_limit_per_day_inr": 4000.0,
            "room_rent_actual_per_day_inr": 3500.0,
            "ped_waiting_period_months": 36,
            "diagnosis_date": "2024-08-25",
            "prior_symptoms_or_consultation_evidence": False,
            "continuous_coverage_months": 10,
            "portability_continuity_months": 0,
            "sum_insured_inr": 400000.0,
            "base_sum_insured_inr": 400000.0,
            "sum_insured_enhanced_recently": False,
            "sum_insured_enhancement_date": None,
            "sum_insured_enhancement_amount_inr": None,
            "fraud_established": False,
            "initial_waiting_period_days": 30,
            "specific_illness_waiting_months": 24,
            "named_ailment_matched": "Cataract",
            "is_accident_case": False,
            "has_room_rent_proportionate_clause": False,
            "associated_medical_charges_inr": 70000.0,
            "non_associated_charges_inr": 15000.0,
            "room_rent_deduction_inr": 0.0,
            "claim_intimation_date": "2024-09-02",
            "policy_intimation_window_days": 30,
            "documents_requested_list": [],
            "grievance_sent_date": "2024-09-20",
            "grievance_received_date": "2024-09-22",
            "grievance_reply_received_date": None,
            "grievance_reply_status": "UNKNOWN",
            "grievance_satisfactory": None,
            "disallowed_items": [
                {"name": "Cataract Day Care Surgery & Lens", "amount_inr": 85000.0}
            ],
            "fields_confidence": {
                "insurer_name": 1.0,
                "policy_number": 1.0,
                "policy_type": 1.0,
                "claim_amount_inr": 1.0,
                "rejection_category": 1.0,
                "policy_first_inception_date": 0.98,
                "admission_date": 0.98,
            },
            "source_spans": {
                "insurer_name": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Niva Bupa Health Insurance Co. Ltd.",
                },
                "policy_number": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "Policy Number: NB-30918274-01",
                },
                "policy_first_inception_date": {
                    "document": "POLICY",
                    "page": 1,
                    "quote": "First Inception Date: 01/11/2023",
                },
                "admission_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Admission: 02/09/2024",
                },
                "discharge_date": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "Date of Discharge: 03/09/2024",
                },
                "rejection_reason_text": {
                    "document": "REJECTION_LETTER",
                    "page": 1,
                    "quote": "We regret to inform you that your claim for Cataract Surgery is repudiated under Clause 4.2 (Specific Illness Waiting Period) as the surgery occurred within the 24-month specific waiting period from the date of policy inception.",
                },
            },
        },
        "rules": [
            {
                "case_id": "case_03",
                "rule_id": "R4",
                "name": "Specific Illness Waiting Period",
                "outcome": "SUPPORTS_INSURER",
                "inputs": {
                    "continuous_coverage_months": 10,
                    "specific_illness_waiting_months": 24,
                    "named_ailment": "Cataract",
                    "is_accident_case": False,
                },
                "explanation": "The treatment for Cataract occurred after 10 months of continuous coverage, which is less than the mandatory 24-month specific illness waiting period defined under Clause 4.2. As the treatment was not necessitated by an accident, the repudiation is contractually supported.",
                "law_ref": "IRDAI Master Circular 2024 Clause 4.2 & Standard Policy Terms",
                "supporting_evidence_ids": ["ev_01_specific_waiting_clause", "ev_02_repudiation_notice"],
            }
        ],
        "evidence": [
            {
                "id": "ev_01_specific_waiting_clause",
                "case_id": "case_03",
                "source_type": "POLICY",
                "source_ref": "Clause 4.2",
                "quote": "Specific Illness Waiting Period (Code- Excl02): Expenses related to the treatment of Cataract, Benign Prostatic Hypertrophy, Hernia, Hydrocele, and Joint Replacement Surgeries shall be excluded until the expiry of 24 months of continuous coverage after the date of inception of the first policy.",
                "page": 6,
                "verified": True,
            },
            {
                "id": "ev_02_repudiation_notice",
                "case_id": "case_03",
                "source_type": "LETTER",
                "source_ref": "Repudiation Letter",
                "quote": "We regret to inform you that your claim for Cataract Surgery is repudiated under Clause 4.2 (Specific Illness Waiting Period) as the surgery occurred within the 24-month specific waiting period from the date of policy inception.",
                "page": 1,
                "verified": True,
            },
        ],
        "money": {
            "claim_amount_inr": 85000.0,
            "settled_amount_inr": 0.0,
            "disallowed_amount_inr": 85000.0,
        },
        "deadlines": [
            {
                "case_id": "case_03",
                "kind": "GRIEVANCE_REPLY_WINDOW",
                "due_date": "2024-10-12",
                "status": "PASSED",
            },
            {
                "case_id": "case_03",
                "kind": "OMBUDSMAN_LIMIT",
                "due_date": "2025-09-12",
                "status": "UPCOMING",
            },
        ],
        "letter_available": True,
        "warnings": [],
    }

    AnalysisResult.model_validate(expected_data)

    with open(case_dir / "expected.json", "w", encoding="utf-8") as f:
        json.dump(expected_data, f, indent=2)


def generate_all_demo_cases(target_dir: Path) -> None:
    """Generate all 3 flagship demo cases in target directory."""
    build_case_01(target_dir)
    build_case_02(target_dir)
    build_case_03(target_dir)


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent.parent.parent / "data" / "mock_cases"
    print(f"Generating demo PDFs and contracts in {base}...")
    generate_all_demo_cases(base)
    print("Successfully generated case_01, case_02, and case_03.")
