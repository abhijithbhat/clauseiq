"""SQLite database models and persistence manager for ClauseIQ.

Implements Section 9 and FR13:
- SQLAlchemy ORM models for CaseRecord and DocumentRecord.
- Step-by-step pipeline progress tracking conforming to Section 5.
- Complete case deletion (FR13 Privacy Guardrail).
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, Generator, List, Optional
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session

from backend.app.core.config import settings
from backend.app.models.schemas import (
    AnalysisResult,
    DocumentKind,
    DocumentPages,
    Evidence,
    ExtractedFacts,
    PolicyChunk,
)

Base = declarative_base()

# Default pipeline steps matching Section 5
DEFAULT_PIPELINE_STEPS = [
    {"name": "Reading documents", "status": "pending"},
    {"name": "Finding key facts", "status": "pending"},
    {"name": "Locating clauses", "status": "pending"},
    {"name": "Checking rules", "status": "pending"},
    {"name": "Verifying evidence", "status": "pending"},
    {"name": "Writing explanation", "status": "pending"},
]


class CaseRecord(Base):
    """Persistent database record representing a claim appeal case."""
    __tablename__ = "cases"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String, default="CREATED", nullable=False)  # CREATED, DOCUMENTS_UPLOADED, ANALYZING, COMPLETED, FAILED
    current_step = Column(String, nullable=True)
    step_statuses_json = Column(Text, default=lambda: json.dumps(DEFAULT_PIPELINE_STEPS), nullable=False)
    consent_given = Column(Boolean, default=False, nullable=False)
    facts_json = Column(Text, nullable=True)
    chunks_json = Column(Text, nullable=True)
    evidence_json = Column(Text, nullable=True)
    analysis_result_json = Column(Text, nullable=True)

    documents = relationship("DocumentRecord", back_populates="case", cascade="all, delete-orphan")


class DocumentRecord(Base):
    """Persistent database record for uploaded parsed documents."""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    pages = Column(Integer, nullable=False)
    text_by_page_json = Column(Text, nullable=False)
    ocr_used = Column(Boolean, default=False, nullable=False)

    case = relationship("CaseRecord", back_populates="documents")


# Engine and session factory setup
def _get_connect_args(url: str) -> Dict[str, Any]:
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(settings.DATABASE_URL, connect_args=_get_connect_args(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db(target_engine=None) -> None:
    """Initialize database tables."""
    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================================================================
# CRUD Helper Functions
# ==============================================================================

def create_case(case_id: str, consent_given: bool) -> CaseRecord:
    """Create and persist a new case record."""
    with SessionLocal() as db:
        case = CaseRecord(
            id=case_id,
            consent_given=consent_given,
            status="CREATED",
            current_step="Reading documents",
            step_statuses_json=json.dumps(DEFAULT_PIPELINE_STEPS),
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        return case


def get_case(case_id: str) -> Optional[CaseRecord]:
    """Retrieve a case record by ID."""
    with SessionLocal() as db:
        return db.query(CaseRecord).filter(CaseRecord.id == case_id).first()


def update_case_status(
    case_id: str,
    status: Optional[str] = None,
    current_step: Optional[str] = None,
    step_name_to_update: Optional[str] = None,
    step_status_value: Optional[str] = None,
) -> Optional[CaseRecord]:
    """Update case status and progress steps."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            return None

        if status:
            case.status = status
        if current_step:
            case.current_step = current_step

        if step_name_to_update and step_status_value:
            steps: List[Dict[str, str]] = json.loads(case.step_statuses_json) if case.step_statuses_json else []
            for step in steps:
                if step.get("name") == step_name_to_update:
                    step["status"] = step_status_value
            case.step_statuses_json = json.dumps(steps)

        db.commit()
        db.refresh(case)
        return case


def save_document(case_id: str, doc: DocumentPages) -> DocumentRecord:
    """Save parsed document pages to database."""
    with SessionLocal() as db:
        # Check if case exists
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            raise ValueError(f"Case {case_id} not found")

        doc_record = DocumentRecord(
            id=str(uuid.uuid4()),
            case_id=case_id,
            kind=doc.kind.value,
            filename=doc.filename,
            pages=doc.pages,
            text_by_page_json=json.dumps({str(k): v for k, v in doc.text_by_page.items()}),
            ocr_used=doc.ocr_used,
        )
        db.add(doc_record)
        # Update case status
        case.status = "DOCUMENTS_UPLOADED"
        db.commit()
        db.refresh(doc_record)
        return doc_record


def get_documents_for_case(case_id: str) -> List[DocumentRecord]:
    """Retrieve all document records belonging to a case."""
    with SessionLocal() as db:
        return db.query(DocumentRecord).filter(DocumentRecord.case_id == case_id).all()


def save_case_chunks(case_id: str, chunks: List[PolicyChunk]) -> None:
    """Save extracted policy chunks to the case record."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            return
        existing_chunks = []
        if case.chunks_json:
            try:
                existing_chunks = json.loads(case.chunks_json)
            except Exception:
                existing_chunks = []
        new_chunks_data = [chunk.model_dump() for chunk in chunks]
        case.chunks_json = json.dumps(existing_chunks + new_chunks_data)
        db.commit()


def get_case_chunks(case_id: str) -> List[PolicyChunk]:
    """Retrieve policy chunks associated with a case."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case or not case.chunks_json:
            return []
        data = json.loads(case.chunks_json)
        return [PolicyChunk.model_validate(item) for item in data]


def save_case_facts(case_id: str, facts: ExtractedFacts) -> None:
    """Store extracted facts in the case record."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            return
        case.facts_json = facts.model_dump_json()
        db.commit()


def get_case_facts(case_id: str) -> Optional[ExtractedFacts]:
    """Retrieve extracted facts for a case."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case or not case.facts_json:
            return None
        return ExtractedFacts.model_validate_json(case.facts_json)


def save_case_analysis(case_id: str, analysis: AnalysisResult) -> None:
    """Store complete AnalysisResult in the case record."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            return
        case.analysis_result_json = analysis.model_dump_json()
        case.status = "COMPLETED"
        case.current_step = "Completed"
        db.commit()


def get_case_analysis(case_id: str) -> Optional[AnalysisResult]:
    """Retrieve complete AnalysisResult for a case."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case or not case.analysis_result_json:
            return None
        return AnalysisResult.model_validate_json(case.analysis_result_json)


def delete_case_completely(case_id: str) -> bool:
    """FR13 Privacy Guardrail: Completely delete case and all associated records from SQLite."""
    with SessionLocal() as db:
        case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
        if not case:
            return False
        db.delete(case)
        db.commit()
        return True

