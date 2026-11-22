import { describe, expect, it } from "vitest";
import { DEMO_CASES } from "./mock-cases";
import {
  deadlineStatus,
  factsFromResult,
  fillLetter,
  placeholderKeys,
  previewLetter,
  recalculateDemo,
  timelineMilestones,
} from "./workspace";

const result = DEMO_CASES["case_01"];
if (!result) throw new Error("Missing demo fixture");

describe("Workspace corrections", () => {
  it("keeps both grievance dates and all four reply states", () => {
    for (const status of [
      "UNKNOWN",
      "AWAITING_REPLY",
      "REPLY_RECEIVED",
      "CONFIRMED_NO_RESPONSE",
    ] as const) {
      const updated = recalculateDemo(result, {
        ...factsFromResult(result),
        grievance_sent_date: "2026-11-01",
        grievance_received_date: "2026-11-02",
        grievance_reply_status: status,
      });
      expect(updated).toMatchObject({
        grievance_sent_date: "2026-11-01",
        grievance_received_date: "2026-11-02",
        grievance_reply_status: status,
      });
    }
  });

  it("recalculates edited amounts and withdraws unverified legal conclusions offline", () => {
    const updated = recalculateDemo(result, {
      ...factsFromResult(result),
      claim_amount: 150000,
      continuous_coverage_months: 12,
    });
    expect(updated.claim_amount).toBe(150000);
    expect(updated.disallowed_amount).toBe(150000 - (result.settled_amount ?? 0));
    expect(updated.continuous_cover_months).toBe(12);
    expect(updated.needs_human_review).toBe(true);
    expect(updated.verdict).toBe("INSUFFICIENT_INFO");
    expect(updated.rules.every((rule) => rule.outcome === "NEEDS_INFO")).toBe(true);
  });

  it("places the IRDAI TAT 14 days after receipt", () => {
    expect(
      timelineMilestones({ ...result, grievance_received_date: "2026-11-02" }, "2026-11-11")[2]
        ?.date,
    ).toBe("2026-11-16");
  });

  it("places the Rule 14 no-response wait 30 days after receipt", () => {
    expect(
      timelineMilestones({ ...result, grievance_received_date: "2026-11-02" }, "2026-11-11")[3]
        ?.date,
    ).toBe("2026-12-02");
  });

  it("shows a one-year indicative filing date without inventing grievance receipt", () => {
    const markers = timelineMilestones({ ...result, repudiation_date: "2026-10-14" }, "2026-11-11");
    expect(markers[4]?.date).toBe("2027-10-14");
    expect(markers[2]?.date).toBeNull();
    expect(markers[3]?.date).toBeNull();
  });

  it("handles null repudiation_date safely without crashing timelineMilestones", () => {
    const markers = timelineMilestones({ ...result, repudiation_date: null }, "2026-11-11");
    expect(markers[1]?.date).toBeNull();
    expect(markers[1]?.status).toBe("action_needed");
    expect(markers[4]?.date).toBeNull();
    expect(markers[4]?.status).toBe("action_needed");
  });

  it("distinguishes upcoming, due soon, passed and action_needed", () => {
    expect(deadlineStatus("2026-12-01", "2026-11-11")).toBe("upcoming");
    expect(deadlineStatus("2026-11-14", "2026-11-11")).toBe("due soon");
    expect(deadlineStatus("2026-11-10", "2026-11-11")).toBe("passed");
    expect(deadlineStatus("2026-11-10", "2026-11-11", true)).toBe("action_needed");
  });

  it("fills repeated letter placeholders and leaves missing values unresolved", () => {
    const blocks = [{ kind: "para" as const, text: "[[name]] / [[name]] / [[address]]" }];
    expect(fillLetter(blocks, { name: "Anita" })[0]?.text).toBe("Anita / Anita / [[address]]");
    expect(placeholderKeys(fillLetter(blocks, { name: "Anita" }))).toEqual(["address"]);
    expect(placeholderKeys(previewLetter(result))).toContain("postal_address");
  });
});

