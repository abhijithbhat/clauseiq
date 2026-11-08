"""Unit tests for Document Ingestion, PDF parsing, OCR fallback, and FR13 auto-deletion."""

from pathlib import Path
import tempfile
from unittest.mock import patch
import fitz
import pytest

from backend.app.core.errors import IngestError, OCRError
from backend.app.ingest.ocr import ocr_image
from backend.app.ingest.pdf import parse_document, validate_upload_file
from backend.app.models.schemas import DocumentKind


def create_sample_pdf(file_path: Path, pages_text: list[str]) -> Path:
    """Helper to generate a multi-page PDF using PyMuPDF."""
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page()
        page.insert_text((50, 72), text)
    doc.save(str(file_path))
    doc.close()
    return file_path


def test_multi_page_pdf_text_extraction_and_auto_deletion() -> None:
    """Verify FR1 and FR2: extracts 1-indexed text, and FR13: deletes file automatically."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        temp_path = Path(f.name)

    pages = [
        "Clause 1.0 General Definitions: Policyholder means the person named in the policy schedule.",
        "Clause 4.1 Pre-existing Diseases: Any condition, ailment or injury or related condition(s).",
        "Clause 8.0 Claims Procedure: Intimation of hospitalization within 24 hours of emergency admission.",
    ]
    create_sample_pdf(temp_path, pages)
    assert temp_path.exists()

    result = parse_document(
        file_path=temp_path,
        case_id="case_m1_01",
        kind=DocumentKind.POLICY,
        delete_after_parsing=True,
    )

    # FR2 Assertions
    assert result.case_id == "case_m1_01"
    assert result.kind == DocumentKind.POLICY
    assert result.pages == 3
    assert result.ocr_used is False
    assert 1 in result.text_by_page
    assert 2 in result.text_by_page
    assert 3 in result.text_by_page
    assert "Clause 1.0 General Definitions" in result.text_by_page[1]
    assert "Clause 4.1 Pre-existing Diseases" in result.text_by_page[2]
    assert "Clause 8.0 Claims Procedure" in result.text_by_page[3]

    # FR13 Privacy Assertion: raw file must be deleted
    assert not temp_path.exists()


def test_pdf_preservation_when_delete_is_false() -> None:
    """Verify that file is preserved on disk if delete_after_parsing=False."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        temp_path = Path(f.name)

    try:
        create_sample_pdf(temp_path, ["Sufficient text content to prevent OCR trigger on page 1."])
        result = parse_document(
            file_path=temp_path,
            case_id="case_m1_02",
            kind=DocumentKind.POLICY,
            delete_after_parsing=False,
        )
        assert result.pages == 1
        assert temp_path.exists()
    finally:
        if temp_path.exists():
            temp_path.unlink()


def test_scanned_page_triggers_ocr() -> None:
    """Verify that pages with low character counts trigger the OCR fallback and set ocr_used=True."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        temp_path = Path(f.name)

    # Page 1: normal text; Page 2: empty/scanned placeholder (<40 chars)
    pages = [
        "This is an introductory page with well over forty characters of valid policy description text.",
        "Scan",  # Low text triggers OCR fallback
    ]
    create_sample_pdf(temp_path, pages)

    mock_ocr_text = "Care Health Insurance repudiation grounds under clause 4.1 PED waiting period."

    with patch("backend.app.ingest.ocr.pytesseract.image_to_string", return_value=mock_ocr_text):
        result = parse_document(
            file_path=temp_path,
            case_id="case_m1_03",
            kind=DocumentKind.REJECTION_LETTER,
            delete_after_parsing=True,
        )

    assert result.pages == 2
    assert result.ocr_used is True
    assert "introductory page" in result.text_by_page[1]
    assert mock_ocr_text in result.text_by_page[2]
    assert not temp_path.exists()


def test_image_upload_ocr_parsing() -> None:
    """Verify that JPG/PNG image uploads are parsed via OCR as a 1-page document."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        temp_img = Path(f.name)

    # Create dummy image bytes using PyMuPDF pixmap
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Mock image")
    pix = page.get_pixmap()
    pix.save(str(temp_img))
    doc.close()

    mock_text = "Rejection Notice: Claim No CLM-998822 repudiated due to waiting period."

    with patch("backend.app.ingest.ocr.pytesseract.image_to_string", return_value=mock_text):
        result = parse_document(
            file_path=temp_img,
            case_id="case_m1_04",
            kind=DocumentKind.REJECTION_LETTER,
            delete_after_parsing=True,
        )

    assert result.pages == 1
    assert result.ocr_used is True
    assert result.text_by_page[1] == mock_text
    assert not temp_img.exists()


def test_reject_invalid_file_extension() -> None:
    """Verify FR1: reject non-PDF/JPG/PNG files."""
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        temp_path = Path(f.name)
        f.write(b"plain text document")

    try:
        with pytest.raises(IngestError) as exc_info:
            validate_upload_file(temp_path)

        assert exc_info.value.code == "INVALID_FILE_TYPE"
        assert "Unsupported file extension" in exc_info.value.message
    finally:
        if temp_path.exists():
            temp_path.unlink()


def test_reject_oversized_file() -> None:
    """Verify FR1: reject files exceeding the MAX_UPLOAD_MB limit."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        temp_path = Path(f.name)
        # Write 2 MB dummy data
        f.write(b"0" * (2 * 1024 * 1024))

    try:
        with pytest.raises(IngestError) as exc_info:
            validate_upload_file(temp_path, max_mb=1)

        assert exc_info.value.code == "FILE_TOO_LARGE"
        assert "exceeds maximum allowed limit" in exc_info.value.message
    finally:
        if temp_path.exists():
            temp_path.unlink()


def test_missing_tesseract_binary_raises_graceful_error() -> None:
    """Verify that missing Tesseract executable raises OCRError with code, message, and hint."""
    import pytesseract

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        temp_img = Path(f.name)
        f.write(b"fake image bytes")

    try:
        with patch(
            "backend.app.ingest.ocr.pytesseract.image_to_string",
            side_effect=pytesseract.TesseractNotFoundError(),
        ):
            with pytest.raises(OCRError) as exc_info:
                ocr_image(temp_img)

            assert exc_info.value.code == "OCR_TESSERACT_NOT_FOUND"
            assert "Tesseract OCR executable was not found" in exc_info.value.message
            assert "brew install tesseract" in exc_info.value.hint
    finally:
        if temp_img.exists():
            temp_img.unlink()


def test_nonexistent_file_raises_error() -> None:
    """Verify that a nonexistent file path raises FILE_NOT_FOUND."""
    fake_path = Path("/tmp/nonexistent_document_12345.pdf")
    with pytest.raises(IngestError) as exc_info:
        validate_upload_file(fake_path)

    assert exc_info.value.code == "FILE_NOT_FOUND"

