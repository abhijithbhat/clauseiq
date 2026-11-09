"""PDF and image document parser with OCR fallback and FR13 privacy auto-deletion."""

import logging
from pathlib import Path
from typing import Dict, Optional, Set, Union
import fitz  # PyMuPDF

from backend.app.core.config import settings
from backend.app.core.errors import IngestError, OCRError
from backend.app.ingest.ocr import ocr_image, ocr_pixmap
from backend.app.models.schemas import DocumentKind, DocumentPages

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS: Set[str] = {".pdf", ".jpg", ".jpeg", ".png"}
SCANNED_PAGE_CHAR_THRESHOLD: int = 40  # Under 40 characters triggers OCR fallback


def validate_upload_file(
    file_path: Union[str, Path],
    max_mb: Optional[int] = None,
) -> Path:
    """Validate document file extension and size constraints.

    Args:
        file_path: Path to the target upload file.
        max_mb: Optional override for max file size limit (defaults to settings.MAX_UPLOAD_MB).

    Returns:
        Resolved Path object.

    Raises:
        IngestError: If file does not exist, extension is unsupported, or size exceeds limit.
    """
    path = Path(file_path)
    if not path.exists():
        raise IngestError(
            code="FILE_NOT_FOUND",
            message=f"File not found: {path.name}",
            hint="Please select a valid document to upload.",
        )

    suffix = path.suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        allowed_list = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise IngestError(
            code="INVALID_FILE_TYPE",
            message=f"Unsupported file extension '{suffix}'. Allowed: {allowed_list}",
            hint="Please upload a PDF, JPG, or PNG document.",
        )

    size_limit_mb = max_mb if max_mb is not None else settings.MAX_UPLOAD_MB
    size_bytes = path.stat().st_size
    max_bytes = size_limit_mb * 1024 * 1024
    if size_bytes > max_bytes:
        file_mb = round(size_bytes / (1024 * 1024), 2)
        raise IngestError(
            code="FILE_TOO_LARGE",
            message=f"File size ({file_mb} MB) exceeds maximum allowed limit ({size_limit_mb} MB).",
            hint=f"Please compress the file to under {size_limit_mb} MB and retry.",
        )

    return path


def parse_document(
    file_path: Union[str, Path],
    case_id: str,
    kind: DocumentKind,
    delete_after_parsing: Optional[bool] = None,
) -> DocumentPages:
    """Parse document page-by-page, trigger OCR on scanned pages, and auto-delete file.

    Args:
        file_path: File path of uploaded PDF, JPG, or PNG.
        case_id: Identifier of the case.
        kind: DocumentKind (POLICY, REJECTION_LETTER, DISCHARGE, OTHER).
        delete_after_parsing: Whether to delete the file immediately after parsing (FR13).
                              Defaults to settings.DELETE_UPLOADS.

    Returns:
        Validated DocumentPages instance containing 1-indexed page text map and OCR flag.

    Raises:
        IngestError: If file is invalid or parsing fails.
    """
    path = validate_upload_file(file_path)
    should_delete = (
        delete_after_parsing
        if delete_after_parsing is not None
        else settings.DELETE_UPLOADS
    )

    filename = path.name
    suffix = path.suffix.lower()
    text_by_page: Dict[int, str] = {}
    ocr_used = False

    try:
        # Handling standalone image uploads (.jpg, .jpeg, .png)
        if suffix in {".jpg", ".jpeg", ".png"}:
            try:
                extracted_text = ocr_image(path)
                text_by_page[1] = extracted_text
                ocr_used = True
            except OCRError as e:
                raise IngestError(
                    code=e.code,
                    message=f"Failed to process image '{filename}': {e.message}",
                    hint=e.hint,
                ) from e
            except Exception as e:
                raise IngestError(
                    code="IMAGE_PARSE_FAILED",
                    message=f"Failed to parse image file '{filename}': {str(e)}",
                    hint="Ensure the image is valid and readable.",
                ) from e

            return DocumentPages(
                case_id=case_id,
                kind=kind,
                filename=filename,
                pages=1,
                text_by_page=text_by_page,
                ocr_used=ocr_used,
            )

        # Handling PDF documents (.pdf)
        doc: Optional[fitz.Document] = None
        try:
            doc = fitz.open(str(path))
        except Exception as e:
            # Fallback attempt with pdfplumber if fitz fails
            try:
                import pdfplumber  # type: ignore

                with pdfplumber.open(str(path)) as pdf:
                    for i, page in enumerate(pdf.pages):
                        page_num = i + 1
                        t = page.extract_text() or ""
                        text_by_page[page_num] = t
                if not text_by_page:
                    raise IngestError(
                        code="PDF_PARSE_FAILED",
                        message=f"Unable to read text from PDF '{filename}'.",
                        hint="Check that the PDF is not password-protected or corrupted.",
                    )
                return DocumentPages(
                    case_id=case_id,
                    kind=kind,
                    filename=filename,
                    pages=len(text_by_page),
                    text_by_page=text_by_page,
                    ocr_used=False,
                )
            except Exception:
                raise IngestError(
                    code="PDF_OPEN_FAILED",
                    message=f"Failed to open PDF '{filename}': {str(e)}",
                    hint="Ensure the PDF file is uncorrupted and not password protected.",
                ) from e

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            raise IngestError(
                code="EMPTY_DOCUMENT",
                message=f"The document '{filename}' contains 0 pages.",
                hint="Please upload a valid document containing pages.",
            )

        for page_idx in range(total_pages):
            page_num = page_idx + 1  # 1-indexed per FR2
            page = doc[page_idx]
            extracted_text = (page.get_text() or "").strip()

            # Scanned page detection: text below threshold triggers OCR
            if len(extracted_text) < SCANNED_PAGE_CHAR_THRESHOLD:
                try:
                    pix = page.get_pixmap(dpi=150)
                    ocr_result = ocr_pixmap(pix)
                    # If OCR yielded text, prefer it
                    if len(ocr_result) > len(extracted_text):
                        text_by_page[page_num] = ocr_result
                    else:
                        text_by_page[page_num] = extracted_text
                    ocr_used = True
                except OCRError:
                    # If OCR is unavailable (e.g. missing tesseract), retain raw text
                    text_by_page[page_num] = extracted_text
            else:
                text_by_page[page_num] = extracted_text

        doc.close()

        return DocumentPages(
            case_id=case_id,
            kind=kind,
            filename=filename,
            pages=total_pages,
            text_by_page=text_by_page,
            ocr_used=ocr_used,
        )

    finally:
        # FR13 Privacy Guardrail: auto-delete raw upload file from disk
        if should_delete and path.exists():
            try:
                path.unlink()
            except OSError as e:
                logger.warning("Failed to auto-delete temporary upload file %s: %s", path, e)

