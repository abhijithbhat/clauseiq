import { describe, expect, it } from "vitest";
import { computeDeadlines } from "./deadlines";
import { formatINR, parseDDMMYYYY } from "./format";
import { DEMO_CASES } from "./mock-cases";

describe("ClauseIQ rules", () => {
  it("formats rupees with lakh grouping", () => {
    expect(formatINR(120000)).toBe("₹1,20,000");
    expect(formatINR(245000)).toBe("₹2,45,000");
  });
  it("grievance TAT is 30 days and Ombudsman limit is 1 year from repudiation", () => {
    const d = computeDeadlines("2026-10-14");
    expect(d.grievanceResponseDue).toBe("2026-11-13");
    expect(d.ombudsmanLastDate).toBe("2027-10-14");
  });
  it("rejects impossible DD/MM/YYYY dates", () => {
    expect(parseDDMMYYYY("31/02/2026")).toBeNull();
    expect(parseDDMMYYYY("01/09/2022")).toBe("2022-09-01");
  });
  it("demo cases carry the specified verdicts and amounts", () => {
    expect(DEMO_CASES.case_01).toMatchObject({ claim_amount: 120000, continuous_cover_months: 49, verdict: "LIKELY_WRONGFUL" });
    expect(DEMO_CASES.case_02).toMatchObject({ claim_amount: 245000, continuous_cover_months: 64 });
    expect(DEMO_CASES.case_03).toMatchObject({ claim_amount: 85000, continuous_cover_months: 10, verdict: "LIKELY_VALID" });
  });
});
