import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Intake } from "@/components/clauseiq/Intake";
import { VerdictWorkspace } from "@/components/clauseiq/VerdictWorkspace";
import { adaptAnalysisResult, mapProgressToStages } from "./adapter";
import {
  analyzeCase,
  ApiError,
  parseApiErrorPayload,
  patchCaseFacts,
  uploadDocument,
} from "./api";
import { buildAppealLetter, letterToPlainText } from "./letter";
import { DEMO_CASES } from "./mock-cases";
import type { BackendAnalysisResult, ProgressResponse } from "./types";

const SAMPLE_BACKEND_RESULT: BackendAnalysisResult = {
  case_id: "case_live_01",
  verdict: {
    case_id: "case_live_01",
    label: "LIKELY_WRONGFUL",
    summary:
      "Your claim of ₹1,20,000 was wrongly rejected under the pre-existing disease clause. Continuous cover of 49 months exceeds the 36-month limit.",
    confidence: 0.95,
    needs_human_review: false,
    reasons: ["ev_01_ped_clause", "ev_02_repudiation_reason"],
  },
  facts: {
    insurer_name: "Care Health Insurance Limited",
    policy_number: "14285739/00/00",
    policy_type: "INDIVIDUAL",
    insured_name: "Ramesh Kumar Sharma",
    claim_number: "CLM-2024-984210",
    claim_type: "REIMBURSEMENT",
    claim_amount_inr: 120000.0,
    settled_amount_inr: 0.0,
    disallowed_amount_inr: 120000.0,
    rejection_date: "2024-06-15",
    rejection_category: "PED",
    rejection_reason_text: "Claim repudiated under Clause 4.1 (Pre-Existing Disease Waiting Period).",
    cited_clause_ref: "Clause 4.1",
    policy_first_inception_date: "2020-04-15",
    admission_date: "2024-05-20",
    diagnosis_text: "Symptomatic Cholelithiasis",
    treatment_text: "Laparoscopic Cholecystectomy",
    hospital_name: "Manipal Hospital, Bengaluru",
    continuous_coverage_months: 49,
    sum_insured_inr: 500000.0,
    grievance_sent_date: "2024-06-20",
    grievance_received_date: "2024-06-22",
    grievance_reply_status: "AWAITING_REPLY",
    source_spans: {
      policy_first_inception_date: {
        document: "POLICY",
        page: 2,
        quote: "First Inception: 15/04/2020",
      },
      claim_amount_inr: {
        document: "REJECTION_LETTER",
        page: 1,
        quote: "Claimed Amount: Rs. 1,20,000",
      },
    },
  },
  rules: [
    {
      case_id: "case_live_01",
      rule_id: "R1",
      name: "PED waiting period",
      outcome: "CONTRADICTS_INSURER",
      inputs: { continuous_cover_months: 49, policy_waiting_months: 36 },
      explanation: "49 months continuous cover exceeds the 36-month waiting period.",
      law_ref: "IRDAI Master Circular 2024 Clause 4.1",
      supporting_evidence_ids: ["ev_01_ped_clause"],
    },
    {
      case_id: "case_live_01",
      rule_id: "R2",
      name: "60-Month Moratorium",
      outcome: "UNKNOWN",
      inputs: {},
      explanation: "Fraud status could not be determined from available documents.",
      law_ref: null,
      supporting_evidence_ids: [],
    },
  ],
  evidence: [
    {
      id: "ev_01_ped_clause",
      case_id: "case_live_01",
      source_type: "POLICY",
      source_ref: "Clause 4.1",
      quote: "Expenses related to PED shall be excluded until 36 months of continuous coverage.",
      page: 7,
      verified: true,
    },
    {
      id: "ev_02_repudiation_reason",
      case_id: "case_live_01",
      source_type: "LETTER",
      source_ref: "Repudiation Notice",
      quote: "Claim repudiated under Clause 4.1.",
      page: 1,
      verified: true,
    },
    {
      id: "ev_03_law_pack",
      case_id: "case_live_01",
      source_type: "LAW_PACK",
      source_ref: "IRDAI Master Circular 2024",
      quote: "PED waiting period shall not exceed 36 months.",
      page: 12,
      verified: false,
    },
  ],
  money: {
    claim_amount_inr: 120000.0,
    settled_amount_inr: 0.0,
    disallowed_amount_inr: 120000.0,
  },
  deadlines: [
    {
      case_id: "case_live_01",
      kind: "OMBUDSMAN_LIMIT",
      due_date: "2025-06-15",
      status: "UPCOMING",
    },
  ],
  letter_available: true,
  warnings: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AnalysisResult adapter", () => {
  it("adapts nested backend AnalysisResult to flat UI view model", () => {
    const adapted = adaptAnalysisResult(SAMPLE_BACKEND_RESULT);

    expect(adapted.case_id).toBe("case_live_01");
    expect(adapted.verdict).toBe("LIKELY_WRONGFUL");
    expect(adapted.confidence).toBe(95);
    expect(adapted.needs_human_review).toBe(false);
    expect(adapted.insurer).toBe("Care Health Insurance Limited");
    expect(adapted.claim_number).toBe("CLM-2024-984210");
    expect(adapted.first_inception_date).toBe("2020-04-15");
    expect(adapted.admission_date).toBe("2024-05-20");
    expect(adapted.repudiation_date).toBe("2024-06-15");
    expect(adapted.continuous_cover_months).toBe(49);
    expect(adapted.claim_amount).toBe(120000);
    expect(adapted.settled_amount).toBe(0);
    expect(adapted.disallowed_amount).toBe(120000);
    expect(adapted.sum_insured).toBe(500000);

    expect(adapted.rules).toHaveLength(2);
    expect(adapted.rules[0]).toMatchObject({
      id: "R1",
      outcome: "CONTRADICTS_INSURER",
      citation: "IRDAI Master Circular 2024 Clause 4.1",
      inputs: { continuous_cover_months: 49, policy_waiting_months: 36 },
    });
    expect(adapted.grievance_sent_date).toBe("2024-06-20");
    expect(adapted.grievance_received_date).toBe("2024-06-22");
    expect(adapted.grievance_reply_status).toBe("AWAITING_REPLY");
    expect(adapted.field_sources).toEqual({
      policy_first_inception_date: { page: 2, document_title: "Policy document" },
      claim_amount: { page: 1, document_title: "Rejection letter" },
    });
    expect(adapted.rules[1]).toMatchObject({
      id: "R2",
      outcome: "NEEDS_INFO",
      citation: "—",
    });

    expect(adapted.evidence).toHaveLength(3);
    expect(adapted.evidence[0]).toMatchObject({
      id: "ev_01_ped_clause",
      source: "POLICY",
      match_score: 1,
      verified: true,
    });
    expect(adapted.evidence[1]?.source).toBe("REJECTION_LETTER");
    expect(adapted.evidence[2]).toMatchObject({
      source: "REGULATION",
      match_score: 0,
      verified: false,
    });
    expect(adapted.appeal_grounds.length).toBeGreaterThan(0);
    expect(adapted.backend_deadlines).toHaveLength(1);
  });

  it("handles sparse INSUFFICIENT_INFO payloads and missing dates without fabricating 1900 dates", () => {
    const sparse: BackendAnalysisResult = {
      case_id: "case_sparse",
      verdict: {
        case_id: "case_sparse",
        label: "INSUFFICIENT_INFO",
        summary: "Policy start date could not be verified from the uploaded scan.",
        confidence: 0.42,
        needs_human_review: true,
        reasons: [],
      },
      facts: {
        insurer_name: null,
        policy_number: null,
        claim_number: null,
        rejection_date: null,
        policy_first_inception_date: null,
        admission_date: null,
        continuous_coverage_months: null,
      },
      rules: [],
      evidence: [],
      money: {},
      deadlines: [],
      warnings: ["Low extraction confidence on policy inception date."],
    };

    const adapted = adaptAnalysisResult(sparse);
    expect(adapted.verdict).toBe("INSUFFICIENT_INFO");
    expect(adapted.confidence).toBe(42);
    expect(adapted.needs_human_review).toBe(true);
    expect(adapted.first_inception_date).toBeNull();
    expect(adapted.repudiation_date).toBeNull();
    expect(adapted.continuous_cover_months).toBeNull();
    expect(adapted.warnings).toEqual(["Low extraction confidence on policy inception date."]);

    const letterText = letterToPlainText(buildAppealLetter(adapted, "2026-11-11"));
    expect(letterText).toContain("[[policy number]]");
    expect(letterText).toContain("[[repudiation date]]");
    expect(letterText).not.toContain("1900");
  });

  it("passes offline DEMO_CASES through unchanged", () => {
    expect(adaptAnalysisResult(DEMO_CASES.case_01)).toBe(DEMO_CASES.case_01);
    expect(adaptAnalysisResult(DEMO_CASES.case_02)).toBe(DEMO_CASES.case_02);
    expect(adaptAnalysisResult(DEMO_CASES.case_03)).toBe(DEMO_CASES.case_03);
  });
});

describe("ProgressResponse mapping", () => {
  it("maps string current_step and steps array accurately", () => {
    const p: ProgressResponse = {
      case_id: "case_01",
      status: "ANALYZING",
      current_step: "Checking rules",
      steps: [
        { name: "Reading documents", status: "done" },
        { name: "Finding key facts", status: "done" },
        { name: "Locating clauses", status: "done" },
        { name: "Checking rules", status: "running" },
        { name: "Verifying evidence", status: "pending" },
        { name: "Writing explanation", status: "pending" },
      ],
    };
    expect(mapProgressToStages(p)).toEqual([
      "done",
      "done",
      "done",
      "running",
      "pending",
      "pending",
    ]);
  });

  it("derives running/done stages from string current_step when steps are missing", () => {
    const p: ProgressResponse = {
      status: "ANALYZING",
      current_step: "Locating clauses",
      steps: [],
    };
    expect(mapProgressToStages(p)).toEqual([
      "done",
      "done",
      "running",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("marks all stages done when status is COMPLETED or current_step is Completed", () => {
    const p: ProgressResponse = {
      status: "COMPLETED",
      current_step: "Completed",
      steps: [
        { name: "Reading documents", status: "done" },
        { name: "Finding key facts", status: "done" },
        { name: "Locating clauses", status: "done" },
        { name: "Checking rules", status: "done" },
        { name: "Verifying evidence", status: "done" },
        { name: "Writing explanation", status: "done" },
      ],
    };
    expect(mapProgressToStages(p)).toEqual(["done", "done", "done", "done", "done", "done"]);
  });

  it("handles null current_step and failed steps cleanly", () => {
    const p: ProgressResponse = {
      status: "FAILED",
      current_step: null,
      steps: [
        { name: "Reading documents", status: "done" },
        { name: "Finding key facts", status: "failed" },
      ],
    };
    expect(mapProgressToStages(p)).toEqual([
      "done",
      "failed",
      "pending",
      "pending",
      "pending",
      "pending",
    ]);
  });
});

describe("API client contracts & error parsing", () => {
  it("parses { code, message, hint } errors and detects AI_RATE_LIMIT / 429", () => {
    const err = parseApiErrorPayload(
      {
        code: "INVALID_FILE_TYPE",
        message: "Unsupported file format '.exe'.",
        hint: "Please upload a PDF or image file (JPG, PNG).",
      },
      400,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe("INVALID_FILE_TYPE");
    expect(err.hint).toBe("Please upload a PDF or image file (JPG, PNG).");
    expect(err.message).toContain("Unsupported file format '.exe'.");
    expect(err.message).toContain("Please upload a PDF or image file (JPG, PNG).");
    expect(err.isRateLimit).toBe(false);

    const rateErr = parseApiErrorPayload(
      {
        code: "AI_RATE_LIMIT",
        message: "High demand, retry in a minute",
        hint: "Retry in a few moments.",
      },
      429,
    );
    expect(rateErr.isRateLimit).toBe(true);
    expect(rateErr.code).toBe("AI_RATE_LIMIT");

    const codeOnlyRateErr = parseApiErrorPayload(
      { code: "AI_RATE_LIMIT", message: "High demand", hint: "Wait" },
      503,
    );
    expect(codeOnlyRateErr.isRateLimit).toBe(true);
  });

  it("keeps FastAPI detail fallback for non-standard error payloads", () => {
    const err = parseApiErrorPayload({ detail: "Not authenticated" }, 401);
    expect(err.message).toBe("Not authenticated");
    expect(err.status).toBe(401);
  });

  it("sends DocumentKind DISCHARGE in FormData when uploading discharge summary", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ document_id: "d1", case_id: "c1", kind: "DISCHARGE" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["discharge"], "discharge.pdf", { type: "application/pdf" });
    await uploadDocument("case_01", file, "DISCHARGE");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const fd = init.body as FormData;
    expect(fd.get("kind")).toBe("DISCHARGE");
    expect(fd.get("file")).toBe(file);
  });

  it("adapts backend AnalysisResult returned from POST /cases/{id}/analyze", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_BACKEND_RESULT), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await analyzeCase("case_live_01", { first_inception_date: "2020-04-15" });
    expect(res.confidence).toBe(95);
    expect(res.verdict).toBe("LIKELY_WRONGFUL");
    expect(res.rules[1]?.outcome).toBe("NEEDS_INFO");
  });

  it("calls PATCH /cases/{id}/facts and falls back to POST /analyze on 404", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(SAMPLE_BACKEND_RESULT), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "NOT_FOUND", message: "Not Found", hint: "Missing" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(SAMPLE_BACKEND_RESULT), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const editable = {
      policy_first_inception_date: "2020-04-15",
      admission_date: "2024-05-20",
      continuous_coverage_months: 49,
      grievance_sent_date: "2024-06-20",
      grievance_received_date: "2024-06-22",
      grievance_reply_status: "AWAITING_REPLY" as const,
      claim_amount: 120000,
    };

    const patched = await patchCaseFacts("case_live_01", editable);
    expect(patched.case_id).toBe("case_live_01");
    expect((fetchMock.mock.calls[0] as [string, RequestInit])[1].method).toBe("PATCH");

    const fallbackRes = await patchCaseFacts("case_live_01", editable);
    expect(fallbackRes.case_id).toBe("case_live_01");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[2] as [string, RequestInit])[0]).toContain("/analyze");
  });

  it("Intake uses DISCHARGE key when selecting a discharge summary", () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const onAnalyze = vi.fn();
    render(
      <QueryClientProvider client={qc}>
        <Intake onDemo={vi.fn()} onAnalyze={onAnalyze} />
      </QueryClientProvider>,
    );

    const pdf = new File(["%PDF"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Policy Document"), { target: { files: [pdf] } });
    fireEvent.change(screen.getByLabelText("Rejection Letter"), { target: { files: [pdf] } });
    fireEvent.change(screen.getByLabelText("Hospital Discharge Summary"), {
      target: { files: [pdf] },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Consent to document processing" }));
    fireEvent.click(screen.getByRole("button", { name: /Analyze My Claim/i }));

    expect(onAnalyze).toHaveBeenCalledTimes(1);
    const [filesArg] = onAnalyze.mock.calls[0] as [Record<string, File>, unknown, boolean];
    expect(filesArg["DISCHARGE"]).toBe(pdf);
    expect(filesArg["DISCHARGE_SUMMARY"]).toBeUndefined();
  });
});

describe("VerdictWorkspace UI rendering", () => {
  it("surfaces Needs Human Review badge when needs_human_review is true", () => {
    const adapted = adaptAnalysisResult({
      ...SAMPLE_BACKEND_RESULT,
      verdict: {
        ...SAMPLE_BACKEND_RESULT.verdict,
        label: "CONTESTABLE",
        confidence: 0.62,
        needs_human_review: true,
      },
      warnings: ["Manual verification recommended for confidence below 0.70."],
    });

    render(
      <VerdictWorkspace
        result={adapted}
        isSample={false}
        backendCaseId="case_live_01"
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByTestId("needs-human-review-badge")).toHaveTextContent("Needs Human Review");
    expect(screen.getByText(/62% Confidence/)).toBeInTheDocument();
    expect(screen.getByText(/Manual verification recommended/)).toBeInTheDocument();
  });

  it("renders offline DEMO_CASES without needs-human-review badge", () => {
    render(
      <VerdictWorkspace
        result={DEMO_CASES.case_01}
        isSample={false}
        backendCaseId={null}
        onReset={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("needs-human-review-badge")).not.toBeInTheDocument();
    expect(screen.getByText(/95% Confidence/)).toBeInTheDocument();
    expect(screen.getByText(/Care Health Insurance Limited/)).toBeInTheDocument();
  });

  it("renders rule inputs and supports facts editing, letter placeholder editing, and delete confirmation", () => {
    const adapted = adaptAnalysisResult(SAMPLE_BACKEND_RESULT);
    render(
      <VerdictWorkspace
        result={adapted}
        isSample={true}
        backendCaseId={null}
        onReset={vi.fn()}
      />,
    );

    // Rule inputs are shown inside RulesTab
    expect(screen.getByText(/continuous cover months/i)).toBeInTheDocument();
    expect(screen.getByText(/policy waiting months/i)).toBeInTheDocument();

    // FactsEditorModal opens with source page pills
    fireEvent.click(screen.getByRole("button", { name: /Edit Facts & Re-run/i }));
    expect(screen.getByText("Edit Key Facts")).toBeInTheDocument();
    expect(screen.getByText("Page 2 · Policy document")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // LetterPreviewModal opens, highlights placeholders, increments version on edit, and allows download with placeholders
    fireEvent.click(screen.getAllByRole("button", { name: /Preview & Download Appeal Letter/i })[0]!);
    expect(screen.getByText("Enclosure Checklist")).toBeInTheDocument();
    expect(
      screen.getAllByText(/Drafted with ClauseIQ, an assistive tool/).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Download Word/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Download PDF/i })).toBeEnabled();
    expect(screen.getByText("v1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Fill postal_address"), {
      target: { value: "Bengaluru 560001" },
    });
    expect(screen.getByText("v2")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });

    // Delete My Data confirmation dialog appears instead of immediate purge
    fireEvent.click(screen.getByRole("button", { name: /Delete My Data/i }));
    expect(screen.getByText("Delete My Data?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirm Delete/i })).toBeInTheDocument();
  });
});

