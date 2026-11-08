"""Model-agnostic LLM client for ClauseIQ using Google GenAI SDK.

Implements Section 12 requirements:
- Model-agnostic interface (generate_json, generate_text)
- SQLite prompt cache via sha256(model + schema + prompt)
- Per-case AI call budget guard (max 6 calls per case)
- Exponential retry backoff (2s, 4s, 8s) on rate limits (HTTP 429)
- Structured JSON output with temperature=0.0
"""

from collections import defaultdict
import json
import logging
import re
import time
from typing import Any, Dict, Optional, Tuple, Type, TypeVar
from pydantic import BaseModel

from google import genai
from google.genai import types

from backend.app.core.cache import compute_cache_key, get_cached_response, set_cached_response
from backend.app.core.config import settings
from backend.app.core.errors import CallBudgetExceededError, RateLimitError

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

MAX_CALLS_PER_CASE: int = 6
BACKOFF_DELAYS: Tuple[float, ...] = (2.0, 4.0, 8.0)

# In-memory per-case call tracker
_case_call_counts: Dict[str, int] = defaultdict(int)


def reset_case_budget(case_id: Optional[str] = None) -> None:
    """Reset the call counter for a specific case, or all cases if None."""
    if case_id:
        _case_call_counts.pop(case_id, None)
    else:
        _case_call_counts.clear()


def get_case_call_count(case_id: str) -> int:
    """Return the number of AI calls made for a given case."""
    return _case_call_counts.get(case_id, 0)


def _check_and_increment_budget(case_id: Optional[str]) -> None:
    """Ensure a case does not exceed its maximum budget of 6 AI calls."""
    if not case_id:
        return
    if _case_call_counts[case_id] >= MAX_CALLS_PER_CASE:
        raise CallBudgetExceededError()
    _case_call_counts[case_id] += 1


def _is_rate_limit_exception(exc: Exception) -> bool:
    """Detect whether an exception indicates HTTP 429 or quota exhaustion."""
    err_str = str(exc).lower()
    return "429" in err_str or "resource_exhausted" in err_str or "rate limit" in err_str or "quota" in err_str


def _strip_markdown_json(text: str) -> str:
    """Clean markdown code fences from JSON text if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


def _get_genai_client() -> genai.Client:
    """Instantiate the official GenAI SDK client."""
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_json(
    prompt: str,
    schema: Type[T],
    model: Optional[str] = None,
    case_id: Optional[str] = None,
    delays: Tuple[float, ...] = BACKOFF_DELAYS,
) -> T:
    """Generate structured JSON conforming to a Pydantic schema using Gemini.

    Args:
        prompt: User/System prompt instruction.
        schema: Target Pydantic model class.
        model: Model identifier override (defaults to settings.LLM_MODEL_EXTRACT).
        case_id: Optional Case ID to track and enforce the 6-call budget.
        delays: Backoff delay tuple for retries.

    Returns:
        Validated instance of schema.

    Raises:
        RateLimitError: If retries on HTTP 429 are exhausted.
        CallBudgetExceededError: If the case exceeds 6 calls.
        ValueError / ValidationError: If response cannot be parsed into schema.
    """
    model_name = model or settings.LLM_MODEL_EXTRACT
    cache_key = compute_cache_key(model=model_name, prompt=prompt, schema_name=schema.__name__)

    # Check cache first (cached hits do not consume API budget)
    cached_text = get_cached_response(cache_key)
    if cached_text is not None:
        clean_cached = _strip_markdown_json(cached_text)
        return schema.model_validate_json(clean_cached)

    # Enforce case call budget on cache miss
    _check_and_increment_budget(case_id)

    client = _get_genai_client()
    config = types.GenerateContentConfig(
        temperature=0.0,
        response_mime_type="application/json",
        response_schema=schema,
    )

    last_error: Optional[Exception] = None
    for attempt, delay in enumerate((0.0,) + delays):
        if delay > 0:
            time.sleep(delay)
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            raw_text = response.text or ""
            clean_json = _strip_markdown_json(raw_text)

            # Validate against schema
            parsed = schema.model_validate_json(clean_json)

            # Cache successful response
            set_cached_response(cache_key, clean_json)
            return parsed

        except Exception as e:
            last_error = e
            if _is_rate_limit_exception(e):
                logger.warning("Gemini rate limit hit on attempt %d: %s", attempt + 1, e)
                continue
            raise

    # Retries exhausted
    raise RateLimitError() from last_error


def generate_text(
    prompt: str,
    model: Optional[str] = None,
    case_id: Optional[str] = None,
    delays: Tuple[float, ...] = BACKOFF_DELAYS,
) -> str:
    """Generate freeform plain text explanation or grounds using Gemini.

    Args:
        prompt: Instruction prompt.
        model: Model identifier override (defaults to settings.LLM_MODEL_WRITE).
        case_id: Optional Case ID to track and enforce the 6-call budget.
        delays: Backoff delay tuple for retries.

    Returns:
        Generated text string.

    Raises:
        RateLimitError: If retries on HTTP 429 are exhausted.
        CallBudgetExceededError: If the case exceeds 6 calls.
    """
    model_name = model or settings.LLM_MODEL_WRITE
    cache_key = compute_cache_key(model=model_name, prompt=prompt, schema_name="text")

    cached_text = get_cached_response(cache_key)
    if cached_text is not None:
        return cached_text

    _check_and_increment_budget(case_id)

    client = _get_genai_client()
    config = types.GenerateContentConfig(temperature=0.0)

    last_error: Optional[Exception] = None
    for attempt, delay in enumerate((0.0,) + delays):
        if delay > 0:
            time.sleep(delay)
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            text = (response.text or "").strip()
            set_cached_response(cache_key, text)
            return text

        except Exception as e:
            last_error = e
            if _is_rate_limit_exception(e):
                logger.warning("Gemini rate limit hit on attempt %d: %s", attempt + 1, e)
                continue
            raise

    raise RateLimitError() from last_error

