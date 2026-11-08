"""ClauseIQ FastAPI Application Entrypoint."""

from typing import Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ClauseIQ API",
    version="0.1.0",
    description="Assistive drafting and claim analysis API for Indian health insurance claims.",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check endpoint used by frontend and deployment pingers."""
    return {"status": "ok", "service": "ClauseIQ", "version": "0.1.0"}

