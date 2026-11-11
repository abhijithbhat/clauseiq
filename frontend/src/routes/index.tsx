import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Intake } from "@/components/clauseiq/Intake";
import { ProcessingTracker } from "@/components/clauseiq/ProcessingTracker";
import { VerdictWorkspace } from "@/components/clauseiq/VerdictWorkspace";
import { useAnalysis } from "@/lib/clauseiq/use-analysis";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClauseIQ — Challenge Unfair Health Insurance Claim Rejections" },
      {
        name: "description",
        content:
          "Upload your policy and rejection letter for deterministic IRDAI rule checks, verified clause evidence and a ready grievance appeal letter.",
      },
      { property: "og:title", content: "ClauseIQ — Challenge Unfair Health Insurance Claim Rejections" },
      {
        property: "og:description",
        content:
          "Clause-by-clause analysis of claim repudiations under IRDAI 2024 regulations, with verified evidence and appeal letters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const a = useAnalysis();
  const [label, setLabel] = useState("");
  const router = useRouter();
  const { reset } = a;

  // "Try a Demo Case" in the header should always return to the demo picker.
  useEffect(
    () =>
      router.subscribe("onResolved", ({ toLocation }) => {
        if (toLocation.pathname === "/" && toLocation.hash === "demo-cases") {
          reset();
          setTimeout(
            () => document.getElementById("demo-cases")?.scrollIntoView({ behavior: "smooth" }),
            50,
          );
        }
      }),
    [router, reset],
  );

  if (a.phase === "processing")
    return (
      <ProcessingTracker
        stages={a.stages}
        error={a.error}
        onRetry={a.retry}
        onCancel={a.reset}
        label={label}
      />
    );

  if (a.phase === "result" && a.result)
    return (
      <VerdictWorkspace
        result={a.result}
        isSample={a.isSample}
        backendCaseId={a.backendCaseId}
        onReset={a.reset}
      />
    );

  return (
    <Intake
      onDemo={(id) => {
        setLabel(`Demo case · ${id}`);
        a.start({ mode: "demo", demoId: id });
      }}
      onAnalyze={(files, facts, online) => {
        setLabel(online ? "Live analysis" : "Offline · sample analysis");
        a.start({ mode: "upload", files, facts, online });
      }}
    />
  );
}
