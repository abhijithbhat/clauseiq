import { useState, type FormEvent } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalysisResult, EditableFacts, GrievanceReplyStatus } from "@/lib/clauseiq/types";
import { factsFromResult } from "@/lib/clauseiq/workspace";

const fields: { key: keyof EditableFacts; label: string; type: "date" | "number" | "status" }[] = [
  { key: "policy_first_inception_date", label: "Policy first inception date", type: "date" },
  { key: "admission_date", label: "Admission date", type: "date" },
  { key: "continuous_coverage_months", label: "Continuous coverage (months)", type: "number" },
  { key: "grievance_sent_date", label: "Grievance sent date", type: "date" },
  { key: "grievance_received_date", label: "Grievance received date", type: "date" },
  { key: "grievance_reply_status", label: "Grievance reply status", type: "status" },
  { key: "claim_amount", label: "Claim amount (₹)", type: "number" },
];

const statuses: GrievanceReplyStatus[] = [
  "UNKNOWN",
  "AWAITING_REPLY",
  "REPLY_RECEIVED",
  "CONFIRMED_NO_RESPONSE",
];

type EditableFormState = {
  policy_first_inception_date: string;
  admission_date: string;
  continuous_coverage_months: number | "";
  grievance_sent_date: string;
  grievance_received_date: string;
  grievance_reply_status: GrievanceReplyStatus;
  claim_amount: number | "";
};

export function FactsEditorModal({
  result,
  open,
  onOpenChange,
  onReRun,
}: {
  result: AnalysisResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReRun: (fields: EditableFacts) => Promise<void>;
}) {
  const [facts, setFacts] = useState<EditableFormState>(() => factsFromResult(result));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const claimAmount = Number(facts.claim_amount);
    const continuousMonths = Number(facts.continuous_coverage_months);
    if (!Number.isFinite(claimAmount) || claimAmount < 0) {
      setError("Enter a valid non-negative claim amount.");
      return;
    }
    if (!Number.isFinite(continuousMonths) || continuousMonths < 0) {
      setError("Enter a valid non-negative continuous coverage duration.");
      return;
    }
    if (
      facts.admission_date &&
      facts.policy_first_inception_date &&
      facts.admission_date < facts.policy_first_inception_date
    ) {
      setError("Admission cannot be before first policy inception.");
      return;
    }
    if (
      facts.grievance_received_date &&
      facts.grievance_sent_date &&
      facts.grievance_received_date < facts.grievance_sent_date
    ) {
      setError("Grievance receipt cannot be before it was sent.");
      return;
    }
    if (claimAmount < (result.settled_amount ?? 0)) {
      setError("Claim amount cannot be less than the settled amount.");
      return;
    }

    setBusy(true);
    try {
      await onReRun({
        policy_first_inception_date: facts.policy_first_inception_date,
        admission_date: facts.admission_date,
        continuous_coverage_months: continuousMonths,
        grievance_sent_date: facts.grievance_sent_date,
        grievance_received_date: facts.grievance_received_date,
        grievance_reply_status: facts.grievance_reply_status,
        claim_amount: claimAmount,
      });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[80dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>Edit Key Facts</DialogTitle>
          <DialogDescription>
            Corrected facts are user-provided; document citations remain unchanged until verified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="divide-y divide-border">
            {fields.map(({ key, label, type }) => {
              const source = result.field_sources?.[key];
              return (
                <div key={key} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr] sm:items-center">
                  <div>
                    <label htmlFor={`fact-${key}`} className="text-sm font-medium">
                      {label}
                    </label>
                    <div className="mt-1">
                      <span
                        title={source?.document_title}
                        className="inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {source
                          ? `Page ${source.page} · ${source.document_title}`
                          : "Source page unavailable"}
                      </span>
                    </div>
                  </div>
                  {type === "status" ? (
                    <Select
                      value={facts.grievance_reply_status}
                      disabled={busy}
                      onValueChange={(value) => {
                        if (statuses.includes(value as GrievanceReplyStatus)) {
                          setFacts((f) => ({
                            ...f,
                            grievance_reply_status: value as GrievanceReplyStatus,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger id={`fact-${key}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`fact-${key}`}
                      type={type}
                      value={facts[key]}
                      disabled={busy}
                      required={!key.startsWith("grievance_")}
                      {...(type === "number" ? { min: 0, step: 1 } : {})}
                      onChange={(e) =>
                        setFacts((f) => ({
                          ...f,
                          [key]:
                            type === "number"
                              ? e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {busy ? "Re-running…" : "Re-run Analysis"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

