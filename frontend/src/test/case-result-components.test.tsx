import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CaseResultPage } from "@/components/CaseResultPage";
import { DeadlinesTimeline } from "@/components/DeadlinesTimeline";
import { FactsEditorModal } from "@/components/FactsEditorModal";
import { LetterPreviewModal } from "@/components/LetterPreviewModal";
import { DEMO_CASES } from "@/lib/clauseiq/mock-cases";

const sampleResult = DEMO_CASES.case_01;

describe("Module M8/M9 Components", () => {
  it("renders CaseResultPage with verdict, money summary, and action bar", () => {
    const onReset = vi.fn();
    render(<CaseResultPage result={sampleResult} onReset={onReset} />);

    // Verdict card
    expect(screen.getByText(/LIKELY WRONGFUL/i)).toBeInTheDocument();
    expect(screen.getByText(sampleResult.summary)).toBeInTheDocument();

    // Money summary in Indian format
    expect(screen.getAllByText("₹1,20,000").length).toBeGreaterThan(0);

    // Action buttons
    expect(screen.getByRole("button", { name: /Start Over/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Preview & Download Appeal Letter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Edit Facts & Re-run/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Delete My Data/i }),
    ).toBeInTheDocument();

    // Trigger start over
    fireEvent.click(screen.getByRole("button", { name: /Start Over/i }));
    expect(onReset).toHaveBeenCalled();
  });

  it("renders DeadlinesTimeline with milestones and status badges", () => {
    render(<DeadlinesTimeline result={sampleResult} />);
    expect(screen.getByText(/Appeal timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Insurance Ombudsman/i)).toBeInTheDocument();
  });

  it("renders FactsEditorModal and handles field edits", () => {
    const onReRun = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <FactsEditorModal
        result={sampleResult}
        open={true}
        onOpenChange={onOpenChange}
        onReRun={onReRun}
      />,
    );

    expect(screen.getByText(/Edit Key Facts/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Policy first inception date/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Admission date/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Claim amount/i),
    ).toBeInTheDocument();
  });

  it("renders LetterPreviewModal with download options and placeholders", () => {
    const onOpenChange = vi.fn();

    render(
      <LetterPreviewModal
        result={sampleResult}
        open={true}
        onOpenChange={onOpenChange}
        backendCaseId={null}
      />,
    );

    expect(screen.getByText(/Appeal Letter/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download Word/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download PDF/i })).toBeInTheDocument();
  });
});
