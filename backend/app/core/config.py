"""Core configuration module for ClauseIQ.

Loads environment variables using Pydantic Settings v2.
"""

from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """ClauseIQ runtime settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    LLM_PROVIDER: str = Field(default="gemini", description="LLM backend provider")
    GEMINI_API_KEY: str = Field(default="", description="API key for Gemini provider")
    LLM_MODEL_EXTRACT: str = Field(
        default="gemini-2.5-flash",
        description="Model identifier for fact extraction",
    )
    LLM_MODEL_WRITE: str = Field(
        default="gemini-2.5-flash",
        description="Model identifier for explanation and letters",
    )
    DATABASE_URL: str = Field(
        default="sqlite:///./clauseiq.db",
        description="Database connection URL",
    )
    MAX_UPLOAD_MB: int = Field(
        default=10,
        description="Maximum upload size limit per file in megabytes (FR1)",
    )
    DELETE_UPLOADS: bool = Field(
        default=True,
        description="FR13 Privacy guardrail: delete raw files immediately after parsing",
    )
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080,http://127.0.0.1:5173",
        description="Allowed CORS origins",
    )
    DEMO_MODE: bool = Field(
        default=False,
        description="Serve cached analysis for demo cases without invoking LLM",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        """Return CORS origins as a sanitized list of strings."""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

