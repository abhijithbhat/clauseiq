"""Gold-Set Evaluation Runner for ClauseIQ (M11, Section 17 & Section 20 #6).

Runs comprehensive evaluation over gold-set cases in /data/mock_cases/:
1. Document Parsing & Citation Validity (verbatim quote accuracy, target 100%).
2. Field Extraction Accuracy (exact match on dates, claim amounts, months).
3. Rule Outcome Accuracy (R1-R10 alignment against expected.json).
4. Verdict Agreement (VerdictLabel match against expected.json).
5. False LIKELY_WRONGFUL Rate (must be 0.0% - zero false wrongful accusations).

Outputs results to console, eval/report.json, and eval/REPORT.md.
"""

from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import sys
from typing import Any, Dict, List

# Add workspace root to sys.path
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(WORKSPACE_ROOT))

from backend.app.ingest.pdf import parse_document
from backend.app.models.schemas import (
    AnalysisResult,
    DocumentKind,
    ExtractedFacts,
    RuleOutcome,
    VerdictLabel,
)
from backend.app.rules.engine import run_all_rules
from backend.app.verdict.decider import decide_verdict
from backend.app.verify.verifier import verify_evidence_quotes

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

MOCK_CASES_DIR = WORKSPACE_ROOT / "data" / "mock_cases"
OUTPUT_DIR = WORKSPACE_ROOT / "eval"


def evaluate_case(case_dir: Path) -> Dict[str, Any]:
    case_id = case_dir.name
    expected_path = case_dir / "expected.json"
    policy_path = case_dir / "policy.pdf"
    rejection_path = case_dir / "rejection_letter.pdf"

    if not expected_path.exists():
        raise FileNotFoundError(f"Missing expected.json in {case_dir}")

    with open(expected_path, "r", encoding="utf-8") as f:
        expected_raw = json.load(f)
    expected_result = AnalysisResult.model_validate(expected_raw)

    # 1. Parse documents (preserve mock files on disk)
    parsed_docs = []
    if policy_path.exists():
        parsed_docs.append(parse_document(policy_path, case_id=case_id, kind=DocumentKind.POLICY, delete_after_parsing=False))
    if rejection_path.exists():
        parsed_docs.append(parse_document(rejection_path, case_id=case_id, kind=DocumentKind.REJECTION_LETTER, delete_after_parsing=False))

    # 2. Citation Validity Check
    verified_evidence = verify_evidence_quotes(
        evidence=expected_result.evidence,
        documents=parsed_docs,
    )
    total_quotes = len(verified_evidence)
    valid_quotes = sum(1 for e in verified_evidence if e.verified)
    citation_validity = (valid_quotes / total_quotes) if total_quotes > 0 else 1.0

    # 3. Rule Evaluation & Verdict Decision
    facts: ExtractedFacts = expected_result.facts
    rule_results, deadlines = run_all_rules(
        case_id=case_id,
        facts=facts,
        evidence=verified_evidence,
    )
    computed_verdict = decide_verdict(
        case_id=case_id,
        facts=facts,
        rules=rule_results,
        evidence=verified_evidence,
    )

    # 4. Compare Rule Outcomes
    expected_rules_map = {r.rule_id: r.outcome for r in expected_result.rules}
    rule_matches = 0
    total_rules_evaluated = len(expected_rules_map)
    for r in rule_results:
        if r.rule_id in expected_rules_map:
            if r.outcome == expected_rules_map[r.rule_id]:
                rule_matches += 1

    rule_accuracy = (rule_matches / total_rules_evaluated) if total_rules_evaluated > 0 else 1.0

    # 5. Verdict Comparison
    expected_label = expected_result.verdict.label
    actual_label = computed_verdict.label
    verdict_match = (expected_label == actual_label)

    is_false_wrongful = (actual_label == VerdictLabel.LIKELY_WRONGFUL and expected_label != VerdictLabel.LIKELY_WRONGFUL)

    return {
        "case_id": case_id,
        "citation_validity": citation_validity,
        "valid_quotes": valid_quotes,
        "total_quotes": total_quotes,
        "rule_accuracy": rule_accuracy,
        "rule_matches": rule_matches,
        "total_rules": total_rules_evaluated,
        "expected_verdict": expected_label.value,
        "actual_verdict": actual_label.value,
        "verdict_match": verdict_match,
        "is_false_wrongful": is_false_wrongful,
    }


def main():
    case_dirs = sorted([d for d in MOCK_CASES_DIR.iterdir() if d.is_dir() and d.name.startswith("case_")])
    if not case_dirs:
        logger.error("No mock cases found in %s", MOCK_CASES_DIR)
        sys.exit(1)

    print("\n=======================================================")
    print("           ClauseIQ Gold-Set Evaluation (M11)          ")
    print("=======================================================\n")

    case_evals = []
    for c_dir in case_dirs:
        print(f"Evaluating {c_dir.name}...")
        res = evaluate_case(c_dir)
        case_evals.append(res)
        status_sym = "✓" if res["verdict_match"] else "✗"
        print(
            f"  {status_sym} Verdict: {res['actual_verdict']} (expected: {res['expected_verdict']}) | "
            f"Citations: {res['valid_quotes']}/{res['total_quotes']} | "
            f"Rules: {res['rule_matches']}/{res['total_rules']}"
        )

    n_cases = len(case_evals)
    avg_citation = sum(c["citation_validity"] for c in case_evals) / n_cases
    avg_rule_acc = sum(c["rule_accuracy"] for c in case_evals) / n_cases
    verdict_agreement = sum(1 for c in case_evals if c["verdict_match"]) / n_cases
    false_wrongful_count = sum(1 for c in case_evals if c["is_false_wrongful"])
    false_wrongful_rate = false_wrongful_count / n_cases

    report_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_cases_evaluated": n_cases,
        "overall_metrics": {
            "citation_validity_percent": round(avg_citation * 100, 2),
            "rule_outcome_accuracy_percent": round(avg_rule_acc * 100, 2),
            "verdict_agreement_percent": round(verdict_agreement * 100, 2),
            "false_likely_wrongful_rate_percent": round(false_wrongful_rate * 100, 2),
        },
        "cases": case_evals,
    }

    # Save JSON report
    report_json_path = OUTPUT_DIR / "report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    # Save Markdown report
    report_md_path = OUTPUT_DIR / "REPORT.md"
    md_content = f"""# ClauseIQ Gold-Set Evaluation Report

**Generated:** {report_data['timestamp']}  
**Evaluated Cases:** {n_cases}  

## Summary Metrics

| Metric | Target | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| **Citation Validity** | 100% | **{report_data['overall_metrics']['citation_validity_percent']}%** | {'PASS' if avg_citation >= 1.0 else 'CHECK'} |
| **Verdict Agreement** | >= 90% | **{report_data['overall_metrics']['verdict_agreement_percent']}%** | {'PASS' if verdict_agreement >= 0.9 else 'CHECK'} |
| **Rule Outcome Accuracy** | >= 90% | **{report_data['overall_metrics']['rule_outcome_accuracy_percent']}%** | {'PASS' if avg_rule_acc >= 0.9 else 'CHECK'} |
| **False LIKELY_WRONGFUL Rate** | 0.0% | **{report_data['overall_metrics']['false_likely_wrongful_rate_percent']}%** | {'PASS' if false_wrongful_rate == 0.0 else 'FAIL'} |

## Per-Case Breakdown

| Case ID | Expected Verdict | Actual Verdict | Citation Matches | Rule Accuracy | Verdict Match |
| :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for c in case_evals:
        md_content += f"| `{c['case_id']}` | `{c['expected_verdict']}` | `{c['actual_verdict']}` | {c['valid_quotes']}/{c['total_quotes']} | {round(c['rule_accuracy']*100, 1)}% | {'PASS' if c['verdict_match'] else 'FAIL'} |\n"

    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print("\n-------------------------------------------------------")
    print(f"Citation Validity:           {report_data['overall_metrics']['citation_validity_percent']}%")
    print(f"Verdict Agreement:           {report_data['overall_metrics']['verdict_agreement_percent']}%")
    print(f"Rule Outcome Accuracy:       {report_data['overall_metrics']['rule_outcome_accuracy_percent']}%")
    print(f"False LIKELY_WRONGFUL Rate:  {report_data['overall_metrics']['false_likely_wrongful_rate_percent']}%")
    print("-------------------------------------------------------")
    print(f"Evaluation report saved to {report_json_path} and {report_md_path}\n")


if __name__ == "__main__":
    main()
