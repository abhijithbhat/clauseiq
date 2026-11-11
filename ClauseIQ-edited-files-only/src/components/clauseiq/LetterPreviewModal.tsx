import { useMemo, useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { downloadLetterDocx, downloadLetterPdf } from "@/lib/clauseiq/letter";
import { fillLetter, LETTER_LEGAL_FOOTER, placeholderKeys, previewLetter } from "@/lib/clauseiq/workspace";
import type { AnalysisResult } from "@/lib/clauseiq/types";
import { cn } from "@/lib/utils";

const enclosures = ["Policy schedule and wording", "Rejection / repudiation letter", "Discharge summary", "Bills and payment receipts"];

export function LetterPreviewModal({ result, open, onOpenChange, initialVersion = 1 }: { result: AnalysisResult; open: boolean; onOpenChange: (open: boolean) => void; initialVersion?: number }) {
  const blocks = useMemo(() => previewLetter(result), [result]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(initialVersion);
  const [checked, setChecked] = useState<string[]>([]);
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const ready = fillLetter(blocks, values);
  const missing = placeholderKeys(ready);
  const inline = (text: string) => text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
    const match = /^\[\[([^\]]+)\]\]$/.exec(part);
    const key = match?.[1];
    if (!key) return <span key={index}>{part}</span>;
    return <span key={index} className="mx-1 inline-flex max-w-full flex-col align-middle"><span className="rounded-t border border-contestable-border bg-contestable-bg px-2 py-0.5 font-sans text-[11px] text-contestable">{part}</span><Input aria-label={`Fill ${key}`} className="h-8 w-56 max-w-full rounded-t-none border-contestable-border font-sans" value={values[key] ?? ""} onChange={e => { setValues(v => ({ ...v, [key]: e.target.value })); setVersion(v => v + 1); }} /></span>;
  });
  const download = async (kind: "pdf" | "docx") => {
    if (missing.length) { toast.error("Fill all highlighted fields before downloading."); return; }
    setBusy(kind);
    try {
      const base = `ClauseIQ_Appeal_${result.claim_number.replace(/[^A-Za-z0-9]+/g, "-")}_v${version}`;
      if (kind === "pdf") await downloadLetterPdf(ready, `${base}.pdf`);
      else await downloadLetterDocx(ready, `${base}.docx`);
    } catch { toast.error("Download failed. Please try again."); }
    finally { setBusy(null); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[80dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto bg-card">
      <DialogHeader><DialogTitle className="flex flex-wrap items-center gap-3 pr-5">Appeal Letter <span className="rounded border border-border bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">v{version}</span></DialogTitle><DialogDescription>Addressed to the Grievance Redressal Officer of {result.insurer}. Review before sending.</DialogDescription></DialogHeader>
      <div className="border-y border-border py-4 font-serif text-sm leading-relaxed">
        {blocks.map((b, i) => {
          if (b.kind === "spacer") return <div key={i} className="h-3" />;
          if (b.kind === "list") return <ol key={i} className="mb-4 ml-5 list-decimal space-y-2">{b.items?.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>;
          return <p key={i} className={cn("break-words", b.bold && "font-semibold", b.kind === "para" && "mb-4", b.kind === "heading" && "mt-3 font-sans text-xs font-semibold uppercase text-muted-foreground")}>{inline(b.text ?? "")}</p>;
        })}
      </div>
      <section aria-label="Enclosure Checklist" className="rounded-md border border-border bg-background p-4"><h3 className="mb-3 text-sm font-medium">Enclosure Checklist</h3><div className="grid gap-3 sm:grid-cols-2">{enclosures.map((item, i) => <label key={item} htmlFor={`enclosure-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground"><Checkbox id={`enclosure-${i}`} checked={checked.includes(item)} onCheckedChange={next => setChecked(c => next ? [...c, item] : c.filter(t => t !== item))} />{item}</label>)}</div></section>
      <p className="text-xs leading-relaxed text-muted-foreground">{LETTER_LEGAL_FOOTER}</p>
      <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-xs text-contestable">{missing.length ? `${missing.length} missing fields` : "All fields filled"}</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => download("docx")} disabled={busy !== null || missing.length > 0}>{busy === "docx" ? <Loader2 className="animate-spin" /> : <FileText />}Download Word (.docx)</Button><Button onClick={() => download("pdf")} disabled={busy !== null || missing.length > 0}>{busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />}Download PDF (.pdf)</Button></div></div>
    </DialogContent>
  </Dialog>;
}