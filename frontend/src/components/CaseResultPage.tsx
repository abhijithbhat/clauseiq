import { VerdictWorkspace } from "./clauseiq/VerdictWorkspace";
import type { AnalysisResult } from "@/lib/clauseiq/types";

export interface CaseResultPageProps {
  result: AnalysisResult;
  isSample?: boolean;
  backendCaseId?: string | null;
  onReset?: () => void;
}

export function CaseResultPage({
  result,
  isSample = false,
  backendCaseId = null,
  onReset = () => {},
}: CaseResultPageProps) {
  return (
    <VerdictWorkspace
      result={result}
      isSample={isSample}
      backendCaseId={backendCaseId}
      onReset={onReset}
    />
  );
}

export default CaseResultPage;
