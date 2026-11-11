import { i as __toESM } from "../_runtime.mjs";
import { n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as BadgeCheck, C as Copy, D as ChevronDown, E as ChevronUp, M as ArrowLeft, O as Check, T as CircleCheck, _ as Gavel, b as FileSearch, d as Quote, f as Lock, h as Landmark, i as Timer, j as ArrowRight, k as CalendarClock, l as RotateCcw, m as ListChecks, n as TriangleAlert, o as ShieldAlert, p as LoaderCircle, r as Trash2, s as ScrollText, t as X, u as RefreshCw, w as CloudUpload, x as FileDown, y as FileText } from "../_libs/lucide-react.mjs";
import { n as cn, t as PIPELINE_STAGES } from "./utils-WbrsqoLR.mjs";
import { i as confidenceLabel, n as OUTCOME_META, r as VERDICT_META, t as Button } from "./verdict-V8xaGJcn.mjs";
import { b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as deleteCase, c as getProgress, d as uploadDocument, f as useBackendStatus, i as createCase, l as mapProgressToStages, n as analyzeCase, o as downloadBackendLetter, r as checkHealth, s as getCaseLetter, t as ApiError, u as patchCaseFacts } from "./use-backend-status-BvJR9wA6.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bj5zXr1F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var DEMO_CASES = {
	case_01: {
		case_id: "case_01",
		claim_number: "CHI/CL/2026/0048213",
		policy_number: "CHI-91827364",
		insurer: "Care Health Insurance Limited",
		insurer_grievance_email: "grievance@careinsurance.com",
		product_name: "Care Supreme — Individual",
		policyholder: "Meera Raghunathan",
		patient: "Meera Raghunathan (Self, 52)",
		hospital: "Manipal Hospital, Old Airport Road, Bengaluru",
		diagnosis: "Symptomatic cholelithiasis with chronic calculous cholecystitis",
		treatment: "Laparoscopic cholecystectomy",
		claim_amount: 12e4,
		settled_amount: 0,
		disallowed_amount: 12e4,
		sum_insured: 5e5,
		first_inception_date: "2022-09-01",
		admission_date: "2026-10-05",
		repudiation_date: "2026-10-14",
		continuous_cover_months: 49,
		rejection_reason: "Ailment treated is pre-existing in nature and falls under the Pre-Existing Disease exclusion.",
		cited_clause: "Clause 4.1 — Pre-Existing Diseases (Code Excl01)",
		verdict: "LIKELY_WRONGFUL",
		confidence: 95,
		summary: "Your claim was rejected citing Clause 4.1 for Pre-Existing Diseases. However, you have completed 49 months of continuous coverage, which exceeds the 36-month legal cap under IRDAI 2024 regulations.",
		appeal_grounds: [
			"The policy has been in continuous force since 01/09/2022 — 49 months before the date of admission (05/10/2026).",
			"The IRDAI Master Circular on Health Insurance Business (2024) caps the Pre-Existing Disease waiting period at 36 months. Any longer waiting period stated in the policy is unenforceable.",
			"The policy's own Clause 4.1 states that PED cover begins after 36 months of continuous coverage, which ended on 31/08/2025.",
			"The rejection letter does not identify any exclusion other than Clause 4.1, so no alternative ground for repudiation has been communicated."
		],
		rules: [
			{
				id: "R1",
				name: "PED Waiting Period",
				outcome: "CONTRADICTS_INSURER",
				citation: "IRDAI Master Circular on Health Insurance 2024, Clause 4.1",
				finding: "49 months of continuous cover exceeds the 36-month statutory ceiling."
			},
			{
				id: "R2",
				name: "60-Month Moratorium",
				outcome: "NOT_APPLICABLE",
				citation: "Insurance Act 1938, Section 45",
				finding: "Policy has not yet completed 60 months; moratorium not triggered."
			},
			{
				id: "R3",
				name: "Specific Illness Waiting Period",
				outcome: "CONTRADICTS_INSURER",
				citation: "Policy Clause 4.2; IRDAI Master Circular 2024",
				finding: "Gall bladder disorders listed with 24-month wait; completed 49 months."
			},
			{
				id: "R4",
				name: "Initial 30-Day Waiting Period",
				outcome: "CONTRADICTS_INSURER",
				citation: "Policy Clause 4.3 (Code Excl03)",
				finding: "Admission falls well after the first 30 days of cover."
			},
			{
				id: "R5",
				name: "Continuity & Portability Credit",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular 2024, Portability provisions",
				finding: "Original policy with this insurer; no ported credit required."
			},
			{
				id: "R6",
				name: "Non-Disclosure Burden of Proof",
				outcome: "CONTRADICTS_INSURER",
				citation: "Insurance Act 1938, Section 45",
				finding: "Insurer has not alleged or evidenced any non-disclosure at proposal stage."
			},
			{
				id: "R7",
				name: "Room Rent Proportionate Deduction",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular 2024, Proportionate Deduction",
				finding: "Full repudiation; no room-rent based deduction applied."
			},
			{
				id: "R8",
				name: "Specific Reason for Repudiation",
				outcome: "SUPPORTS_INSURER",
				citation: "IRDAI (Protection of Policyholders' Interests) Regulations",
				finding: "Rejection letter names the clause relied upon."
			},
			{
				id: "R9",
				name: "Grievance & Ombudsman Disclosure",
				outcome: "SUPPORTS_INSURER",
				citation: "Insurance Ombudsman Rules 2017, Rule 14",
				finding: "Letter discloses Grievance Officer and Ombudsman contact details."
			},
			{
				id: "R10",
				name: "Documentation Completeness",
				outcome: "CONTRADICTS_INSURER",
				citation: "IRDAI Master Circular 2024, Claim Settlement",
				finding: "All mandatory claim documents were on record; no deficiency raised."
			}
		],
		evidence: [
			{
				id: "E1",
				source: "POLICY",
				document_title: "Care Supreme — Policy Wording",
				section: "Clause 4.1 — Pre-Existing Diseases (Code Excl01)",
				page: 14,
				quote: "Expenses related to the treatment of a pre-existing Disease (PED) and its direct complications shall be excluded until the expiry of 36 months of continuous coverage after the date of inception of the first policy with us.",
				match_score: 1,
				relevance: "Policy's own PED waiting period is 36 months."
			},
			{
				id: "E2",
				source: "POLICY",
				document_title: "Care Supreme — Policy Schedule",
				section: "Schedule of Insurance — Continuity",
				page: 1,
				quote: "Date of First Inception with Care Health: 01/09/2022",
				match_score: 1,
				relevance: "Establishes start of continuous coverage."
			},
			{
				id: "E3",
				source: "REJECTION_LETTER",
				document_title: "Claim Repudiation Letter dated 14/10/2026",
				section: "Reason for Repudiation",
				page: 1,
				quote: "The ailment treated is pre-existing in nature and hence the claim falls under the Pre-Existing Disease exclusion as per Clause 4.1 of the policy terms and conditions.",
				match_score: 1,
				relevance: "The sole ground relied on by the insurer."
			},
			{
				id: "E4",
				source: "DISCHARGE_SUMMARY",
				document_title: "Discharge Summary — Manipal Hospital",
				section: "Admission Details",
				page: 1,
				quote: "Date of Admission: 05/10/2026  Date of Discharge: 07/10/2026",
				match_score: 1,
				relevance: "Fixes the date used to compute continuous coverage."
			}
		]
	},
	case_02: {
		case_id: "case_02",
		claim_number: "SHAI/2026/HCL/7731905",
		policy_number: "P/141113/01/2021/004417",
		insurer: "Star Health and Allied Insurance Co. Ltd.",
		insurer_grievance_email: "gro@starhealth.in",
		product_name: "Star Comprehensive Insurance Policy",
		policyholder: "Rajesh Kumar Iyer",
		patient: "Rajesh Kumar Iyer (Self, 58)",
		hospital: "Apollo Hospitals, Greams Road, Chennai",
		diagnosis: "Coronary artery disease — triple vessel disease, unstable angina",
		treatment: "PTCA with drug-eluting stent to LAD",
		claim_amount: 245e3,
		settled_amount: 0,
		disallowed_amount: 245e3,
		sum_insured: 1e6,
		first_inception_date: "2021-04-10",
		admission_date: "2026-08-20",
		repudiation_date: "2026-09-02",
		continuous_cover_months: 64,
		rejection_reason: "Non-disclosure of pre-existing hypertension at the time of proposal; policy treated as void for material misrepresentation.",
		cited_clause: "Clause 7.3 — Disclosure to Information Norm",
		verdict: "CONTESTABLE",
		confidence: 82,
		summary: "Your claim was rejected for not disclosing hypertension when you bought the policy. Because the policy has run for 64 months continuously, Section 45 of the Insurance Act bars this challenge unless the insurer proves fraud — which the letter does not establish.",
		appeal_grounds: [
			"The policy has been in continuous force since 10/04/2021 — 64 months before admission on 20/08/2026, beyond the 60-month moratorium.",
			"Under Section 45 of the Insurance Act, 1938 and the IRDAI Master Circular 2024, no claim may be contested on grounds of non-disclosure after the moratorium, except for established fraud.",
			"The repudiation letter alleges 'non-disclosure' but provides no evidence of deliberate intent to deceive, which is the legal threshold for fraud.",
			"The policy was renewed five times without any query on medical history, and the insurer accepted premiums throughout."
		],
		rules: [
			{
				id: "R1",
				name: "PED Waiting Period",
				outcome: "CONTRADICTS_INSURER",
				citation: "IRDAI Master Circular on Health Insurance 2024, Clause 4.1",
				finding: "64 months of cover exceeds the 36-month PED ceiling."
			},
			{
				id: "R2",
				name: "60-Month Moratorium",
				outcome: "CONTRADICTS_INSURER",
				citation: "Insurance Act 1938, Section 45; IRDAI Master Circular 2024",
				finding: "Moratorium completed on 09/04/2026; non-disclosure no longer contestable."
			},
			{
				id: "R3",
				name: "Specific Illness Waiting Period",
				outcome: "NOT_APPLICABLE",
				citation: "Policy Clause 4.2",
				finding: "Cardiac procedures are not on the specific waiting list."
			},
			{
				id: "R4",
				name: "Initial 30-Day Waiting Period",
				outcome: "CONTRADICTS_INSURER",
				citation: "Policy Clause 4.3",
				finding: "Admission falls well after the first 30 days of cover."
			},
			{
				id: "R5",
				name: "Continuity & Portability Credit",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular 2024, Portability provisions",
				finding: "Original policy with this insurer."
			},
			{
				id: "R6",
				name: "Fraud Exception to Moratorium",
				outcome: "NEEDS_INFO",
				citation: "Insurance Act 1938, Section 45(2)–(3)",
				finding: "Insurer alleges 'suppression'; no proof of fraudulent intent on record."
			},
			{
				id: "R7",
				name: "Room Rent Proportionate Deduction",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular 2024, Proportionate Deduction",
				finding: "Full repudiation; no deduction applied."
			},
			{
				id: "R8",
				name: "Specific Reason for Repudiation",
				outcome: "SUPPORTS_INSURER",
				citation: "IRDAI (Protection of Policyholders' Interests) Regulations",
				finding: "Letter names the clause and the alleged condition."
			},
			{
				id: "R9",
				name: "Grievance & Ombudsman Disclosure",
				outcome: "SUPPORTS_INSURER",
				citation: "Insurance Ombudsman Rules 2017, Rule 14",
				finding: "Grievance channel disclosed."
			},
			{
				id: "R10",
				name: "Documentation Completeness",
				outcome: "NEEDS_INFO",
				citation: "IRDAI Master Circular 2024, Claim Settlement",
				finding: "Copy of original proposal form not furnished with the rejection."
			}
		],
		evidence: [
			{
				id: "E1",
				source: "POLICY",
				document_title: "Star Comprehensive — Policy Wording",
				section: "Clause 7.4 — Moratorium Period",
				page: 22,
				quote: "After completion of sixty continuous months of coverage (including portability and migration), no policy and claim shall be contestable by the insurer on grounds of non-disclosure, misrepresentation, except on grounds of established fraud.",
				match_score: 1,
				relevance: "Policy itself adopts the 60-month moratorium."
			},
			{
				id: "E2",
				source: "REGULATION",
				document_title: "Insurance Act, 1938",
				section: "Section 45(1)",
				page: 1,
				quote: "No policy of life insurance shall be called in question on any ground whatsoever after the expiry of three years from the date of the policy.",
				match_score: 1,
				relevance: "Statutory basis for limiting challenges; extended to health by IRDAI."
			},
			{
				id: "E3",
				source: "REJECTION_LETTER",
				document_title: "Repudiation Letter dated 02/09/2026",
				section: "Grounds",
				page: 1,
				quote: "Our investigation reveals that the insured was a known case of hypertension prior to inception, which was not disclosed in the proposal form. Hence the claim is repudiated under Clause 7.3.",
				match_score: 1,
				relevance: "Ground is non-disclosure; no fraud finding stated."
			},
			{
				id: "E4",
				source: "DISCHARGE_SUMMARY",
				document_title: "Discharge Summary — Apollo Hospitals (scanned)",
				section: "Past History",
				page: 2,
				quote: "K/C/O Systemic Hypertension — on irregular medication, duration not known.",
				match_score: .98,
				relevance: "Duration of hypertension is not established — weakens any fraud inference."
			}
		]
	},
	case_03: {
		case_id: "case_03",
		claim_number: "NB/HC/2026/10/556120",
		policy_number: "31122025NBR0082245",
		insurer: "Niva Bupa Health Insurance Company Limited",
		insurer_grievance_email: "customercare@nivabupa.com",
		product_name: "ReAssure 2.0",
		policyholder: "Sunita Deshpande",
		patient: "Sunita Deshpande (Self, 61)",
		hospital: "Sankara Nethralaya, Pune",
		diagnosis: "Senile mature cataract — right eye",
		treatment: "Phacoemulsification with foldable IOL implant",
		claim_amount: 85e3,
		settled_amount: 0,
		disallowed_amount: 85e3,
		sum_insured: 5e5,
		first_inception_date: "2025-12-01",
		admission_date: "2026-10-08",
		repudiation_date: "2026-10-28",
		continuous_cover_months: 10,
		rejection_reason: "Cataract surgery is subject to a 24-month specific waiting period which has not been completed.",
		cited_clause: "Clause 4.2(b) — Specified Disease/Procedure Waiting Period (Code Excl02)",
		verdict: "LIKELY_VALID",
		confidence: 91,
		summary: "Your claim was rejected because cataract surgery has a 24-month waiting period and your policy had been active for only 10 months. This waiting period is permitted under IRDAI rules, so the rejection appears to be legally supported.",
		appeal_grounds: [
			"No strong statutory ground has been identified. The 24-month waiting period is within the 36-month limit allowed by IRDAI.",
			"If you held any earlier health policy without a break, ask the insurer to apply portability credit — this could reduce the remaining waiting period.",
			"Check whether the treatment arose from an accident; accidental injuries are generally exempt from waiting periods."
		],
		rules: [
			{
				id: "R1",
				name: "PED Waiting Period",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular on Health Insurance 2024, Clause 4.1",
				finding: "Rejection not based on pre-existing disease."
			},
			{
				id: "R2",
				name: "60-Month Moratorium",
				outcome: "NOT_APPLICABLE",
				citation: "Insurance Act 1938, Section 45",
				finding: "Only 10 months of cover; moratorium not triggered."
			},
			{
				id: "R3",
				name: "Specific Illness Waiting Period",
				outcome: "SUPPORTS_INSURER",
				citation: "Policy Clause 4.2(b); IRDAI Master Circular 2024",
				finding: "10 months completed against a valid 24-month waiting period."
			},
			{
				id: "R4",
				name: "Initial 30-Day Waiting Period",
				outcome: "NOT_APPLICABLE",
				citation: "Policy Clause 4.3",
				finding: "Completed; not relied on by insurer."
			},
			{
				id: "R5",
				name: "Continuity & Portability Credit",
				outcome: "NEEDS_INFO",
				citation: "IRDAI Master Circular 2024, Portability provisions",
				finding: "No prior policy declared. Credit may apply if one existed."
			},
			{
				id: "R6",
				name: "Non-Disclosure Burden of Proof",
				outcome: "NOT_APPLICABLE",
				citation: "Insurance Act 1938, Section 45",
				finding: "No non-disclosure alleged."
			},
			{
				id: "R7",
				name: "Room Rent Proportionate Deduction",
				outcome: "NOT_APPLICABLE",
				citation: "IRDAI Master Circular 2024, Proportionate Deduction",
				finding: "Day-care procedure; no room-rent deduction."
			},
			{
				id: "R8",
				name: "Specific Reason for Repudiation",
				outcome: "SUPPORTS_INSURER",
				citation: "IRDAI (Protection of Policyholders' Interests) Regulations",
				finding: "Clause and waiting period clearly stated."
			},
			{
				id: "R9",
				name: "Grievance & Ombudsman Disclosure",
				outcome: "SUPPORTS_INSURER",
				citation: "Insurance Ombudsman Rules 2017, Rule 14",
				finding: "Grievance channel disclosed."
			},
			{
				id: "R10",
				name: "Waiting Period Within Regulatory Cap",
				outcome: "SUPPORTS_INSURER",
				citation: "IRDAI Master Circular 2024, Specific Waiting Periods",
				finding: "24 months is within the 36-month maximum."
			}
		],
		evidence: [
			{
				id: "E1",
				source: "POLICY",
				document_title: "ReAssure 2.0 — Policy Wording",
				section: "Clause 4.2(b) — Specified Disease/Procedure Waiting Period",
				page: 11,
				quote: "Expenses related to the treatment of the listed conditions, surgeries or treatments shall be excluded until the expiry of 24 months of continuous coverage after the date of inception of the first policy with us. (iv) Cataract",
				match_score: 1,
				relevance: "Cataract expressly listed with a 24-month wait."
			},
			{
				id: "E2",
				source: "POLICY",
				document_title: "ReAssure 2.0 — Policy Schedule",
				section: "Policy Period",
				page: 1,
				quote: "Policy Start Date: 01/12/2025   Previous Insurance Details: None",
				match_score: 1,
				relevance: "No prior continuous cover declared."
			},
			{
				id: "E3",
				source: "REJECTION_LETTER",
				document_title: "Claim Rejection Letter dated 28/10/2026",
				section: "Reason",
				page: 1,
				quote: "Cataract surgery is subject to a waiting period of 24 months as per Clause 4.2(b). As the policy has been in force for less than 24 months, the claim is not admissible.",
				match_score: 1,
				relevance: "Insurer's stated ground."
			}
		]
	}
};
var DEMO_CASE_LIST = [
	{
		id: "case_01",
		title: "PED waiting period already completed",
		category: "Pre-Existing Disease",
		facts: "49 months continuous cover vs 36-month IRDAI ceiling"
	},
	{
		id: "case_02",
		title: "60-month moratorium vs non-disclosure",
		category: "Section 45 Moratorium",
		facts: "64 months continuous cover; non-disclosure alleged"
	},
	{
		id: "case_03",
		title: "Specific illness waiting period",
		category: "Specific Waiting Period",
		facts: "10 months continuous cover vs 24-month cataract clause"
	}
];
var inr = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0,
	minimumFractionDigits: 0
});
/** Indian Rupees with lakh grouping, e.g. 120000 -> "₹1,20,000". */
function formatINR(amount) {
	return inr.format(Math.round(amount));
}
/** Null-safe INR formatting for live backend fields that may be absent. */
function formatOptionalINR(amount, fallback = "Not stated") {
	if (typeof amount !== "number" || !Number.isFinite(amount)) return fallback;
	return formatINR(amount);
}
/** Validates an ISO YYYY-MM-DD calendar date string. */
function isValidISODate(iso) {
	if (!iso || typeof iso !== "string") return false;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
	if (!m) return false;
	const [, yyyy, mm, dd] = m;
	const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
	return d.getUTCFullYear() === Number(yyyy) && d.getUTCMonth() === Number(mm) - 1 && d.getUTCDate() === Number(dd);
}
function parseISO(iso) {
	const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d));
}
/** ISO yyyy-mm-dd -> DD/MM/YYYY */
function formatDate(iso) {
	const d = parseISO(iso);
	return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}
/** Null-safe ISO date formatting so missing backend dates never render as 1900. */
function formatOptionalDate(iso, fallback = "Not stated") {
	return isValidISODate(iso) ? formatDate(iso) : fallback;
}
/** ISO -> "14 October 2026" for letters. */
function formatLongDate(iso) {
	return parseISO(iso).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
}
function addDays(iso, days) {
	const d = parseISO(iso);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}
function addYears(iso, years) {
	const d = parseISO(iso);
	d.setUTCFullYear(d.getUTCFullYear() + years);
	return d.toISOString().slice(0, 10);
}
/** Whole days from `fromIso` to `toIso` (negative if past). */
function daysBetween(fromIso, toIso) {
	return Math.round((parseISO(toIso).getTime() - parseISO(fromIso).getTime()) / 864e5);
}
function todayISO() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
/** Validates DD/MM/YYYY as a real calendar date and returns ISO, or null. */
function parseDDMMYYYY(value) {
	const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
	if (!m) return null;
	const [, dd, mm, yyyy] = m;
	const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
	if (d.getUTCFullYear() !== Number(yyyy) || d.getUTCMonth() !== Number(mm) - 1 || d.getUTCDate() !== Number(dd)) return null;
	return d.toISOString().slice(0, 10);
}
/** Auto-insert slashes while typing a DD/MM/YYYY date. */
function maskDate(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
function formatSize(b) {
	if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
	return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function validateUpload(file, accept) {
	if (!accept.includes(file.type)) return "Unsupported file type.";
	if (file.size > 10485760) return "File exceeds the 10 MB limit.";
	return null;
}
function UploadSlot({ index, label, required, hint, accept, file, onChange }) {
	const id = (0, import_react.useId)();
	const input = (0, import_react.useRef)(null);
	const [drag, setDrag] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const take = (f) => {
		if (!f) return;
		const err = validateUpload(f, accept);
		setError(err);
		if (!err) onChange(f);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: id,
					className: "text-[13px] font-medium text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-1.5 font-mono text-subtle-foreground",
						children: ["0", index]
					}), label]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-[10px] uppercase tracking-wider", required ? "text-foreground" : "text-subtle-foreground"),
					children: required ? "Required" : "Optional"
				})]
			}),
			file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface animate-rise flex min-h-[132px] flex-col justify-between rounded-md border-wrongful-border bg-wrongful-bg/60 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "animate-pop flex size-7 shrink-0 items-center justify-center rounded-full border border-wrongful-border bg-card",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-wrongful" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[13px] font-medium text-foreground",
								children: file.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-mono text-[11px] text-muted-foreground tabular",
								children: formatSize(file.size)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								onChange(void 0);
								if (input.current) input.current.value = "";
							},
							className: "press rounded p-1 text-muted-foreground hover:bg-card hover:text-foreground",
							"aria-label": `Remove ${label}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "animate-pop flex items-center gap-1.5 text-[11px] text-wrongful",
					style: { animationDelay: "110ms" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Ready for analysis"]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				id,
				onClick: () => input.current?.click(),
				onDragOver: (e) => {
					e.preventDefault();
					setDrag(true);
				},
				onDragLeave: () => setDrag(false),
				onDrop: (e) => {
					e.preventDefault();
					setDrag(false);
					take(e.dataTransfer.files?.[0]);
				},
				className: cn("flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-center transition-colors duration-200 ease-out", drag ? "border-foreground bg-secondary/70" : "border-border-strong bg-background hover:border-subtle-foreground hover:bg-secondary/60"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-5 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[13px] text-foreground",
						children: ["Drop file or ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "underline underline-offset-2",
							children: "browse"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] text-subtle-foreground",
						children: hint
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: input,
				type: "file",
				className: "sr-only",
				accept: accept.join(","),
				"aria-label": label,
				onChange: (e) => take(e.target.files?.[0])
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-[11px] text-destructive",
				children: error
			})
		]
	});
}
var PDF = ["application/pdf"];
var IMG = ["image/png", "image/jpeg"];
function DateField({ label, value, onChange }) {
	const invalid = value.length === 10 && !parseDDMMYYYY(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[12px] font-medium text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				inputMode: "numeric",
				placeholder: "DD/MM/YYYY",
				value,
				onChange: (e) => onChange(maskDate(e.target.value)),
				className: cn("mt-1.5 h-9 w-full rounded-md border bg-card px-3 font-mono text-[13px] tabular outline-none transition-colors placeholder:text-subtle-foreground focus:border-foreground", invalid ? "border-destructive" : "border-input")
			}),
			invalid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-[11px] text-destructive",
				children: "Not a valid date"
			})
		]
	});
}
function Intake({ onDemo, onAnalyze }) {
	const uploadSection = (0, import_react.useRef)(null);
	const openUpload = () => {
		const section = uploadSection.current;
		if (!section) return;
		const stickyHeight = document.querySelector("header")?.parentElement?.getBoundingClientRect().height ?? 0;
		window.scrollTo({
			top: window.scrollY + section.getBoundingClientRect().top - stickyHeight - 16,
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
		});
		section.querySelector("button[id]")?.focus({ preventScroll: true });
	};
	const { online } = useBackendStatus();
	const [files, setFiles] = (0, import_react.useState)({});
	const [facts, setFacts] = (0, import_react.useState)({
		first_inception_date: "",
		admission_date: ""
	});
	const [factsOpen, setFactsOpen] = (0, import_react.useState)(false);
	const [consent, setConsent] = (0, import_react.useState)(false);
	const setFile = (k) => (f) => setFiles((prev) => ({
		...prev,
		[k]: f
	}));
	const missing = [!files.POLICY && "policy document", !files.REJECTION_LETTER && "rejection letter"].filter(Boolean).join(" and ");
	const datesInvalid = [facts.first_inception_date, facts.admission_date].some((v) => v && !parseDDMMYYYY(v));
	const canSubmit = consent && !missing && !datesInvalid;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-paper",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl animate-rise",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Claim repudiation analysis · India"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 text-[34px] font-semibold leading-[1.1] text-foreground sm:text-[46px]",
							children: "Challenge Unfair Health Insurance Claim Rejections in India."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]",
							children: "Deterministic clause-by-clause analysis under IRDAI regulations. Every legal quote verified against your original policy text."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								onClick: openUpload,
								className: "group shadow-card",
								children: ["Check My Claim ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "transition-transform duration-200 group-hover:translate-x-1" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								variant: "outline",
								onClick: () => onDemo("case_01"),
								className: "bg-card",
								children: ["View Sample Report ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSearch, {})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-8 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border text-[12px]",
							children: [
								{
									icon: ScrollText,
									k: "10",
									v: "Statutory rule checks"
								},
								{
									icon: FileSearch,
									k: "100%",
									v: "Verbatim quote verification"
								},
								{
									icon: Timer,
									k: "< 2 min",
									v: "Typical analysis time"
								}
							].map(({ icon: Icon, k, v }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-card px-4 py-3 transition-colors duration-200 ease-out hover:bg-secondary/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-subtle-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "mt-2 font-mono text-[15px] font-medium text-foreground tabular",
										children: k
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "text-muted-foreground",
										children: v
									})
								]
							}, v))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				"aria-label": "Claim review workflow",
				className: "relative mx-auto mb-8 grid max-w-6xl grid-cols-3 px-4 sm:px-6",
				children: [
					"Upload Policy",
					"Statutory Rule Audit",
					"Verbatim Appeal"
				].map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative flex min-w-0 items-center gap-2 border-y border-border py-4 pr-2 sm:gap-3 sm:pr-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[12px] font-medium text-wrongful tabular",
							children: ["0", i + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium leading-snug text-foreground sm:text-[13px]",
							children: step
						}),
						i < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 hidden h-px flex-1 bg-border-strong sm:block",
							"aria-hidden": true
						})
					]
				}, step))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "demo-cases",
				className: "relative mx-auto max-w-6xl scroll-mt-32 px-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex items-end justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[15px] font-semibold text-foreground",
						children: "Try a Demo Case"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] text-muted-foreground",
						children: "Run the full pipeline on a realistic case — no upload needed."
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-3",
					children: DEMO_CASE_LIST.map((c, i) => {
						const data = DEMO_CASES[c.id];
						const v = VERDICT_META[data.verdict];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							type: "button",
							onClick: () => onDemo(c.id),
							style: { animationDelay: `${80 + i * 60}ms` },
							className: cn("group surface lift demo-lift flex h-auto animate-rise flex-col items-stretch justify-between gap-0 overflow-hidden whitespace-normal border-t-[3px] bg-card p-0 text-left hover:bg-card", v.accentClassName),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-[11px] text-subtle-foreground",
											children: c.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", v.className),
											children: v.label
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
										children: c.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-1 text-[15px] font-semibold leading-snug text-foreground",
										children: c.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[13px] leading-relaxed text-muted-foreground",
										children: c.facts
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end justify-between gap-3 border-t border-border bg-card-footer px-5 py-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[17px] font-medium text-foreground tabular",
									children: formatOptionalINR(data.claim_amount)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: data.treatment
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-subtle-foreground transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:text-foreground" })]
							})]
						}, c.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				ref: uploadSection,
				id: "new-case",
				className: "relative mx-auto mt-10 max-w-6xl scroll-mt-36 px-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-5 rounded-md border border-primary bg-primary px-6 py-6 text-primary-foreground shadow-raised",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[20px] font-semibold",
							children: "Start a new case"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-primary-foreground/80",
							children: "Upload your policy and the insurer's rejection letter."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-3 inline-flex items-center gap-1.5 text-[11px] text-primary-foreground/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), " Documents purged after processing"]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "action",
						size: "lg",
						onClick: openUpload,
						className: "group h-auto min-h-10 max-w-full whitespace-normal px-4 py-3 text-left sm:px-6",
						children: ["Upload Policy & Rejection Letter ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "transition-transform duration-200 group-hover:translate-x-1" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 animate-rise overflow-hidden rounded-md border border-border bg-card shadow-card",
					style: { animationDelay: "180ms" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-5 px-6 py-6 md:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadSlot, {
									index: 1,
									label: "Policy Document",
									required: true,
									hint: "PDF · max 10 MB",
									accept: PDF,
									file: files.POLICY,
									onChange: setFile("POLICY")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadSlot, {
									index: 2,
									label: "Rejection Letter",
									required: true,
									hint: "PDF / PNG / JPG · max 10 MB",
									accept: [...PDF, ...IMG],
									file: files.REJECTION_LETTER,
									onChange: setFile("REJECTION_LETTER")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadSlot, {
									index: 3,
									label: "Hospital Discharge Summary",
									required: false,
									hint: "PDF / Image · max 10 MB",
									accept: [...PDF, ...IMG],
									file: files.DISCHARGE,
									onChange: setFile("DISCHARGE")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setFactsOpen((o) => !o),
								"aria-expanded": factsOpen,
								className: "flex w-full items-center justify-between px-6 py-3.5 text-left transition-colors duration-200 ease-out hover:bg-secondary/50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[13px] text-foreground",
									children: ["Optional manual fields", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-muted-foreground",
										children: "— use if dates are unclear in your documents"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 text-muted-foreground transition-transform", factsOpen && "rotate-180") })]
							}), factsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 px-6 pb-5 sm:grid-cols-2 md:max-w-xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateField, {
									label: "First Inception Date",
									value: facts.first_inception_date ?? "",
									onChange: (v) => setFacts((f) => ({
										...f,
										first_inception_date: v
									}))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateField, {
									label: "Hospital Admission Date",
									value: facts.admission_date ?? "",
									onChange: (v) => setFacts((f) => ({
										...f,
										admission_date: v
									}))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-5 border-t border-border bg-background px-6 py-5 md:flex-row md:items-center md:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex max-w-2xl cursor-pointer items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: consent,
									onCheckedChange: (v) => setConsent(v === true),
									className: "mt-0.5",
									"aria-label": "Consent to document processing"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12.5px] leading-relaxed text-muted-foreground",
									children: "I consent to processing these documents for automated clause analysis. I understand this is an assistive tool, not legal representation, and raw documents are purged after processing."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 flex-col items-stretch gap-1.5 md:items-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									disabled: !canSubmit,
									onClick: () => onAnalyze(files, facts, online),
									children: ["Analyze My Claim ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-subtle-foreground",
									children: !consent ? "Consent is required to continue" : missing ? `Add your ${missing}` : datesInvalid ? "Fix the manual dates" : online ? "Will run on the live analysis service" : "Backend offline — a sample analysis will be shown"
								})]
							})]
						})
					]
				})]
			})
		]
	});
}
function ProcessingTracker({ stages, error, onRetry, onCancel, label }) {
	const done = stages.filter((s) => s === "done").length;
	const pct = Math.round(done / stages.length * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto max-w-2xl px-4 py-16 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface animate-rise overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border px-6 py-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-baseline justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-[20px] font-semibold text-foreground",
								children: error ? "Analysis paused" : pct === 100 ? "Analysis complete" : "Analysing your claim"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-[13px] text-muted-foreground tabular",
								children: [pct, "%"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 h-1 overflow-hidden rounded-full bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-full rounded-full transition-all duration-500 ease-out", error ? "bg-destructive" : "bg-primary"),
								style: { width: `${Math.max(pct, 4)}%` }
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "px-6 py-3",
					children: PIPELINE_STAGES.map((s, i) => {
						const st = stages[i];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: cn("relative flex gap-4 border-l-2 py-3 transition-colors duration-300 ease-out", st === "running" ? "border-l-foreground" : "border-l-transparent"),
							children: [
								i < PIPELINE_STAGES.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute left-[13px] top-[38px] h-[calc(100%-26px)] w-px overflow-hidden bg-border",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block h-full w-full origin-top bg-wrongful-border transition-transform duration-500 ease-out", st === "done" ? "scale-y-100" : "scale-y-0") })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("relative flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] transition-colors duration-300 ease-out", st === "pending" && "border-border bg-card text-subtle-foreground", st === "running" && "border-foreground bg-card text-foreground", st === "done" && "border-wrongful-border bg-wrongful-bg text-wrongful", st === "failed" && "border-destructive-border bg-destructive-bg text-destructive"),
									children: [
										st === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "animate-pulse-ring absolute inset-0 rounded-full border border-foreground",
											"aria-hidden": true
										}),
										st === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }),
										st === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }),
										st === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }),
										st === "pending" && i + 1
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1 pt-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: cn("text-[14px] font-medium", st === "pending" ? "text-subtle-foreground" : "text-foreground"),
												children: s.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider", st === "done" && "text-wrongful", st === "running" && "text-foreground", st === "failed" && "text-destructive", st === "pending" && "text-subtle-foreground"),
												children: [st === "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "size-1.5 animate-status rounded-full bg-wrongful-accent",
													"aria-hidden": true
												}), st === "running" ? "Running" : st === "done" ? "Done" : st === "failed" ? "Failed" : "Queued"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-[12.5px] text-muted-foreground",
											children: s.detail
										}),
										st === "failed" && error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 rounded-md border border-destructive-border bg-destructive-bg p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[12.5px] text-destructive",
												children: error.message
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													onClick: onRetry,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), " Retry Stage"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "outline",
													onClick: onCancel,
													children: "Back to start"
												})]
											})]
										})
									]
								})
							]
						}, s.title);
					})
				}),
				!error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-t border-border bg-background px-6 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-subtle-foreground",
						children: "Deterministic rules · no generative verdicts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCancel,
						className: "text-[12px] text-muted-foreground hover:text-foreground",
						children: "Cancel"
					})]
				})
			]
		})
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function computeDeadlines(repudiationIso) {
	return {
		repudiation: repudiationIso,
		grievanceResponseDue: addDays(repudiationIso, 30),
		ombudsmanLastDate: addYears(repudiationIso, 1)
	};
}
function presentOrPlaceholder(value, placeholder) {
	const cleaned = value?.trim();
	if (!cleaned || cleaned === "Not stated" || cleaned === "Not specified") return placeholder;
	return cleaned;
}
function buildAppealLetter(r, dateIso = todayISO()) {
	const repudiationDateIso = isValidISODate(r.repudiation_date) ? r.repudiation_date : null;
	const d = repudiationDateIso ? computeDeadlines(repudiationDateIso) : null;
	const contradicted = r.rules.filter((x) => x.outcome === "CONTRADICTS_INSURER");
	const policyholder = presentOrPlaceholder(r.policyholder, "[[policyholder name]]");
	const insurer = presentOrPlaceholder(r.insurer, "[[insurer name]]");
	const grievanceEmail = presentOrPlaceholder(r.insurer_grievance_email, "[[insurer grievance email]]");
	const claimNumber = presentOrPlaceholder(r.claim_number, "[[claim number]]");
	const policyNumber = presentOrPlaceholder(r.policy_number, "[[policy number]]");
	const productName = presentOrPlaceholder(r.product_name, "health insurance policy");
	const firstInception = isValidISODate(r.first_inception_date) ? formatDate(r.first_inception_date) : "[[first inception date]]";
	const repudiationDate = repudiationDateIso ? formatDate(repudiationDateIso) : "[[repudiation date]]";
	const admissionDate = isValidISODate(r.admission_date) ? formatDate(r.admission_date) : "[[admission date]]";
	const claimAmount = r.claim_amount != null ? formatINR(r.claim_amount) : "[[claim amount]]";
	const disallowedAmount = r.disallowed_amount != null ? formatINR(r.disallowed_amount) : "[[disallowed amount]]";
	const treatment = r.treatment && r.treatment !== "Not stated" ? r.treatment.toLowerCase() : "medical treatment";
	const hospital = presentOrPlaceholder(r.hospital, "[[hospital name]]");
	const citedClause = presentOrPlaceholder(r.cited_clause, "[[cited policy clause]]");
	return [
		{
			kind: "line",
			text: policyholder,
			bold: true
		},
		{
			kind: "line",
			text: `Date: ${formatLongDate(dateIso)}`
		},
		{ kind: "spacer" },
		{
			kind: "line",
			text: "To,"
		},
		{
			kind: "line",
			text: "The Grievance Redressal Officer"
		},
		{
			kind: "line",
			text: insurer
		},
		{
			kind: "line",
			text: `Email: ${grievanceEmail}`
		},
		{ kind: "spacer" },
		{
			kind: "line",
			bold: true,
			text: `Subject: Grievance against repudiation of Claim No. ${claimNumber} under Policy No. ${policyNumber}`
		},
		{ kind: "spacer" },
		{
			kind: "para",
			text: "Dear Sir/Madam,"
		},
		{
			kind: "para",
			text: `I am the policyholder under ${productName}, Policy No. ${policyNumber}, first incepted on ${firstInception} and renewed without any break in coverage. I write to formally contest your letter dated ${repudiationDate} repudiating my claim of ${claimAmount} for ${treatment} at ${hospital}, admitted on ${admissionDate}.`
		},
		{
			kind: "para",
			text: `The repudiation relies on ${citedClause}, stating: "${r.rejection_reason}" I respectfully submit that this ground is not sustainable for the following reasons:`
		},
		{
			kind: "list",
			items: r.appeal_grounds
		},
		...contradicted.length ? [{
			kind: "heading",
			text: "Statutory provisions relied upon"
		}, {
			kind: "list",
			items: contradicted.map((x) => `${x.citation} — ${x.finding}`)
		}] : [],
		{
			kind: "para",
			text: `I therefore request you to review the repudiation, admit the claim and settle the disallowed amount of ${disallowedAmount} in accordance with the policy terms and the IRDAI Master Circular on Health Insurance Business, 2024.`
		},
		{
			kind: "para",
			text: `Please note that if this grievance is not resolved satisfactorily within 30 days${d ? ` (by ${formatDate(d.grievanceResponseDue)})` : ""}, I reserve the right to approach the Insurance Ombudsman under the Insurance Ombudsman Rules, 2017, and to pursue any other remedy available in law.`
		},
		{
			kind: "para",
			text: "Copies of the policy schedule, repudiation letter and discharge summary are enclosed for reference."
		},
		{ kind: "spacer" },
		{
			kind: "line",
			text: "Yours faithfully,"
		},
		{ kind: "spacer" },
		{
			kind: "line",
			text: policyholder,
			bold: true
		},
		{
			kind: "line",
			text: `Policy No. ${policyNumber}`
		}
	];
}
function letterToPlainText(blocks) {
	return blocks.map((b) => {
		if (b.kind === "spacer") return "";
		if (b.kind === "list") return (b.items ?? []).map((t, i) => `${i + 1}. ${t}`).join("\n");
		if (b.kind === "heading") return `\n${b.text}`;
		return b.text ?? "";
	}).join("\n").replace(/\n{3,}/g, "\n\n");
}
function download(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function downloadLetterPdf(blocks, filename) {
	const { jsPDF } = await import("../_libs/jspdf.mjs").then((n) => n.t);
	const doc = new jsPDF({
		unit: "pt",
		format: "a4"
	});
	const margin = 64;
	const width = doc.internal.pageSize.getWidth() - 128;
	const pageH = doc.internal.pageSize.getHeight();
	let y = margin;
	const lh = 15;
	const ensure = (h) => {
		if (y + h > pageH - margin) {
			doc.addPage();
			y = margin;
		}
	};
	const write = (text, bold = false, indent = 0) => {
		doc.setFont("helvetica", bold ? "bold" : "normal");
		doc.setFontSize(10.5);
		const safe = text.replace(/₹/g, "Rs. ");
		const lines = doc.splitTextToSize(safe, width - indent);
		for (const l of lines) {
			ensure(lh);
			doc.text(l, margin + indent, y);
			y += lh;
		}
	};
	for (const b of blocks) if (b.kind === "spacer") y += lh * .6;
	else if (b.kind === "line") write(b.text ?? "", b.bold);
	else if (b.kind === "heading") {
		y += 4;
		write(b.text ?? "", true);
	} else if (b.kind === "para") {
		write(b.text ?? "");
		y += 6;
	} else if (b.kind === "list") {
		(b.items ?? []).forEach((t, i) => {
			write(`${i + 1}.  ${t}`, false, 12);
			y += 3;
		});
		y += 4;
	}
	doc.setFontSize(7.5);
	doc.setTextColor(120);
	doc.text("Prepared with ClauseIQ — an assistive tool. Not legal advice. Verify all cited clauses before submission.", margin, pageH - 32);
	download(doc.output("blob"), filename);
}
async function downloadLetterDocx(blocks, filename) {
	const { Document, Packer, Paragraph, TextRun } = await import("../_libs/docx.mjs").then((n) => n.t);
	const doc = new Document({ sections: [{ children: blocks.flatMap((b) => {
		if (b.kind === "spacer") return [new Paragraph({ text: "" })];
		if (b.kind === "list") return (b.items ?? []).map((t, i) => new Paragraph({
			indent: {
				left: 360,
				hanging: 360
			},
			spacing: { after: 80 },
			children: [new TextRun({
				text: `${i + 1}.\t${t}`,
				size: 22,
				font: "Calibri"
			})]
		}));
		return [new Paragraph({
			spacing: {
				after: b.kind === "para" ? 160 : 0,
				before: b.kind === "heading" ? 120 : 0
			},
			children: [new TextRun({
				text: b.text ?? "",
				bold: b.bold || b.kind === "heading",
				size: 22,
				font: "Calibri"
			})]
		})];
	}) }] });
	download(await Packer.toBlob(doc), filename);
}
var LETTER_LEGAL_FOOTER = "Drafted with ClauseIQ, an assistive tool. This is not legal advice. Please review before sending.";
function factsFromResult(r) {
	return {
		policy_first_inception_date: r.first_inception_date ?? "",
		admission_date: r.admission_date ?? "",
		continuous_coverage_months: r.continuous_cover_months ?? 0,
		grievance_sent_date: r.grievance_sent_date ?? "",
		grievance_received_date: r.grievance_received_date ?? "",
		grievance_reply_status: r.grievance_reply_status ?? "UNKNOWN",
		claim_amount: r.claim_amount ?? 0
	};
}
/** Offline edits cannot verify source documents: invalidate conclusions rather than invent a legal verdict. */
function recalculateDemo(r, facts) {
	return {
		...r,
		first_inception_date: facts.policy_first_inception_date,
		admission_date: facts.admission_date,
		continuous_cover_months: facts.continuous_coverage_months,
		grievance_sent_date: facts.grievance_sent_date,
		grievance_received_date: facts.grievance_received_date,
		grievance_reply_status: facts.grievance_reply_status,
		claim_amount: facts.claim_amount,
		disallowed_amount: Math.max(0, facts.claim_amount - (r.settled_amount ?? 0)),
		verdict: "INSUFFICIENT_INFO",
		confidence: 0,
		needs_human_review: true,
		summary: "Offline recalculation: corrected facts and financial totals are shown below. The previous legal conclusion has been withdrawn until the documents can be re-analysed or reviewed by a qualified professional.",
		appeal_grounds: ["[[reviewed_appeal_grounds]]"],
		rules: r.rules.map((rule) => ({
			...rule,
			outcome: "NEEDS_INFO",
			finding: "Corrected facts require fresh document verification; previous finding withdrawn.",
			inputs: {
				...rule.inputs,
				...facts
			}
		}))
	};
}
function deadlineStatus(date, today, actionRequired = false) {
	if (!isValidISODate(date) || !isValidISODate(today)) return "action_needed";
	const remaining = daysBetween(today, date);
	if (remaining < 0) return actionRequired ? "action_needed" : "passed";
	return remaining <= 7 ? "due soon" : "upcoming";
}
function timelineMilestones(r, today) {
	const repDate = isValidISODate(r.repudiation_date) ? r.repudiation_date : null;
	const received = isValidISODate(r.grievance_received_date) ? r.grievance_received_date : null;
	const awaiting = r.grievance_reply_status !== "REPLY_RECEIVED";
	const tat14Date = received ? addDays(received, 14) : null;
	const wait30Date = received ? addDays(received, 30) : null;
	const ombudsmanDate = repDate ? addYears(repDate, 1) : null;
	return [
		{
			label: "Today's Date",
			date: today,
			status: "action_needed",
			detail: "Review your next action."
		},
		{
			label: "Repudiated Date",
			date: repDate,
			status: deadlineStatus(repDate, today),
			detail: repDate ? "Date on the rejection letter." : "Repudiation date was not extracted from the rejection letter."
		},
		{
			label: "14-day IRDAI Grievance TAT",
			date: tat14Date,
			status: deadlineStatus(tat14Date, today, awaiting),
			detail: tat14Date ? "14 days from grievance receipt." : "Grievance receipt date is needed."
		},
		{
			label: "30-day Rule 14 Ombudsman Wait Window",
			date: wait30Date,
			status: deadlineStatus(wait30Date, today),
			detail: r.grievance_reply_status === "REPLY_RECEIVED" ? "Reply received: the no-response wait is not required; review eligibility." : "30 days from receipt for the no-response route; other eligibility conditions apply."
		},
		{
			label: "1-Year Insurance Ombudsman Filing Limit",
			date: ombudsmanDate,
			status: deadlineStatus(ombudsmanDate, today, true),
			detail: ombudsmanDate ? "Indicative date based on repudiation. A later grievance rejection or no-response trigger may change the legal filing limit; verify before relying on it." : "Repudiation date is needed to estimate the 1-year filing limit."
		}
	];
}
function presentOrToken(value, token) {
	const cleaned = value?.trim();
	if (!cleaned || cleaned === "Not stated" || cleaned === "Not specified") return token;
	return cleaned;
}
function previewLetter(r) {
	return [
		...buildAppealLetter({
			...r,
			policyholder: presentOrToken(r.policyholder, "[[policyholder_name]]"),
			policy_number: presentOrToken(r.policy_number, "[[policy_number]]"),
			claim_number: presentOrToken(r.claim_number, "[[claim_number]]"),
			hospital: presentOrToken(r.hospital, "[[hospital]]")
		}).map((b) => {
			if (b.text?.startsWith("Please note that")) return {
				...b,
				text: "If this grievance remains unresolved, I reserve the right to approach the Insurance Ombudsman, subject to the applicable waiting period and filing limit, and pursue other remedies available in law."
			};
			if (r.needs_human_review && b.text?.startsWith("The repudiation relies")) return {
				...b,
				text: `The repudiation relies on ${r.cited_clause}, stating: "${r.rejection_reason}" I request a review of the following corrected facts and grounds, subject to verification:`
			};
			return b;
		}),
		{
			kind: "line",
			text: "Address: [[postal_address]]"
		},
		{
			kind: "line",
			text: "Contact: [[contact_number]]"
		},
		{ kind: "spacer" },
		{
			kind: "para",
			text: LETTER_LEGAL_FOOTER
		}
	];
}
function letterBlocksFromText(text) {
	return text.split(/\r?\n/).map((line) => line.trim() === "" ? { kind: "spacer" } : {
		kind: "line",
		text: line
	});
}
function placeholderKeys(blocks) {
	return [...new Set(blocks.flatMap((b) => [b.text ?? "", ...b.items ?? []]).flatMap((t) => [...t.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1] ?? "")).filter(Boolean))];
}
function fillLetter(blocks, values) {
	const fill = (text) => text.replace(/\[\[([^\]]+)\]\]/g, (token, key) => values[key]?.trim() || token);
	return blocks.map((b) => ({
		...b,
		...b.text !== void 0 ? { text: fill(b.text) } : {},
		...b.items ? { items: b.items.map(fill) } : {}
	}));
}
var statusClasses = {
	upcoming: "border-info-border bg-info-bg text-info",
	"due soon": "border-contestable-border bg-contestable-bg text-contestable",
	passed: "border-border bg-secondary text-muted-foreground",
	action_needed: "border-contestable-border bg-contestable-bg text-contestable"
};
function DeadlinesTimeline({ result }) {
	const markers = timelineMilestones(result, todayISO());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
		className: "mb-4 flex items-center gap-2 text-sm font-medium",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-4 text-muted-foreground" }), "Appeal timeline"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-0",
		children: markers.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "relative grid grid-cols-[20px_1fr] gap-3 pb-5 last:pb-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative z-10 mt-1 size-3 rounded-full border-2 border-card bg-primary" }), i < markers.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-4 bottom-[-4px] w-px bg-border" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: m.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded border px-2 py-0.5 font-mono text-[10px]", statusClasses[m.status]),
							children: m.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-foreground",
						children: m.date ? isValidISODate(m.date) ? formatDate(m.date) : m.date : "Date needed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted-foreground",
						children: m.detail
					})
				]
			})]
		}, m.label))
	})] });
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var fields = [
	{
		key: "policy_first_inception_date",
		label: "Policy first inception date",
		type: "date"
	},
	{
		key: "admission_date",
		label: "Admission date",
		type: "date"
	},
	{
		key: "continuous_coverage_months",
		label: "Continuous coverage (months)",
		type: "number"
	},
	{
		key: "grievance_sent_date",
		label: "Grievance sent date",
		type: "date"
	},
	{
		key: "grievance_received_date",
		label: "Grievance received date",
		type: "date"
	},
	{
		key: "grievance_reply_status",
		label: "Grievance reply status",
		type: "status"
	},
	{
		key: "claim_amount",
		label: "Claim amount (₹)",
		type: "number"
	}
];
var statuses = [
	"UNKNOWN",
	"AWAITING_REPLY",
	"REPLY_RECEIVED",
	"CONFIRMED_NO_RESPONSE"
];
function FactsEditorModal({ result, open, onOpenChange, onReRun }) {
	const [facts, setFacts] = (0, import_react.useState)(() => factsFromResult(result));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const submit = async (event) => {
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
		if (facts.admission_date && facts.policy_first_inception_date && facts.admission_date < facts.policy_first_inception_date) {
			setError("Admission cannot be before first policy inception.");
			return;
		}
		if (facts.grievance_received_date && facts.grievance_sent_date && facts.grievance_received_date < facts.grievance_sent_date) {
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
				claim_amount: claimAmount
			});
			onOpenChange(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (!busy) onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[80dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit Key Facts" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Corrected facts are user-provided; document citations remain unchanged until verified." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border",
						children: fields.map(({ key, label, type }) => {
							const source = result.field_sources?.[key];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2 py-3 sm:grid-cols-[1fr_1fr] sm:items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: `fact-${key}`,
									className: "text-sm font-medium",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										title: source?.document_title,
										className: "inline-block rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground",
										children: source ? `Page ${source.page} · ${source.document_title}` : "Source page unavailable"
									})
								})] }), type === "status" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: facts.grievance_reply_status,
									disabled: busy,
									onValueChange: (value) => {
										if (statuses.includes(value)) setFacts((f) => ({
											...f,
											grievance_reply_status: value
										}));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: `fact-${key}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: statuses.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s)) })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: `fact-${key}`,
									type,
									value: facts[key],
									disabled: busy,
									required: !key.startsWith("grievance_"),
									...type === "number" ? {
										min: 0,
										step: 1
									} : {},
									onChange: (e) => setFacts((f) => ({
										...f,
										[key]: type === "number" ? e.target.value === "" ? "" : Number(e.target.value) : e.target.value
									}))
								})]
							}, key);
						})
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							disabled: busy,
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: busy,
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), busy ? "Re-running…" : "Re-run Analysis"]
						})]
					})
				]
			})]
		})
	});
}
var DEFAULT_ENCLOSURES = [
	"Policy schedule and wording",
	"Rejection / repudiation letter",
	"Discharge summary",
	"Bills and payment receipts"
];
function LetterPreviewModal({ result, open, onOpenChange, initialVersion = 1, backendCaseId = null, isSample = true }) {
	const [backendText, setBackendText] = (0, import_react.useState)(null);
	const [backendEnclosures, setBackendEnclosures] = (0, import_react.useState)(null);
	const [values, setValues] = (0, import_react.useState)({});
	const [version, setVersion] = (0, import_react.useState)(initialVersion);
	const [checked, setChecked] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open || isSample || !backendCaseId) {
			setBackendText(null);
			setBackendEnclosures(null);
			return;
		}
		let cancelled = false;
		getCaseLetter(backendCaseId).then((resp) => {
			if (cancelled || !resp) return;
			const text = resp.text ?? resp.content ?? null;
			if (text) setBackendText(text);
			if (typeof resp.version === "number" && resp.version >= 1) setVersion(resp.version);
			if (resp.enclosures && resp.enclosures.length > 0) setBackendEnclosures(resp.enclosures);
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [
		open,
		isSample,
		backendCaseId
	]);
	const blocks = (0, import_react.useMemo)(() => backendText ? letterBlocksFromText(backendText) : previewLetter(result), [backendText, result]);
	const enclosures = backendEnclosures ?? DEFAULT_ENCLOSURES;
	const ready = (0, import_react.useMemo)(() => fillLetter(blocks, values), [blocks, values]);
	const missing = (0, import_react.useMemo)(() => placeholderKeys(ready), [ready]);
	const hasInlineOverrides = (0, import_react.useMemo)(() => Object.values(values).some((v) => v.trim().length > 0), [values]);
	const inline = (text) => text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
		const key = /^\[\[([^\]]+)\]\]$/.exec(part)?.[1];
		if (!key) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, index);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mx-1 inline-flex max-w-full flex-col align-middle",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-t border border-contestable-border bg-contestable-bg px-2 py-0.5 font-sans text-[11px] text-contestable",
				children: part
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"aria-label": `Fill ${key}`,
				className: "h-8 w-56 max-w-full rounded-t-none border-contestable-border font-sans",
				value: values[key] ?? "",
				onChange: (e) => {
					const nextVal = e.target.value;
					setValues((v) => ({
						...v,
						[key]: nextVal
					}));
					setVersion((v) => v === initialVersion ? initialVersion + 1 : v);
				}
			})]
		}, index);
	});
	const claimSlug = (result.claim_number && result.claim_number !== "Not stated" ? result.claim_number : result.case_id).replace(/[^A-Za-z0-9]+/g, "-");
	const insurerLabel = result.insurer && result.insurer !== "Not stated" ? result.insurer : "the insurer";
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(letterToPlainText(ready));
			toast.success("Letter copied to clipboard");
		} catch {
			toast.error("Could not access the clipboard");
		}
	};
	const download = async (kind) => {
		setBusy(kind);
		const filename = `ClauseIQ_Appeal_${claimSlug}_v${version}.${kind}`;
		try {
			let downloadedRemotely = false;
			if (backendCaseId && !isSample && !hasInlineOverrides) downloadedRemotely = await downloadBackendLetter(backendCaseId, kind, filename);
			if (!downloadedRemotely) if (kind === "pdf") await downloadLetterPdf(ready, filename);
			else await downloadLetterDocx(ready, filename);
		} catch {
			toast.error("Download failed. Please try again.");
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[80dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto bg-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex flex-wrap items-center gap-3 pr-5",
					children: [
						"Appeal Letter",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded border border-border bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground",
							children: ["v", version]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Addressed to the Grievance Redressal Officer of ",
					insurerLabel,
					". Review before sending."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-y border-border py-4 font-serif text-sm leading-relaxed",
					children: blocks.map((b, i) => {
						if (b.kind === "spacer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3" }, i);
						if (b.kind === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mb-4 ml-5 list-decimal space-y-2",
							children: b.items?.map((t, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: inline(t) }, j))
						}, i);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("break-words", b.bold && "font-semibold", b.kind === "para" && "mb-4", b.kind === "heading" && "mt-3 font-sans text-xs font-semibold uppercase text-muted-foreground"),
							children: inline(b.text ?? "")
						}, i);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Enclosure Checklist",
					className: "rounded-md border border-border bg-background p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 text-sm font-medium",
						children: "Enclosure Checklist"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: enclosures.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: `enclosure-${i}`,
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: `enclosure-${i}`,
								checked: checked.includes(item),
								onCheckedChange: (next) => setChecked((c) => next ? [...c, item] : c.filter((t) => t !== item))
							}), item]
						}, item))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-muted-foreground",
					children: LETTER_LEGAL_FOOTER
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "text-xs text-contestable",
						children: missing.length ? `${missing.length} placeholder fields remaining — fill above or download with [[...]] placeholders` : "All placeholder fields filled"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: copy,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy Text"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => download("docx"),
								disabled: busy !== null,
								children: [busy === "docx" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), "Download Word (.docx)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => download("pdf"),
								disabled: busy !== null,
								children: [busy === "pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, {}), "Download PDF (.pdf)"]
							})
						]
					})]
				})
			]
		})
	});
}
var SOURCE_LABEL = {
	POLICY: "Policy document",
	REJECTION_LETTER: "Rejection letter",
	DISCHARGE: "Discharge summary",
	DISCHARGE_SUMMARY: "Discharge summary",
	OTHER: "Supporting document",
	REGULATION: "Statute / Regulation"
};
function Field({ k, v, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "eyebrow",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("mt-1 truncate text-[13.5px] text-foreground", mono && "font-mono tabular"),
			children: v
		})]
	});
}
function RulesTab({ r }) {
	const counts = r.rules.reduce((a, x) => (a[x.outcome] = (a[x.outcome] ?? 0) + 1, a), {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2 border-b border-border px-5 py-3",
		children: Object.keys(OUTCOME_META).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: cn("rounded border px-2 py-0.5 font-mono text-[10.5px] tabular", OUTCOME_META[k].className),
			children: [
				OUTCOME_META[k].label,
				" · ",
				counts[k] ?? 0
			]
		}, k))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[760px] text-left text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-border bg-background text-[11px] uppercase tracking-wider text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-2.5 font-medium",
						children: "Rule"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2.5 font-medium",
						children: "Check"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2.5 font-medium",
						children: "Outcome"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-2.5 font-medium",
						children: "Statutory citation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-5 py-2.5 font-medium",
						children: "Finding"
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: r.rules.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				colSpan: 5,
				className: "px-5 py-6 text-center text-[13px] text-muted-foreground",
				children: "No deterministic rule checks were returned for this case."
			}) }) : r.rules.map((x) => {
				const inputEntries = x.inputs ? Object.entries(x.inputs) : [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border align-top transition-colors duration-150 ease-out last:border-0 hover:bg-background",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-3 font-mono text-[12px] text-muted-foreground",
							children: x.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 font-medium text-foreground",
							children: x.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", OUTCOME_META[x.outcome].className),
								children: OUTCOME_META[x.outcome].label
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 text-muted-foreground",
							children: x.citation
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-5 py-3 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: x.finding }), inputEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-2 space-y-1 text-xs",
								children: inputEntries.map(([key, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-x-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "font-medium text-foreground/80",
										children: key.replace(/_/g, " ")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "break-all font-mono",
										children: value == null ? "Not provided" : typeof value === "object" ? JSON.stringify(value) : String(value)
									})]
								}, key))
							})]
						})
					]
				}, x.id);
			}) })]
		})
	})] });
}
function EvidenceTab({ r }) {
	if (r.evidence.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-8 text-center text-[13px] text-muted-foreground",
		children: "No verified document quotes were available for this case."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 p-5 md:grid-cols-2",
		children: r.evidence.map((e) => {
			const unverified = e.verified === false;
			const exact = !unverified && e.match_score >= 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: cn("flex flex-col rounded-md border border-border border-l-2 bg-card transition-colors duration-200 ease-out hover:bg-secondary/40", exact ? "border-l-wrongful" : "border-l-contestable"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-start justify-between gap-3 border-b border-border px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: SOURCE_LABEL[e.source] ?? "Supporting document"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 truncate text-[13px] font-medium text-foreground",
									children: e.document_title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[12px] text-muted-foreground",
									children: [
										e.section,
										" · Page ",
										e.page
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]", exact ? "border-wrongful-border bg-wrongful-bg text-wrongful" : "border-contestable-border bg-contestable-bg text-contestable"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3" }), unverified ? "Unverified quote" : exact ? "100% Verbatim Match" : `${Math.round(e.match_score * 100)}% Match · OCR`]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
						className: "relative flex-1 px-4 py-4 font-serif text-[14px] leading-relaxed text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, {
							className: "absolute left-4 top-4 size-3.5 text-border-strong",
							"aria-hidden": true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pl-6",
							children: e.quote
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "border-t border-border bg-background px-4 py-2.5 text-[12px] text-muted-foreground",
						children: e.relevance
					})
				]
			}, e.id);
		})
	});
}
function DeadlinesTab({ r }) {
	const hasRepDate = isValidISODate(r.repudiation_date);
	const d = hasRepDate ? computeDeadlines(r.repudiation_date) : null;
	const today = todayISO();
	const ombLeft = d ? daysBetween(today, d.ombudsmanLastDate) : null;
	const cards = [
		{
			icon: ShieldAlert,
			title: "Insurer grievance",
			value: "14 days",
			body: "The IRDAI grievance resolution target is 14 days from receipt. The Rule 14 no-response Ombudsman wait window is a separate 30-day period.",
			status: r.grievance_received_date ? "See timeline for dates" : "Record grievance receipt date"
		},
		{
			icon: Landmark,
			title: "Insurance Ombudsman",
			value: "1 year",
			body: d ? `If unresolved or rejected, review Ombudsman eligibility. Indicative one-year date from repudiation: ${formatDate(d.ombudsmanLastDate)}; the applicable grievance trigger may change this. Claims up to ₹50 lakh; free of cost.` : "If unresolved or rejected, complaints must generally be filed within 1 year of rejection or final grievance reply. Claims up to ₹50 lakh; free of cost.",
			status: ombLeft == null ? "Repudiation date needed" : ombLeft >= 0 ? `${ombLeft} days remaining` : "Window closed"
		},
		{
			icon: Gavel,
			title: "Consumer Commission",
			value: "2 years",
			body: "An alternative remedy under the Consumer Protection Act, 2019, within two years of the cause of action.",
			status: "Optional route"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeadlinesTimeline, { result: r }),
			!hasRepDate && r.backend_deadlines && r.backend_deadlines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-2",
				children: r.backend_deadlines.map((dl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: dl.kind.replace(/_/g, " ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-[14px] text-foreground",
							children: formatOptionalDate(dl.due_date, dl.due_date)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-[11px] text-muted-foreground",
							children: dl.status
						})
					]
				}, `${dl.kind}-${dl.due_date}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4 md:grid-cols-3",
				children: cards.map(({ icon: Icon, ...c }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lift rounded-md border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[15px] font-medium text-foreground",
								children: c.value
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[13.5px] font-medium text-foreground",
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[12.5px] leading-relaxed text-muted-foreground",
							children: c.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 border-t border-border pt-2.5 font-mono text-[11px] text-foreground",
							children: c.status
						})
					]
				}, c.title))
			})
		]
	});
}
function VerdictWorkspace({ result, isSample, backendCaseId, onReset }) {
	const [r, setResult] = (0, import_react.useState)(result);
	const [factsOpen, setFactsOpen] = (0, import_react.useState)(false);
	const [letterOpen, setLetterOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const [offlineEdited, setOfflineEdited] = (0, import_react.useState)(false);
	const [revision, setRevision] = (0, import_react.useState)(0);
	const [purging, setPurging] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setResult(result);
		setOfflineEdited(false);
		setRevision(0);
	}, [result]);
	const v = VERDICT_META[r.verdict];
	const rerun = async (fields) => {
		const fallback = () => {
			setResult(recalculateDemo(r, fields));
			setOfflineEdited(true);
			toast.info("Offline facts recalculated. Legal findings need human review.");
		};
		if (isSample || !backendCaseId || !await checkHealth()) fallback();
		else try {
			const updated = await patchCaseFacts(backendCaseId, fields);
			setResult(updated);
			setOfflineEdited(false);
			toast.success("Analysis updated");
		} catch (e) {
			if (e instanceof ApiError && e.status === 0) fallback();
			else throw e;
		}
		setRevision((n) => n + 1);
	};
	const purge = async () => {
		setPurging(true);
		try {
			if (backendCaseId) await deleteCase(backendCaseId);
			toast.success(backendCaseId ? "Case documents and results deleted" : "Local case cleared");
			setDeleteOpen(false);
			onReset();
		} catch {
			toast.error("Could not purge the case on the server. Try again.");
		} finally {
			setPurging(false);
		}
	};
	const tabTrigger = "inline-flex items-center gap-2 whitespace-nowrap rounded-t-md border-b-2 border-transparent px-2 -mx-2 pb-3 pt-4 text-[13px] text-muted-foreground transition-[color,border-color,background-color] duration-200 ease-out hover:bg-secondary/50 hover:text-foreground data-[state=active]:border-foreground data-[state=active]:bg-secondary/40 data-[state=active]:font-medium data-[state=active]:text-foreground [&_svg]:size-4";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-6xl animate-rise px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: onReset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Start Over"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setLetterOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " Preview & Download Appeal Letter"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setFactsOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), " Edit Facts & Re-run"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setDeleteOpen(true),
							disabled: purging,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), " Delete My Data"]
						})
					]
				})]
			}),
			(isSample || offlineEdited) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 rounded-md border border-contestable-border bg-contestable-bg px-4 py-3 text-[12.5px] text-contestable",
				children: offlineEdited ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Facts were edited offline, so prior automated legal findings have been withdrawn into",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "human-review mode" }),
					". Reconnect the backend to re-run rule verification."
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"The analysis service is offline, so this is a ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "sample analysis" }),
					" — not based on your uploaded documents. Connect the backend to analyse your own case."
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Case ID",
							v: backendCaseId ?? r.case_id,
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Claim number",
							v: r.claim_number || "Not stated",
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2 min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								k: "Insurer",
								v: r.insurer || "Not stated"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Claim amount",
							v: formatOptionalINR(r.claim_amount),
							mono: true
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border bg-background px-6 py-4 md:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Patient",
							v: r.patient || "Not stated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Treatment",
							v: r.treatment || "Not stated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "First inception",
							v: formatOptionalDate(r.first_inception_date),
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Admission",
							v: formatOptionalDate(r.admission_date),
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							k: "Continuous cover",
							v: r.continuous_cover_months != null ? `${r.continuous_cover_months} months` : "Not stated",
							mono: true
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[13px] font-semibold uppercase tracking-wider", v.className),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", v.dot) }), v.label]
								}),
								r.needs_human_review && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									"data-testid": "needs-human-review-badge",
									className: "inline-flex items-center gap-1.5 rounded-md border border-contestable-border bg-contestable-bg px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-contestable",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), " Needs Human Review"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[13px] text-muted-foreground",
									children: v.short
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-[17px] leading-relaxed text-foreground",
							children: r.summary
						}),
						r.warnings && r.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-1 rounded-md border border-contestable-border bg-contestable-bg px-3.5 py-2.5 text-[12px] text-contestable",
							children: r.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w }, w))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 border-t border-border pt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between text-[12.5px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium text-foreground tabular",
									children: [
										r.confidence,
										"% Confidence — ",
										confidenceLabel(r.confidence)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: ["Cited: ", (r.cited_clause || "Not specified").split(" — ")[0]]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "animate-fill mt-2.5 flex gap-1",
								"aria-hidden": true,
								children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-2 flex-1 rounded-[2px]", i < Math.round(r.confidence / 5) ? v.dot : "bg-secondary") }, i))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-border px-6 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Financial summary"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "grid flex-1 grid-cols-3 divide-x divide-border",
							children: [
								{
									k: "Claimed",
									v: r.claim_amount,
									cls: "text-foreground"
								},
								{
									k: "Settled",
									v: r.settled_amount,
									cls: "text-muted-foreground"
								},
								{
									k: "Disallowed",
									v: r.disallowed_amount,
									cls: "text-destructive"
								}
							].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col justify-center px-4 py-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[11.5px] text-muted-foreground",
									children: x.k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: cn("mt-1 font-mono text-[17px] font-medium tabular sm:text-[19px]", x.cls),
									children: formatOptionalINR(x.v)
								})]
							}, x.k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border bg-background px-6 py-3 text-[12px] text-muted-foreground tabular",
							children: [
								"Sum insured ",
								formatOptionalINR(r.sum_insured),
								" · Repudiated",
								" ",
								formatOptionalDate(r.repudiation_date)
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root2, {
				defaultValue: "rules",
				className: "surface mt-5 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(List, {
						className: "flex gap-6 overflow-x-auto border-b border-border px-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
								value: "rules",
								className: tabTrigger,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, {}), " Rules Evaluation"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
								value: "evidence",
								className: tabTrigger,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {}), " Verified Evidence"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
								value: "deadlines",
								className: tabTrigger,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {}), " Deadlines & Ombudsman"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger, {
								value: "letter",
								className: tabTrigger,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " Appeal Letter"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
						value: "rules",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RulesTab, { r })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
						value: "evidence",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceTab, { r })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
						value: "deadlines",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeadlinesTab, { r })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
						value: "letter",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "max-w-xl text-[13px] text-muted-foreground",
								children: [
									"Open the interactive appeal letter preview to fill in any highlighted",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "font-mono text-[12px] text-contestable",
										children: "[[placeholder]]"
									}),
									" ",
									"fields, verify enclosures, and export Word (.docx) or PDF (.pdf)."
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => setLetterOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}), " Preview & Download Appeal Letter"]
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactsEditorModal, {
				result: r,
				open: factsOpen,
				onOpenChange: setFactsOpen,
				onReRun: rerun
			}, `facts-${revision}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterPreviewModal, {
				initialVersion: revision + 1,
				result: r,
				open: letterOpen,
				onOpenChange: setLetterOpen,
				backendCaseId,
				isSample: isSample || offlineEdited
			}, `letter-${revision}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: deleteOpen,
				onOpenChange: (next) => {
					if (!purging) setDeleteOpen(next);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "w-[calc(100%-2rem)] bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Delete My Data?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This permanently deletes this case's uploaded documents and analysis results. This cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: purging,
							onClick: () => setDeleteOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "destructive",
							disabled: purging,
							onClick: purge,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), purging ? "Deleting…" : "Confirm Delete"]
						})]
					})]
				})
			})
		]
	});
}
var initialStages = () => PIPELINE_STAGES.map(() => "pending");
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
function useAnalysis() {
	const [phase, setPhase] = (0, import_react.useState)("intake");
	const [stages, setStages] = (0, import_react.useState)(initialStages);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [isSample, setIsSample] = (0, import_react.useState)(false);
	const [backendCaseId, setBackendCaseId] = (0, import_react.useState)(null);
	const sourceRef = (0, import_react.useRef)(null);
	const uploadedRef = (0, import_react.useRef)(false);
	const runId = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => () => void runId.current++, []);
	const setStage = (i, s) => setStages((prev) => prev.map((v, idx) => idx < i ? "done" : idx === i ? s : v));
	const simulate = (0, import_react.useCallback)(async (id, demoId, fromStage = 0) => {
		for (let i = fromStage; i < PIPELINE_STAGES.length; i++) {
			if (runId.current !== id) return;
			setStage(i, "running");
			await wait(650 + Math.random() * 500);
		}
		if (runId.current !== id) return;
		setStages(PIPELINE_STAGES.map(() => "done"));
		await wait(350);
		if (runId.current !== id) return;
		setResult(DEMO_CASES[demoId]);
		setPhase("result");
	}, []);
	const runBackend = (0, import_react.useCallback)(async (id, src) => {
		let poll;
		try {
			setStage(0, "running");
			let caseId = backendCaseId;
			if (!caseId) {
				caseId = (await createCase()).case_id;
				setBackendCaseId(caseId);
			}
			if (!uploadedRef.current) {
				for (const [kind, file] of Object.entries(src.files)) if (file) await uploadDocument(caseId, file, kind);
				uploadedRef.current = true;
			}
			const cid = caseId;
			poll = setInterval(async () => {
				try {
					const p = await getProgress(cid);
					if (runId.current !== id) return;
					setStages(mapProgressToStages(p));
				} catch {}
			}, 1e3);
			const facts = {};
			const inc = src.facts.first_inception_date && parseDDMMYYYY(src.facts.first_inception_date);
			const adm = src.facts.admission_date && parseDDMMYYYY(src.facts.admission_date);
			if (inc) facts["first_inception_date"] = inc;
			if (adm) facts["admission_date"] = adm;
			const r = await analyzeCase(cid, facts);
			clearInterval(poll);
			if (runId.current !== id) return;
			setStages(PIPELINE_STAGES.map(() => "done"));
			await wait(300);
			setResult(r);
			setPhase("result");
		} catch (e) {
			if (poll) clearInterval(poll);
			if (runId.current !== id) return;
			const err = e instanceof ApiError ? e : new ApiError("Unexpected error", 0);
			setStages((prev) => {
				const idx = Math.max(0, prev.findIndex((s) => s === "running"));
				return prev.map((s, i) => i === idx ? "failed" : s);
			});
			setError({
				message: err.isRateLimit ? err.code === "AI_RATE_LIMIT" ? err.message : "The AI service is rate-limited right now. Wait a few seconds and retry this stage." : err.message,
				rateLimited: err.isRateLimit
			});
		}
	}, [backendCaseId]);
	return {
		phase,
		stages,
		error,
		result,
		isSample,
		backendCaseId,
		start: (0, import_react.useCallback)((src) => {
			const id = ++runId.current;
			sourceRef.current = src;
			uploadedRef.current = false;
			setBackendCaseId(null);
			setError(null);
			setResult(null);
			setStages(initialStages());
			setPhase("processing");
			if (typeof window !== "undefined") window.scrollTo({
				top: 0,
				behavior: "smooth"
			});
			if (src.mode === "demo") {
				setIsSample(false);
				simulate(id, src.demoId);
			} else if (!src.online) {
				setIsSample(true);
				simulate(id, "case_01");
			} else {
				setIsSample(false);
				runBackend(id, src);
			}
		}, [simulate, runBackend]),
		retry: (0, import_react.useCallback)(() => {
			const src = sourceRef.current;
			if (!src) return;
			const id = ++runId.current;
			setError(null);
			setStages((prev) => prev.map((s) => s === "failed" ? "running" : s));
			if (src.mode === "upload" && src.online) runBackend(id, src);
			else simulate(id, src.mode === "demo" ? src.demoId : "case_01");
		}, [runBackend, simulate]),
		reset: (0, import_react.useCallback)(() => {
			runId.current++;
			setPhase("intake");
			setResult(null);
			setError(null);
			setStages(initialStages());
			setBackendCaseId(null);
		}, [])
	};
}
function Index() {
	const a = useAnalysis();
	const [label, setLabel] = (0, import_react.useState)("");
	const router = useRouter();
	const { reset } = a;
	(0, import_react.useEffect)(() => router.subscribe("onResolved", ({ toLocation }) => {
		if (toLocation.pathname === "/" && toLocation.hash === "demo-cases") {
			reset();
			setTimeout(() => document.getElementById("demo-cases")?.scrollIntoView({ behavior: "smooth" }), 50);
		}
	}), [router, reset]);
	if (a.phase === "processing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessingTracker, {
		stages: a.stages,
		error: a.error,
		onRetry: a.retry,
		onCancel: a.reset,
		label
	});
	if (a.phase === "result" && a.result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictWorkspace, {
		result: a.result,
		isSample: a.isSample,
		backendCaseId: a.backendCaseId,
		onReset: a.reset
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intake, {
		onDemo: (id) => {
			setLabel(`Demo case · ${id}`);
			a.start({
				mode: "demo",
				demoId: id
			});
		},
		onAnalyze: (files, facts, online) => {
			setLabel(online ? "Live analysis" : "Offline · sample analysis");
			a.start({
				mode: "upload",
				files,
				facts,
				online
			});
		}
	});
}
//#endregion
export { Index as component };
