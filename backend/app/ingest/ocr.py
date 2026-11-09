"""OCR module for scanned document pages and image files using Tesseract and Pillow."""

import io
from pathlib import Path
import shutil
from typing import Any, Union

from PIL import Image
import pytesseract

from backend.app.core.errors import OCRError


def is_tesseract_available() -> bool:
    """Check if the Tesseract executable is installed and available on system PATH."""
    cmd = getattr(pytesseract, "tesseract_cmd", "tesseract")
    return shutil.which(cmd) is not None


def ocr_image(
    image_input: Union[str, Path, bytes, io.BytesIO, Any],
    lang: str = "eng",
) -> str:
    """Run OCR on a provided image file, bytes, or Pillow Image object.

    Args:
        image_input: Filepath, raw image bytes, BytesIO buffer, or PIL Image.
        lang: Tesseract language code (default: 'eng').

    Returns:
        Extracted plain text from the image.

    Raises:
        OCRError: If Tesseract binary is missing, image cannot be loaded, or OCR fails.
    """
    image_obj: Any = None
    try:
        if isinstance(image_input, (str, Path)):
            path = Path(image_input)
            if not path.exists():
                raise OCRError(
                    code="OCR_FILE_NOT_FOUND",
                    message=f"Image file not found: {path}",
                    hint="Ensure the file path is correct and accessible.",
                )
            with Image.open(path) as image_obj:
                text = pytesseract.image_to_string(image_obj, lang=lang)
                return text.strip()
        elif isinstance(image_input, bytes):
            with Image.open(io.BytesIO(image_input)) as image_obj:
                text = pytesseract.image_to_string(image_obj, lang=lang)
                return text.strip()
        elif isinstance(image_input, io.BytesIO):
            with Image.open(image_input) as image_obj:
                text = pytesseract.image_to_string(image_obj, lang=lang)
                return text.strip()
        elif hasattr(image_input, "save") or hasattr(image_input, "convert"):
            text = pytesseract.image_to_string(image_input, lang=lang)
            return text.strip()
        else:
            raise OCRError(
                code="OCR_INVALID_INPUT",
                message=f"Unsupported image input type: {type(image_input)}",
                hint="Provide a valid file path, bytes, BytesIO buffer, or Pillow Image.",
            )

    except pytesseract.TesseractNotFoundError as e:
        raise OCRError(
            code="OCR_TESSERACT_NOT_FOUND",
            message="Tesseract OCR executable was not found on the system PATH.",
            hint="Please install Tesseract OCR (e.g. 'brew install tesseract' or 'apt-get install tesseract-ocr') or upload a digital text PDF.",
        ) from e

    except pytesseract.TesseractError as e:
        raise OCRError(
            code="OCR_PROCESSING_FAILED",
            message=f"Tesseract OCR processing failed: {str(e)}",
            hint="Verify that the uploaded image is clear, legible, and uncorrupted.",
        ) from e

    except OCRError:
        raise

    except Exception as e:
        # Check if the underlying error is a missing binary reported via OSError / FileNotFoundError
        if isinstance(e, FileNotFoundError) or "tesseract is not installed" in str(e).lower():
            raise OCRError(
                code="OCR_TESSERACT_NOT_FOUND",
                message="Tesseract OCR executable was not found on the system PATH.",
                hint="Please install Tesseract OCR or upload a digital text PDF.",
            ) from e
        raise OCRError(
            code="OCR_IMAGE_LOAD_FAILED",
            message=f"Failed to process image for OCR: {str(e)}",
            hint="Check that the image format is valid and not corrupted.",
        ) from e


def ocr_pixmap(pixmap: Any, lang: str = "eng") -> str:
    """Run OCR on a PyMuPDF fitz.Pixmap rendered from a scanned PDF page.

    Args:
        pixmap: PyMuPDF Pixmap object.
        lang: Tesseract language code.

    Returns:
        Extracted text string from the page pixmap.
    """
    try:
        png_bytes = pixmap.tobytes("png")
        return ocr_image(png_bytes, lang=lang)
    except OCRError:
        raise
    except Exception as e:
        raise OCRError(
            code="OCR_PIXMAP_CONVERSION_FAILED",
            message=f"Failed to convert PDF page pixmap for OCR: {str(e)}",
            hint="Ensure PyMuPDF rendering succeeded.",
        ) from e

