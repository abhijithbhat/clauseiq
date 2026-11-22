import { adaptAnalysisResult } from "./adapter";
import type {
  AnalysisResult,
  AppealLetterResponse,
  BackendAnalysisResult,
  DocumentKind,
  EditableFacts,
  ProgressResponse,
} from "./types";

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string | undefined,
    public hint?: string | undefined,
  ) {
    super(message);
    this.name = "ApiError";
  }
  get isRateLimit() {
    return this.status === 429 || this.code === "AI_RATE_LIMIT";
  }
}

export function parseApiErrorPayload(
  body: unknown,
  status: number,
  fallbackText = "Request failed",
): ApiError {
  let code: string | undefined;
  let hint: string | undefined;
  let baseMessage = fallbackText.trim() || "Request failed";

  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;
    if (typeof record["code"] === "string" && record["code"].trim()) {
      code = record["code"].trim();
    }
    if (typeof record["hint"] === "string" && record["hint"].trim()) {
      hint = record["hint"].trim();
    }
    if (typeof record["message"] === "string" && record["message"].trim()) {
      baseMessage = record["message"].trim();
    } else if (typeof record["detail"] === "string" && record["detail"].trim()) {
      baseMessage = record["detail"].trim();
    } else if (Array.isArray(record["detail"])) {
      const msgs = record["detail"]
        .map((item) =>
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)["msg"]
            : undefined,
        )
        .filter((m): m is string => typeof m === "string" && m.trim().length > 0);
      if (msgs.length > 0) baseMessage = msgs.join("; ");
    }
  }

  const displayMessage =
    hint && !baseMessage.includes(hint)
      ? `${baseMessage}${/[.!?]$/.test(baseMessage) ? "" : "."} ${hint}`
      : baseMessage;

  return new ApiError(displayMessage, status, code, hint);
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 60_000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: ctrl.signal });
    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        /* ignore non-JSON error body */
      }
      throw parseApiErrorPayload(body, res.status, res.statusText || "Request failed");
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError(
        "Request timed out — the analysis service took too long to respond. Please retry.",
        408,
        "TIMEOUT",
      );
    }
    throw new ApiError(
      "Network error — the analysis service could not be reached.",
      0,
      "NETWORK_ERROR",
    );
  } finally {
    clearTimeout(t);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const r = await request<{ status: string; service: string }>("/health", undefined, 20_000);
    return r?.status === "ok";
  } catch {
    return false;
  }
}

export function createCase(case_id?: string) {
  return request<{ case_id: string }>("/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consent_given: true, ...(case_id ? { case_id } : {}) }),
  });
}

export function uploadDocument(
  caseId: string,
  file: File,
  kind: DocumentKind | "DISCHARGE_SUMMARY",
) {
  const wireKind: DocumentKind = kind === "DISCHARGE_SUMMARY" ? "DISCHARGE" : kind;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", wireKind);
  return request<unknown>(`/cases/${encodeURIComponent(caseId)}/documents`, {
    method: "POST",
    body: fd,
  });
}

export function getProgress(caseId: string) {
  return request<ProgressResponse>(`/cases/${encodeURIComponent(caseId)}/progress`, undefined, 5000);
}

export async function analyzeCase(
  caseId: string,
  facts?: Record<string, string>,
): Promise<AnalysisResult> {
  const raw = await request<BackendAnalysisResult | AnalysisResult>(
    `/cases/${encodeURIComponent(caseId)}/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facts ?? {}),
    },
    180_000,
  );
  return adaptAnalysisResult(raw);
}

export async function patchCaseFacts(
  caseId: string,
  fields: EditableFacts,
): Promise<AnalysisResult> {
  const payload = {
    policy_first_inception_date: fields.policy_first_inception_date || null,
    admission_date: fields.admission_date || null,
    continuous_coverage_months: Number.isFinite(fields.continuous_coverage_months)
      ? fields.continuous_coverage_months
      : null,
    grievance_sent_date: fields.grievance_sent_date || null,
    grievance_received_date: fields.grievance_received_date || null,
    grievance_reply_status: fields.grievance_reply_status,
    claim_amount_inr: Number.isFinite(fields.claim_amount) ? fields.claim_amount : null,
  };

  try {
    const raw = await request<BackendAnalysisResult | AnalysisResult>(
      `/cases/${encodeURIComponent(caseId)}/facts`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      180_000,
    );
    if (
      typeof raw === "object" &&
      raw !== null &&
      "verdict" in raw
    ) {
      return adaptAnalysisResult(raw);
    }
  } catch (e) {
    if (!(e instanceof ApiError) || (e.status !== 404 && e.status !== 405)) {
      throw e;
    }
  }

  // Fallback when PATCH /facts is unavailable: re-run analyze with manual date overrides.
  const dateFacts: Record<string, string> = {};
  if (fields.policy_first_inception_date) {
    dateFacts["policy_first_inception_date"] = fields.policy_first_inception_date;
  }
  if (fields.admission_date) {
    dateFacts["admission_date"] = fields.admission_date;
  }
  return analyzeCase(caseId, dateFacts);
}

export async function getCaseLetter(caseId: string): Promise<AppealLetterResponse | null> {
  try {
    return await request<AppealLetterResponse>(
      `/cases/${encodeURIComponent(caseId)}/letter`,
      undefined,
      15_000,
    );
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405 || e.status === 0)) {
      return null;
    }
    throw e;
  }
}

export function getLetterDownloadUrl(caseId: string, format: "docx" | "pdf"): string {
  return `${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/letter?format=${format}`;
}

export async function downloadBackendLetter(
  caseId: string,
  format: "docx" | "pdf",
  filename: string,
): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const res = await fetch(getLetterDownloadUrl(caseId, format), { signal: ctrl.signal });
    if (res.status === 404 || res.status === 405) {
      return false;
    }
    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        /* ignore non-JSON error body */
      }
      throw parseApiErrorPayload(body, res.status, res.statusText || "Download failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError("Letter download timed out. Please retry.", 408, "TIMEOUT");
    }
    return false;
  } finally {
    clearTimeout(t);
  }
}

export function deleteCase(caseId: string) {
  return request<unknown>(`/cases/${encodeURIComponent(caseId)}`, { method: "DELETE" });
}
