import type { RuleOutcome, Verdict } from "./types";

export const VERDICT_META: Record<
  Verdict,
  { label: string; short: string; description: string; className: string; dot: string; accentClassName: string }
> = {
  LIKELY_WRONGFUL: {
    label: "Likely Wrongful",
    short: "Insurer appears to have violated the regulations",
    description: "The rejection conflicts with binding IRDAI rules or the policy's own terms.",
    className: "text-wrongful bg-wrongful-bg border-wrongful-border",
    dot: "bg-wrongful",
    accentClassName: "border-t-wrongful-accent",
  },
  CONTESTABLE: {
    label: "Contestable",
    short: "Strong grounds exist to dispute this rejection",
    description: "Material arguments favour the policyholder, but some facts remain disputed.",
    className: "text-contestable bg-contestable-bg border-contestable-border",
    dot: "bg-contestable",
    accentClassName: "border-t-contestable-accent",
  },
  LIKELY_VALID: {
    label: "Likely Valid",
    short: "The insurer's position is legally supported",
    description: "The cited clause appears to apply and is within regulatory limits.",
    className: "text-valid bg-valid-bg border-valid-border",
    dot: "bg-valid",
    accentClassName: "border-t-valid-accent",
  },
  INSUFFICIENT_INFO: {
    label: "Insufficient Info",
    short: "Key facts are missing for a reliable verdict",
    description: "Upload additional documents or provide the missing dates to continue.",
    className: "text-info bg-info-bg border-info-border",
    dot: "bg-info",
    accentClassName: "border-t-info",
  },
};

export const OUTCOME_META: Record<RuleOutcome, { label: string; className: string }> = {
  CONTRADICTS_INSURER: {
    label: "Contradicts insurer",
    className: "text-wrongful bg-wrongful-bg border-wrongful-border",
  },
  SUPPORTS_INSURER: {
    label: "Supports insurer",
    className: "text-valid bg-valid-bg border-valid-border",
  },
  NEEDS_INFO: { label: "Needs info", className: "text-info bg-info-bg border-info-border" },
  NOT_APPLICABLE: {
    label: "Not applicable",
    className: "text-subtle-foreground bg-card border-border",
  },
};

export function confidenceLabel(score: number): string {
  if (score >= 90) return "High Evidentiary Match";
  if (score >= 75) return "Strong Evidentiary Match";
  if (score >= 55) return "Moderate Evidentiary Match";
  return "Low Evidentiary Match";
}
