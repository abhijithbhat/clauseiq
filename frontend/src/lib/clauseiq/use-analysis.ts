import { useCallback, useEffect, useRef, useState } from "react";
import { mapProgressToStages } from "./adapter";
import { analyzeCase, ApiError, createCase, getProgress, uploadDocument } from "./api";
import { DEMO_CASES, type DemoCaseId } from "./mock-cases";
import { PIPELINE_STAGES } from "./stages";
import type { AnalysisResult, DocumentKind, ManualFacts, StageStatus } from "./types";
import { parseDDMMYYYY } from "./format";

export type Phase = "intake" | "processing" | "result";

export type AnalysisSource =
  | { mode: "demo"; demoId: DemoCaseId }
  | {
      mode: "upload";
      files: Partial<Record<DocumentKind, File>>;
      facts: ManualFacts;
      online: boolean;
    };

const initialStages = (): StageStatus[] => PIPELINE_STAGES.map(() => "pending");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useAnalysis() {
  const [phase, setPhase] = useState<Phase>("intake");
  const [stages, setStages] = useState<StageStatus[]>(initialStages);
  const [error, setError] = useState<{ message: string; rateLimited: boolean } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [backendCaseId, setBackendCaseId] = useState<string | null>(null);
  const sourceRef = useRef<AnalysisSource | null>(null);
  const uploadedRef = useRef(false);
  const runId = useRef(0);

  useEffect(() => () => void runId.current++, []);

  const setStage = (i: number, s: StageStatus) =>
    setStages((prev) => prev.map((v, idx) => (idx < i ? "done" : idx === i ? s : v)));

  const simulate = useCallback(async (id: number, demoId: DemoCaseId, fromStage = 0) => {
    for (let i = fromStage; i < PIPELINE_STAGES.length; i++) {
      if (runId.current !== id) return;
      setStage(i, "running");
      await wait(650 + Math.random() * 500);
    }
    if (runId.current !== id) return;
    setStages(PIPELINE_STAGES.map(() => "done"));
    await wait(350);
    if (runId.current !== id) return;
    setResult(DEMO_CASES[demoId]);
    setPhase("result");
  }, []);

  const runBackend = useCallback(
    async (id: number, src: Extract<AnalysisSource, { mode: "upload" }>) => {
      let poll: ReturnType<typeof setInterval> | undefined;
      try {
        setStage(0, "running");
        let caseId = backendCaseId;
        if (!caseId) {
          caseId = (await createCase()).case_id;
          setBackendCaseId(caseId);
        }
        if (!uploadedRef.current) {
          for (const [kind, file] of Object.entries(src.files) as [DocumentKind, File][]) {
            if (file) await uploadDocument(caseId, file, kind);
          }
          uploadedRef.current = true;
        }
        const cid = caseId;
        poll = setInterval(async () => {
          try {
            const p = await getProgress(cid);
            if (runId.current !== id) return;
            setStages(mapProgressToStages(p));
          } catch {
            /* polling is best-effort */
          }
        }, 1000);
        const facts: Record<string, string> = {};
        const inc = src.facts.first_inception_date && parseDDMMYYYY(src.facts.first_inception_date);
        const adm = src.facts.admission_date && parseDDMMYYYY(src.facts.admission_date);
        if (inc) facts["first_inception_date"] = inc;
        if (adm) facts["admission_date"] = adm;
        const r = await analyzeCase(cid, facts);
        clearInterval(poll);
        if (runId.current !== id) return;
        setStages(PIPELINE_STAGES.map(() => "done"));
        await wait(300);
        setResult(r);
        setPhase("result");
      } catch (e) {
        if (poll) clearInterval(poll);
        if (runId.current !== id) return;
        const err = e instanceof ApiError ? e : new ApiError("Unexpected error", 0);
        setStages((prev) => {
          const idx = Math.max(
            0,
            prev.findIndex((s) => s === "running"),
          );
          return prev.map((s, i) => (i === idx ? "failed" : s));
        });
        setError({
          message: err.isRateLimit
            ? err.code === "AI_RATE_LIMIT"
              ? err.message
              : "The AI service is rate-limited right now. Wait a few seconds and retry this stage."
            : err.message,
          rateLimited: err.isRateLimit,
        });
      }
    },
    [backendCaseId],
  );

  const start = useCallback(
    (src: AnalysisSource) => {
      const id = ++runId.current;
      sourceRef.current = src;
      uploadedRef.current = false;
      setBackendCaseId(null);
      setError(null);
      setResult(null);
      setStages(initialStages());
      setPhase("processing");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      if (src.mode === "demo") {
        setIsSample(false);
        void simulate(id, src.demoId);
      } else {
        // ALWAYS send real user uploads to the live backend!
        setIsSample(false);
        void runBackend(id, src);
      }
    },
    [simulate, runBackend],
  );

  const retry = useCallback(() => {
    const src = sourceRef.current;
    if (!src) return;
    const id = ++runId.current;
    setError(null);
    setStages((prev) => prev.map((s) => (s === "failed" ? "running" : s)));
    if (src.mode === "upload" && src.online) void runBackend(id, src);
    else void simulate(id, src.mode === "demo" ? src.demoId : "case_01");
  }, [runBackend, simulate]);

  const reset = useCallback(() => {
    runId.current++;
    setPhase("intake");
    setResult(null);
    setError(null);
    setStages(initialStages());
    setBackendCaseId(null);
  }, []);

  return { phase, stages, error, result, isSample, backendCaseId, start, retry, reset };
}
