import { addDays, addYears } from "./format";

/** Days the insurer has to resolve a grievance before the Ombudsman route opens. */
export const GRIEVANCE_TAT_DAYS = 30;
/** Years from repudiation within which an Ombudsman complaint must be filed. */
export const OMBUDSMAN_LIMIT_YEARS = 1;

export function computeDeadlines(repudiationIso: string) {
  return {
    repudiation: repudiationIso,
    grievanceResponseDue: addDays(repudiationIso, GRIEVANCE_TAT_DAYS),
    ombudsmanLastDate: addYears(repudiationIso, OMBUDSMAN_LIMIT_YEARS),
  };
}
