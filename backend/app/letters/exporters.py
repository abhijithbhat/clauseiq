"""DOCX and PDF Exporters for ClauseIQ Appeal Letters (M7).

Implements Section 14 and FR10:
- export_letter_docx: Generates formatted Microsoft Word document (.docx) via python-docx.
- export_letter_pdf: Generates clean, publication-ready PDF (.pdf) via reportlab.
- Adheres to standard Indian legal/grievance representation typography.
"""

from pathlib import Path
from typing import Any, Dict
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable


def export_letter_docx(letter_data: Dict[str, Any], output_path: Path) -> Path:
    """Generate Word (.docx) document from letter text data."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = docx.Document()

    # Page Margins (1 inch all around)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Title / Header
    title_p = doc.add_paragraph()
    title_run = title_p.add_run("FORMAL GRIEVANCE REPRESENTATION / APPEAL")
    title_run.bold = True
    title_run.font.size = Pt(14)
    title_run.font.name = "Georgia"
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run(letter_data.get("subject", "Claim Repudiation Appeal"))
    sub_run.bold = True
    sub_run.font.size = Pt(11)
    sub_run.font.color.rgb = RGBColor(70, 70, 70)
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph()  # Blank spacer

    # Body Paragraphs
    raw_text = letter_data.get("text", "")
    for line in raw_text.splitlines():
        trimmed = line.strip()
        if not trimmed:
            doc.add_paragraph()
            continue

        p = doc.add_paragraph()
        run = p.add_run(trimmed)
        run.font.name = "Georgia"
        run.font.size = Pt(10.5)

        if trimmed.startswith("SUBJECT:"):
            run.bold = True
        elif trimmed.startswith(("1. SENDER", "2. FACTUAL", "3. NUMBERED", "4. REQUEST", "5. ENCLOSURE")):
            run.bold = True
            run.font.size = Pt(11)

    # Mandatory Legal Footer
    footer = doc.sections[0].footer
    footer_p = footer.paragraphs[0]
    footer_run = footer_p.add_run(
        letter_data.get(
            "footer",
            "Drafted with ClauseIQ, an assistive tool. This is not legal advice. Please review before sending.",
        )
    )
    footer_run.font.size = Pt(8.5)
    footer_run.font.italic = True
    footer_run.font.color.rgb = RGBColor(128, 128, 128)
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.save(str(output_path))
    return output_path


def export_letter_pdf(letter_data: Dict[str, Any], output_path: Path) -> Path:
    """Generate PDF document from letter text data using reportlab."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    pdf = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=0.8 * inch,
        rightMargin=0.8 * inch,
        topMargin=0.8 * inch,
        bottomMargin=0.8 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "LetterTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        alignment=1,  # Center
        spaceAfter=4,
    )

    subject_style = ParagraphStyle(
        "LetterSubject",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=1,
        spaceAfter=12,
    )

    body_style = ParagraphStyle(
        "LetterBody",
        parent=styles["Normal"],
        fontName="Times-Roman",
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        spaceBefore=8,
        spaceAfter=4,
    )

    footer_style = ParagraphStyle(
        "LetterFooter",
        parent=styles["Normal"],
        fontName="Times-Italic",
        fontSize=8,
        leading=10,
        alignment=1,
        textColor="#777777",
    )

    story = []

    # Title & Subject
    story.append(Paragraph("FORMAL GRIEVANCE REPRESENTATION / APPEAL", title_style))
    story.append(Paragraph(letter_data.get("subject", ""), subject_style))
    story.append(HRFlowable(width="100%", thickness=1, color="#cccccc", spaceAfter=10))

    # Parse lines into paragraphs
    raw_text = letter_data.get("text", "")
    for line in raw_text.splitlines():
        trimmed = line.strip()
        if not trimmed:
            story.append(Spacer(1, 6))
            continue

        safe_text = trimmed.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        if safe_text.startswith(("1. SENDER", "2. FACTUAL", "3. NUMBERED", "4. REQUEST", "5. ENCLOSURE")):
            story.append(Paragraph(safe_text, heading_style))
        elif safe_text.startswith("SUBJECT:"):
            story.append(Paragraph(safe_text, ParagraphStyle("Subj", parent=body_style, fontName="Times-Bold")))
        elif safe_text.startswith("--------------------------------------------------------------------------------"):
            story.append(HRFlowable(width="100%", thickness=0.5, color="#dddddd", spaceBefore=10, spaceAfter=8))
        elif "Drafted with ClauseIQ" in safe_text:
            story.append(Paragraph(safe_text, footer_style))
        else:
            story.append(Paragraph(safe_text, body_style))

    pdf.build(story)
    return output_path
