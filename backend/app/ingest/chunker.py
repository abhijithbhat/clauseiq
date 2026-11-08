"""Clause-Aware Policy Document Chunker for ClauseIQ (M2).

Implements FR3 and Section 13:
- Detects Indian health insurance policy clause and section headings.
- Groups text by clause, tracking exact page ranges across page boundaries.
- Splits large clauses into chunks targeting ~400 tokens (~1,600 chars) with ~50 tokens (~200 chars) overlap.
- Returns strictly typed PolicyChunk instances conforming to the shared schema.
"""

import re
from typing import List, NamedTuple, Optional, Tuple

from backend.app.models.schemas import DocumentPages, PolicyChunk

# Target character lengths corresponding to ~400 tokens with ~50 token overlap
TARGET_CHUNK_CHARS: int = 1600
MAX_CHUNK_CHARS: int = 1800
OVERLAP_CHARS: int = 200

# Heading detection regex patterns tailored for Indian health insurance policy structures
HEADING_PATTERNS = [
    # 1. "Clause 4.1", "Clause 4.1.2: Waiting Period", "Section 1 - Definitions", "Exclusion 12"
    re.compile(
        r"^(Clause|Section|Exclusion|Article|Part)\s+([A-Za-z0-9]+(?:\.[0-9]+)*)(?:\s*[:\-–—]\s*(.*))?$",
        re.IGNORECASE,
    ),
    # 2. Numbered sections like "4.1 Pre-existing Diseases", "1.2 Scope of Cover"
    re.compile(
        r"^(\d+\.\d+(?:\.\d+)?)\s*[:\-–—]?\s+([A-Z][A-Za-z0-9\s,\-–—/()]+)$"
    ),
    # 3. Explicit named insurance policy headings (Title Case or UPPERCASE)
    re.compile(
        r"^(Waiting Periods?|General Exclusions?|Specific Exclusions?|Pre-existing Diseases?|"
        r"Room Rent Sub-limits?|Claims? Procedure|Portability|Moratorium Period|"
        r"Terms and Conditions|Standard Terms|General Terms and Conditions)"
        r"(?:\s*[:\-–—]\s*(.*))?$",
        re.IGNORECASE,
    ),
]


class LineWithPage(NamedTuple):
    text: str
    page: int


class RawClause(NamedTuple):
    clause_ref: str
    heading: str
    lines: List[LineWithPage]


def extract_heading_info(line: str) -> Optional[Tuple[str, str]]:
    """Determine if a text line represents a policy clause/section heading.

    Args:
        line: The text line to inspect.

    Returns:
        (clause_ref, heading) tuple if matched, or None.
    """
    stripped = line.strip()
    # Reject lines that are too long, empty, or look like regular sentences ending with period/semicolon
    if not stripped or len(stripped) > 120:
        return None

    # Skip lines that look like bullet points ending with sentences
    if stripped.endswith(";") or (stripped.endswith(".") and len(stripped.split()) > 10):
        return None

    for pattern in HEADING_PATTERNS:
        match = pattern.match(stripped)
        if match:
            groups = match.groups()
            # Pattern 1: (Keyword, Number, Optional Title)
            if groups[0].lower() in {"clause", "section", "exclusion", "article", "part"}:
                keyword = groups[0].capitalize()
                num = groups[1]
                clause_ref = f"{keyword} {num}"
                heading = stripped
                return clause_ref, heading

            # Pattern 2: ("4.1", "Pre-existing Diseases")
            if pattern == HEADING_PATTERNS[1]:
                num = groups[0]
                clause_ref = f"Clause {num}"
                heading = stripped
                return clause_ref, heading

            # Pattern 3: Named insurance headings
            if len(groups) >= 1:
                title = groups[0].title()
                clause_ref = title
                heading = stripped
                return clause_ref, heading

    return None


def _split_long_lines(lines: List[LineWithPage], max_chars: int) -> List[LineWithPage]:
    """Break individual oversized lines into sentence/phrase units while preserving page numbers."""
    refined: List[LineWithPage] = []
    for line in lines:
        if len(line.text) <= max_chars:
            refined.append(line)
        else:
            # Split giant line by sentence boundaries
            sentences = re.split(r"(?<=[.!?])\s+", line.text)
            current_buffer = ""
            for sentence in sentences:
                if not current_buffer:
                    current_buffer = sentence
                elif len(current_buffer) + len(sentence) + 1 <= max_chars:
                    current_buffer += " " + sentence
                else:
                    refined.append(LineWithPage(text=current_buffer, page=line.page))
                    current_buffer = sentence
            if current_buffer:
                refined.append(LineWithPage(text=current_buffer, page=line.page))
    return refined


def _chunk_single_clause(
    clause: RawClause,
    case_id: str,
    start_chunk_idx: int,
    target_chars: int = TARGET_CHUNK_CHARS,
    max_chars: int = MAX_CHUNK_CHARS,
    overlap_chars: int = OVERLAP_CHARS,
) -> List[PolicyChunk]:
    """Emit PolicyChunk(s) for a single clause, applying sliding window overlap if needed."""
    if not clause.lines:
        return []

    lines = _split_long_lines(clause.lines, max_chars)
    total_chars = sum(len(l.text) + 1 for l in lines)

    # Fast path: Entire clause fits into one chunk
    if total_chars <= max_chars:
        chunk_text = "\n".join(l.text for l in lines).strip()
        page_start = min(l.page for l in lines)
        page_end = max(l.page for l in lines)
        return [
            PolicyChunk(
                id=f"{case_id}_chunk_{start_chunk_idx:03d}",
                case_id=case_id,
                clause_ref=clause.clause_ref,
                heading=clause.heading,
                text=chunk_text,
                page_start=page_start,
                page_end=page_end,
            )
        ]

    # Sliding window chunking for long clauses
    chunks: List[PolicyChunk] = []
    current_idx = 0
    chunk_counter = start_chunk_idx

    while current_idx < len(lines):
        window_lines: List[LineWithPage] = []
        window_chars = 0
        end_idx = current_idx

        while end_idx < len(lines):
            line = lines[end_idx]
            line_len = len(line.text) + 1
            if window_lines and (window_chars + line_len > max_chars):
                break
            window_lines.append(line)
            window_chars += line_len
            end_idx += 1
            if window_chars >= target_chars:
                break

        if not window_lines:
            # Fallback for an indivisible line item
            window_lines = [lines[current_idx]]
            end_idx = current_idx + 1

        chunk_text = "\n".join(l.text for l in window_lines).strip()
        page_start = min(l.page for l in window_lines)
        page_end = max(l.page for l in window_lines)

        chunks.append(
            PolicyChunk(
                id=f"{case_id}_chunk_{chunk_counter:03d}",
                case_id=case_id,
                clause_ref=clause.clause_ref,
                heading=clause.heading,
                text=chunk_text,
                page_start=page_start,
                page_end=page_end,
            )
        )
        chunk_counter += 1

        if end_idx >= len(lines):
            break

        # Calculate overlap window
        next_start = end_idx
        accumulated_overlap = 0
        while next_start > current_idx and accumulated_overlap < overlap_chars:
            next_start -= 1
            accumulated_overlap += len(lines[next_start].text) + 1

        # Prevent infinite loops
        if next_start <= current_idx:
            next_start = current_idx + 1
        current_idx = next_start

    return chunks


def chunk_policy_document(doc: DocumentPages) -> List[PolicyChunk]:
    """Parse policy document text into clause-aware chunks with page boundaries.

    Args:
        doc: Validated DocumentPages object containing 1-indexed page text.

    Returns:
        List of PolicyChunk instances with exact clause_ref, heading, and page ranges.
    """
    raw_clauses: List[RawClause] = []
    current_ref: Optional[str] = None
    current_heading: Optional[str] = None
    current_lines: List[LineWithPage] = []

    # Iterate through pages in 1-indexed ascending order
    for page_num in sorted(doc.text_by_page.keys()):
        page_content = doc.text_by_page[page_num] or ""
        lines = page_content.splitlines()

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            heading_info = extract_heading_info(stripped)
            if heading_info is not None:
                # Flush existing clause buffer if populated
                if current_lines:
                    clause_ref = current_ref or "Preamble"
                    heading = current_heading or "Policy Schedule & Preamble"
                    raw_clauses.append(
                        RawClause(
                            clause_ref=clause_ref,
                            heading=heading,
                            lines=list(current_lines),
                        )
                    )
                    current_lines.clear()

                # Start new clause
                current_ref, current_heading = heading_info
                current_lines.append(LineWithPage(text=stripped, page=page_num))
            else:
                # Regular body text line belonging to the active clause
                current_lines.append(LineWithPage(text=stripped, page=page_num))

    # Flush final accumulated clause
    if current_lines:
        clause_ref = current_ref or "Preamble"
        heading = current_heading or "Policy Schedule & Preamble"
        raw_clauses.append(
            RawClause(
                clause_ref=clause_ref,
                heading=heading,
                lines=list(current_lines),
            )
        )

    # Process all raw clauses into bounded PolicyChunks
    policy_chunks: List[PolicyChunk] = []
    chunk_index = 1

    for clause in raw_clauses:
        produced = _chunk_single_clause(
            clause=clause,
            case_id=doc.case_id,
            start_chunk_idx=chunk_index,
            target_chars=TARGET_CHUNK_CHARS,
            max_chars=MAX_CHUNK_CHARS,
            overlap_chars=OVERLAP_CHARS,
        )
        policy_chunks.extend(produced)
        chunk_index += len(produced)

    return policy_chunks

