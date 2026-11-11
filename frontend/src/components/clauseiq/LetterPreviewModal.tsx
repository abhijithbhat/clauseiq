import { useEffect, useMemo, useState } from "react";
import { Copy, FileDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadBackendLetter, getCaseLetter } from "@/lib/clauseiq/api";
import {
  downloadLetterDocx,
  downloadLetterPdf,
  letterToPlainText,
} from "@/lib/clauseiq/letter";
import type { AnalysisResult } from "@/lib/clauseiq/types";
import {
  fillLetter,
  LETTER_LEGAL_FOOTER,
  letterBlocksFromText,
  placeholderKeys,
  previewLetter,
} from "@/lib/clauseiq/workspace";
import { cn } from "@/lib/utils";

const DEFAULT_ENCLOSURES = [
  "Policy schedule and wording",
  "Rejection / repudiation letter",
  "Discharge summary",
  "Bills and payment receipts",
];

export function LetterPreviewModal({
  result,
  open,
  onOpenChange,
  initialVersion = 1,
  backendCaseId = null,
  isSample = true,
}: {
  result: AnalysisResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVersion?: number;
  backendCaseId?: string | null;
  isSample?: boolean;
}) {
  const [backendText, setBackendText] = useState<string | null>(null);
  const [backendEnclosures, setBackendEnclosures] = useState<string[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(initialVersion);
  const [checked, setChecked] = useState<string[]>([]);
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  useEffect(() => {
    if (!open || isSample || !backendCaseId) {
      setBackendText(null);
      setBackendEnclosures(null);
      return;
    }
    let cancelled = false;
    void getCaseLetter(backendCaseId)
      .then((resp) => {
        if (cancelled || !resp) return;
        const text = resp.text ?? resp.content ?? null;
        if (text) setBackendText(text);
        if (typeof resp.version === "number" && resp.version >= 1) {
          setVersion(resp.version);
        }
        if (resp.enclosures && resp.enclosures.length > 0) {
          setBackendEnclosures(resp.enclosures);
        }
      })
      .catch(() => {
        /* Fallback to client-side letter preview silently when backend letter endpoint isn't available */
      });
    return () => {
      cancelled = true;
    };
  }, [open, isSample, backendCaseId]);

  const blocks = useMemo(
    () => (backendText ? letterBlocksFromText(backendText) : previewLetter(result)),
    [backendText, result],
  );
  const enclosures = backendEnclosures ?? DEFAULT_ENCLOSURES;
  const ready = useMemo(() => fillLetter(blocks, values), [blocks, values]);
  const missing = useMemo(() => placeholderKeys(ready), [ready]);
  const hasInlineOverrides = useMemo(
    () => Object.values(values).some((v) => v.trim().length > 0),
    [values],
  );

  const inline = (text: string) =>
    text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
      const match = /^\[\[([^\]]+)\]\]$/.exec(part);
      const key = match?.[1];
      if (!key) return <span key={index}>{part}</span>;
      return (
        <span key={index} className="mx-1 inline-flex max-w-full flex-col align-middle">
          <span className="rounded-t border border-contestable-border bg-contestable-bg px-2 py-0.5 font-sans text-[11px] text-contestable">
            {part}
          </span>
          <Input
            aria-label={`Fill ${key}`}
            className="h-8 w-56 max-w-full rounded-t-none border-contestable-border font-sans"
            value={values[key] ?? ""}
            onChange={(e) => {
              const nextVal = e.target.value;
              setValues((v) => ({ ...v, [key]: nextVal }));
              setVersion((v) => (v === initialVersion ? initialVersion + 1 : v));
            }}
          />
        </span>
      );
    });

  const claimSlug = (
    result.claim_number && result.claim_number !== "Not stated"
      ? result.claim_number
      : result.case_id
  ).replace(/[^A-Za-z0-9]+/g, "-");

  const insurerLabel =
    result.insurer && result.insurer !== "Not stated" ? result.insurer : "the insurer";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letterToPlainText(ready));
      toast.success("Letter copied to clipboard");
    } catch {
      toast.error("Could not access the clipboard");
    }
  };

  const download = async (kind: "pdf" | "docx") => {
    setBusy(kind);
    const filename = `ClauseIQ_Appeal_${claimSlug}_v${version}.${kind}`;
    try {
      let downloadedRemotely = false;
      if (backendCaseId && !isSample && !hasInlineOverrides) {
        downloadedRemotely = await downloadBackendLetter(backendCaseId, kind, filename);
      }
      if (!downloadedRemotely) {
        if (kind === "pdf") await downloadLetterPdf(ready, filename);
        else await downloadLetterDocx(ready, filename);
      }
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 pr-5">
            Appeal Letter{" "}
            <span className="rounded border border-border bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
              v{version}
            </span>
          </DialogTitle>
          <DialogDescription>
            Addressed to the Grievance Redressal Officer of {insurerLabel}. Review before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="border-y border-border py-4 font-serif text-sm leading-relaxed">
          {blocks.map((b, i) => {
            if (b.kind === "spacer") return <div key={i} className="h-3" />;
            if (b.kind === "list")
              return (
                <ol key={i} className="mb-4 ml-5 list-decimal space-y-2">
                  {b.items?.map((t, j) => (
                    <li key={j}>{inline(t)}</li>
                  ))}
                </ol>
              );
            return (
              <p
                key={i}
                className={cn(
                  "break-words",
                  b.bold && "font-semibold",
                  b.kind === "para" && "mb-4",
                  b.kind === "heading" &&
                    "mt-3 font-sans text-xs font-semibold uppercase text-muted-foreground",
                )}
              >
                {inline(b.text ?? "")}
              </p>
            );
          })}
        </div>
        <section
          aria-label="Enclosure Checklist"
          className="rounded-md border border-border bg-background p-4"
        >
          <h3 className="mb-3 text-sm font-medium">Enclosure Checklist</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {enclosures.map((item, i) => (
              <label
                key={item}
                htmlFor={`enclosure-${i}`}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <Checkbox
                  id={`enclosure-${i}`}
                  checked={checked.includes(item)}
                  onCheckedChange={(next) =>
                    setChecked((c) => (next ? [...c, item] : c.filter((t) => t !== item)))
                  }
                />
                {item}
              </label>
            ))}
          </div>
        </section>
        <p className="text-xs leading-relaxed text-muted-foreground">{LETTER_LEGAL_FOOTER}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-xs text-contestable">
            {missing.length
              ? `${missing.length} placeholder fields remaining — fill above or download with [[...]] placeholders`
              : "All placeholder fields filled"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copy}>
              <Copy />
              Copy Text
            </Button>
            <Button variant="outline" onClick={() => download("docx")} disabled={busy !== null}>
              {busy === "docx" ? <Loader2 className="animate-spin" /> : <FileText />}
              Download Word (.docx)
            </Button>
            <Button onClick={() => download("pdf")} disabled={busy !== null}>
              {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />}
              Download PDF (.pdf)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

