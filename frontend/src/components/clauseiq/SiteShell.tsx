import { Link } from "@tanstack/react-router";
import { Info, Scale, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useBackendStatus } from "@/lib/clauseiq/use-backend-status";
import { cn } from "@/lib/utils";

export const DISCLAIMER_TEXT =
  "ClauseIQ is an assistive analysis tool for policyholders and grievance volunteers. It does not provide legal advice and cannot guarantee any claim outcome. Please verify all cited clauses before submitting your appeal.";

/** True once the page has scrolled past the top — drives the frosted masthead. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function DisclaimerBar() {
  return (
    <div
      role="note"
      aria-label="Legal disclaimer"
      className="border-b border-banner bg-banner text-banner-foreground"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-2 text-[12px] leading-snug sm:px-6">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        <p>{DISCLAIMER_TEXT}</p>
      </div>
    </div>
  );
}

function StatusBadge() {
  const { checking, online, refresh } = useBackendStatus();
  return (
    <button
      type="button"
      onClick={() => refresh()}
      title="Click to re-check the analysis service"
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]",
        checking && "border-border bg-card text-muted-foreground",
        !checking && online && "border-wrongful-border bg-wrongful-bg text-wrongful",
        !checking && !online && "border-contestable-border bg-contestable-bg text-contestable",
      )}
    >
      <span className="relative flex size-1.5">
        {!checking && online && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-wrongful opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            !checking && "animate-status",
            checking ? "bg-subtle-foreground" : online ? "bg-wrongful" : "bg-contestable",
          )}
        />
      </span>
      {checking ? "Checking backend…" : online ? "Backend: Connected" : "Demo Offline Mode"}
    </button>
  );
}

function Masthead({ scrolled }: { scrolled: boolean }) {
  const nav =
    "text-[13px] text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground";
  return (
    <header
      className={cn(
        "border-b border-border transition-[background-color,box-shadow,backdrop-filter] duration-200 ease-out",
        scrolled ? "bg-card/85 shadow-card backdrop-blur-md" : "bg-card",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/" className="press flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="size-4" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-foreground">
              ClauseIQ
            </span>
            <span className="rounded border border-border px-1.5 py-px font-mono text-[10px] text-muted-foreground">
              v0.1
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground lg:inline-flex">
            <ShieldCheck className="size-3.5 text-wrongful" />
            IRDAI Master Circular 2024 &amp; Ombudsman Act 2017 Compliant
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/how-it-works" className={nav} activeProps={{ className: "text-foreground" }}>
            How It Works
          </Link>
          <Link to="/about" className={nav} activeProps={{ className: "text-foreground" }}>
            About &amp; Privacy
          </Link>
          <Link to="/" hash="demo-cases" className={cn(nav, "font-medium text-foreground")}>
            Try a Demo Case
          </Link>
          <StatusBadge />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-[12px] text-muted-foreground sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Scale className="size-3.5" /> ClauseIQ
          </div>
          <p className="mt-2 max-w-xs leading-relaxed">
            Deterministic, citation-first analysis of health insurance claim repudiations in India.
          </p>
        </div>
        <div className="leading-relaxed">
          <div className="eyebrow mb-2">Regulatory references</div>
          IRDAI Master Circular on Health Insurance Business, 2024 · Insurance Act, 1938 (Section
          45) · Insurance Ombudsman Rules, 2017
        </div>
        <div className="leading-relaxed">
          <div className="eyebrow mb-2">Need help?</div>
          IRDAI Bima Bharosa: bimabharosa.irdai.gov.in · Toll-free 155255 / 1800 4254 732
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Disclaimer and masthead travel together so the legal notice is never escapable. */}
      <div className="sticky top-0 z-50">
        <DisclaimerBar />
        <Masthead scrolled={scrolled} />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
