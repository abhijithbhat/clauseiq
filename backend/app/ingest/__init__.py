"""Document ingestion and OCR module."""

from backend.app.ingest.ocr import is_tesseract_available, ocr_image, ocr_pixmap
from backend.app.ingest.pdf import parse_document, validate_upload_file

__all__ = [
    "is_tesseract_available",
    "ocr_image",
    "ocr_pixmap",
    "parse_document",
    "validate_upload_file",
]
