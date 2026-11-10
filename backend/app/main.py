"""ClauseIQ FastAPI Application Entrypoint.

Implements Section 11:
- CORS middleware
- Health check endpoint (GET /health)
- Case lifecycle and pipeline routes (/cases)
- Standardized {code, message, hint} exception handling across all endpoints
"""

from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.api.cases import router as cases_router
from backend.app.core.config import settings
from backend.app.core.errors import ClauseIQException
from backend.app.models.db import init_db

# Initialize database tables on startup
init_db()

app = FastAPI(
    title="ClauseIQ API",
    version="0.1.0",
    description="Assistive drafting and claim analysis API for Indian health insurance claims.",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(cases_router)


# ==============================================================================
# Standardized Error Handlers (Section 11)
# ==============================================================================

@app.exception_handler(ClauseIQException)
async def handle_clauseiq_exception(request: Request, exc: ClauseIQException) -> JSONResponse:
    """Format custom ClauseIQ exceptions into standardized {code, message, hint} payload."""
    status_code = status.HTTP_400_BAD_REQUEST
    if exc.code == "CASE_NOT_FOUND":
        status_code = status.HTTP_404_NOT_FOUND
    elif exc.code == "AI_RATE_LIMIT":
        status_code = status.HTTP_429_TOO_MANY_REQUESTS

    return JSONResponse(
        status_code=status_code,
        content={"code": exc.code, "message": exc.message, "hint": exc.hint},
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Standardize HTTP errors (404, 405, etc.) to {code, message, hint} format."""
    code_map = {
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        403: "FORBIDDEN",
        401: "UNAUTHORIZED",
    }
    code = code_map.get(exc.status_code, f"HTTP_{exc.status_code}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": code,
            "message": str(exc.detail),
            "hint": "Check the requested URL, HTTP method, and parameters.",
        },
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Standardize request schema validation errors to {code, message, hint} format."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Invalid request parameters or payload.",
            "hint": str(exc.errors()[0].get("msg") if exc.errors() else "Check input format."),
        },
    )


# ==============================================================================
# Base Endpoints
# ==============================================================================

@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Health check endpoint used by frontend and deployment pingers."""
    return {"status": "ok", "service": "clauseiq"}
