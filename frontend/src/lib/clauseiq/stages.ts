export const PIPELINE_STAGES = [
  { title: "Reading documents", detail: "Extracting text and running OCR on scanned pages" },
  {
    title: "Finding key facts",
    detail: "Inception dates, claim amount, diagnosis, and rejection reason",
  },
  {
    title: "Locating clauses",
    detail: "Hybrid BM25 and neural vector search across policy sections",
  },
  { title: "Checking rules", detail: "Running deterministic R1–R10 statutory checks" },
  {
    title: "Verifying evidence",
    detail: "Character-for-character quote verifier against document text",
  },
  {
    title: "Writing explanation",
    detail: "Class 8 plain-English verdict summary and appeal grounds",
  },
] as const;
