"""Standardized exception hierarchy for ClauseIQ."""

from typing import Dict
from backend.app.models.schemas import ApiError


class ClauseIQException(Exception):
    """Base exception for ClauseIQ carrying structured API error fields."""

    def __init__(self, code: str, message: str, hint: str):
        self.code = code
        self.message = message
        self.hint = hint
        super().__init__(f"[{code}] {message} (Hint: {hint})")

    def to_api_error(self) -> ApiError:
        return ApiError(code=self.code, message=self.message, hint=self.hint)

    def to_dict(self) -> Dict[str, str]:
        return {"code": self.code, "message": self.message, "hint": self.hint}


class OCRError(ClauseIQException):
    """Exception raised during OCR processing or Tesseract execution."""
    pass


class IngestError(ClauseIQException):
    """Exception raised during document upload, validation, or parsing."""
    pass


class RateLimitError(ClauseIQException):
    """Exception raised when AI provider rate limits are exhausted after backoff retries."""

    def __init__(
        self,
        code: str = "AI_RATE_LIMIT",
        message: str = "High demand, retry in a minute",
        hint: str = "The AI provider is experiencing high traffic or rate limits. Please retry in a few moments.",
    ):
        super().__init__(code=code, message=message, hint=hint)


class CallBudgetExceededError(ClauseIQException):
    """Exception raised when a single case exceeds its maximum AI call budget (max 6 calls)."""

    def __init__(
        self,
        code: str = "AI_BUDGET_EXCEEDED",
        message: str = "Per-case AI call budget limit of 6 calls exceeded.",
        hint: str = "Each claim analysis case is capped at 6 AI calls to maintain budget and prevent runaway loops.",
    ):
        super().__init__(code=code, message=message, hint=hint)
