"""Unit tests for M3: LLM client, cache, rate limits, budget, and fact extractor."""

import json
from pathlib import Path
import tempfile
from unittest.mock import MagicMock, patch
import pytest
from pydantic import BaseModel

from backend.app.core.cache import (
    clear_cache,
    compute_cache_key,
    get_cached_response,
    set_cached_response,
)
from backend.app.core.errors import CallBudgetExceededError, RateLimitError
from backend.app.core.llm_client import (
    generate_json,
    generate_text,
    get_case_call_count,
    reset_case_budget,
)
from backend.app.extract.extractor import (
    extract_case_facts,
    format_documents_for_extraction,
    normalize_indian_date,
)
from backend.app.models.schemas import (
    DocumentKind,
    DocumentPages,
    EvidenceSourceType,
    ExtractedFacts,
    RejectionCategory,
)


class DummySchema(BaseModel):
    summary: str
    count: int


def test_sqlite_prompt_cache_operations() -> None:
    """Verify SQLite prompt cache storage, lookup, key calculation, and clearing."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = Path(f.name)

    try:
        key = compute_cache_key("test-model", "test prompt", "DummySchema")
        assert get_cached_response(key, db_path=db_path) is None

        payload = json.dumps({"summary": "Approved", "count": 10})
        set_cached_response(key, payload, db_path=db_path)

        cached = get_cached_response(key, db_path=db_path)
        assert cached == payload

        clear_cache(db_path=db_path)
        assert get_cached_response(key, db_path=db_path) is None
    finally:
        if db_path.exists():
            db_path.unlink()


def test_cache_hit_skips_llm_api_call() -> None:
    """Ensure that a cache hit directly returns validated model without invoking the API."""
    key = compute_cache_key("test-model", "What is the capital?", "DummySchema")
    set_cached_response(key, json.dumps({"summary": "Paris", "count": 1}))

    with patch("backend.app.core.llm_client._get_genai_client") as mock_get_client:
        res = generate_json(
            prompt="What is the capital?",
            schema=DummySchema,
            model="test-model",
            case_id="case_cache_test",
        )
        assert res.summary == "Paris"
        assert res.count == 1
        # genai client must not have been instantiated on cache hit
        mock_get_client.assert_not_called()


def test_indian_date_normalisation() -> None:
    """Verify deterministic conversion of Indian date formats (DD/MM/YYYY) to ISO (YYYY-MM-DD)."""
    assert normalize_indian_date("14/08/2025") == "2025-08-14"
    assert normalize_indian_date("20/05/2024") == "2024-05-20"
    assert normalize_indian_date("15-04-2020") == "2020-04-15"
    assert normalize_indian_date("01.04.2024") == "2024-04-01"
    assert normalize_indian_date("5/8/2023") == "2023-08-05"
    assert normalize_indian_date("2024-06-15") == "2024-06-15"
    assert normalize_indian_date("   14/08/2025   ") == "2025-08-14"
    assert normalize_indian_date(None) is None
    assert normalize_indian_date("") is None
    assert normalize_indian_date("not-a-date") == "not-a-date"


def test_rate_limit_exponential_backoff_and_error() -> None:
    """Verify exponential backoff retries on HTTP 429 and eventual RateLimitError."""
    with patch("backend.app.core.llm_client.get_cached_response", return_value=None):
        with patch("backend.app.core.llm_client._get_genai_client") as mock_client_factory:
            mock_client = MagicMock()
            mock_client.models.generate_content.side_effect = RuntimeError(
                "429 ResourceExhausted: Quota exceeded"
            )
            mock_client_factory.return_value = mock_client

            with patch("time.sleep") as mock_sleep:
                with pytest.raises(RateLimitError) as exc_info:
                    generate_text(
                        prompt="Unique retry test prompt",
                        model="retry-test-model",
                        delays=(0.01, 0.02, 0.04),
                    )

                assert exc_info.value.code == "AI_RATE_LIMIT"
                assert "High demand, retry in a minute" in exc_info.value.message
                assert mock_sleep.call_count == 3


def test_per_case_ai_call_budget_guard() -> None:
    """Verify that a single case is restricted to at most 6 AI calls."""
    case_id = "case_budget_test_01"
    reset_case_budget(case_id)

    with patch("backend.app.core.llm_client.get_cached_response", return_value=None):
        with patch("backend.app.core.llm_client._get_genai_client") as mock_client_factory:
            mock_client = MagicMock()
            mock_resp = MagicMock()
            mock_resp.text = json.dumps({"summary": "ok", "count": 1})
            mock_client.models.generate_content.return_value = mock_resp
            mock_client_factory.return_value = mock_client

            # Make 6 distinct calls
            for i in range(6):
                res = generate_json(
                    prompt=f"Budget prompt {i}",
                    schema=DummySchema,
                    model=f"model-budget-{i}",
                    case_id=case_id,
                )
                assert res.summary == "ok"

            assert get_case_call_count(case_id) == 6

            # 7th call must trigger CallBudgetExceededError
            with pytest.raises(CallBudgetExceededError) as exc_info:
                generate_json(
                    prompt="Exceed budget prompt",
                    schema=DummySchema,
                    model="model-budget-7",
                    case_id=case_id,
                )

            assert exc_info.value.code == "AI_BUDGET_EXCEEDED"
            assert "budget limit of 6 calls exceeded" in exc_info.value.message


def test_format_documents_for_extraction() -> None:
    """Verify document formatting outputs explicit page markers."""
    doc = DocumentPages(
        case_id="case_fmt_01",
        kind=DocumentKind.POLICY,
        filename="policy.pdf",
        pages=2,
        text_by_page={1: "Clause 1 Definitions", 2: "Clause 4 Waiting Period"},
        ocr_used=False,
    )
    formatted = format_documents_for_extraction([doc])
    assert "[DOC: POLICY | FILENAME: policy.pdf | PAGE: 1]" in formatted
    assert "Clause 1 Definitions" in formatted
    assert "[DOC: POLICY | FILENAME: policy.pdf | PAGE: 2]" in formatted
    assert "Clause 4 Waiting Period" in formatted


def test_extract_case_facts_with_fixture() -> None:
    """Verify extract_case_facts parses facts, normalizes dates, and creates initial Evidence items."""
    fixture_path = (
        Path(__file__).resolve().parent.parent.parent
        / "data"
        / "mock_cases"
        / "case_01"
        / "expected.json"
    )
    with open(fixture_path, "r", encoding="utf-8") as f:
        fixture_data = json.load(f)

    mock_facts = ExtractedFacts.model_validate(fixture_data["facts"])
    # Simulate Indian date format coming from raw extraction to test post-processor
    mock_facts.rejection_date = "15/06/2024"
    mock_facts.admission_date = "20/05/2024"

    doc = DocumentPages(
        case_id="case_01",
        kind=DocumentKind.REJECTION_LETTER,
        filename="rejection.pdf",
        pages=1,
        text_by_page={1: "Care Health Insurance repudiation letter"},
        ocr_used=False,
    )

    with patch("backend.app.extract.extractor.generate_json", return_value=mock_facts):
        facts, evidence = extract_case_facts(case_id="case_01", documents=[doc])

    # Validate facts
    assert facts.insurer_name == "Care Health Insurance Limited"
    assert facts.rejection_category == RejectionCategory.PED
    assert facts.claim_amount_inr == 120000.0
    # Date normalisation check
    assert facts.rejection_date == "2024-06-15"
    assert facts.admission_date == "2024-05-20"

    # Validate evidence generation
    assert len(evidence) == len(facts.source_spans)
    assert all(ev.case_id == "case_01" for ev in evidence)
    assert all(ev.verified is False for ev in evidence)  # Ready for M6 verifier

    # Check mapping of evidence source type
    policy_ev = next(ev for ev in evidence if "policy_number" in ev.id)
    assert policy_ev.source_type == EvidenceSourceType.POLICY
    assert policy_ev.page == 1
    assert "14285739/00/00" in policy_ev.quote
