import { i as __toESM } from "../_runtime.mjs";
import { f as require_react, n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as ArrowLeft, C as CloudUpload, D as CalendarClock, E as Check, O as BadgeCheck, S as Copy, T as ChevronDown, b as FileDown, d as Lock, f as LoaderCircle, g as Gavel, i as Timer, k as ArrowRight, l as RotateCcw, m as Landmark, n as TriangleAlert, o as ShieldAlert, p as ListChecks, r as Trash2, s as ScrollText, t as X, u as Quote, v as FileText, w as CircleCheck, y as FileSearch } from "../_libs/lucide-react.mjs";
import { n as cn, t as PIPELINE_STAGES } from "./utils-WbrsqoLR.mjs";
import { i as confidenceLabel, n as OUTCOME_META, r as VERDICT_META, t as Button } from "./verdict-V8xaGJcn.mjs";
import { b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getProgress, c as useBackendStatus, i as deleteCase, n as analyzeCase, o as mapProgressToStages, r as createCase, s as uploadDocument, t as ApiError } from "./use-backend-status-D_-Ii0gR.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DOEFSz8w.js
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
			}) }) : r.rules.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-5 py-3 text-muted-foreground",
						children: x.finding
					})
				]
			}, x.id)) })]
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
	if (!isValidISODate(r.repudiation_date)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-md border border-border bg-background p-5 text-[13px] text-muted-foreground",
			children: "The rejection / repudiation date was not extracted from your documents, so statutory 30-day grievance and 1-year Insurance Ombudsman timeline dates could not be computed."
		}), r.backend_deadlines && r.backend_deadlines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2",
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
		})]
	});
	const d = computeDeadlines(r.repudiation_date);
	const today = todayISO();
	const span = Math.max(1, daysBetween(d.repudiation, d.ombudsmanLastDate));
	const elapsed = Math.min(Math.max(daysBetween(d.repudiation, today), 0), span);
	const grievanceLeft = daysBetween(today, d.grievanceResponseDue);
	const ombLeft = daysBetween(today, d.ombudsmanLastDate);
	const pos = (iso) => `${daysBetween(d.repudiation, iso) / span * 100}%`;
	const cards = [
		{
			icon: ShieldAlert,
			title: "Insurer grievance",
			value: `30 days`,
			body: `File with the Grievance Redressal Officer now. The insurer must resolve within 30 days; if filed today, a response is due by ${formatDate(addTodayDays(30))}.`,
			status: grievanceLeft >= 0 ? `${grievanceLeft} days left in first window` : "File immediately"
		},
		{
			icon: Landmark,
			title: "Insurance Ombudsman",
			value: "1 year",
			body: `If unresolved or rejected, complain to the Ombudsman within one year of repudiation — last date ${formatDate(d.ombudsmanLastDate)}. Claims up to ₹50 lakh; free of cost.`,
			status: ombLeft >= 0 ? `${ombLeft} days remaining` : "Window closed"
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border bg-background p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: "Appeal window"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-muted-foreground tabular",
						children: [
							"Day ",
							elapsed,
							" of ",
							span
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-14 h-1.5 rounded-full bg-secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700 ease-out",
						style: { width: `${elapsed / span * 100}%` }
					}), [
						{
							iso: d.repudiation,
							label: "Repudiated",
							date: formatDate(d.repudiation),
							align: "left"
						},
						{
							iso: d.grievanceResponseDue,
							label: "30-day TAT",
							date: formatDate(d.grievanceResponseDue),
							align: "center"
						},
						{
							iso: d.ombudsmanLastDate,
							label: "Ombudsman limit",
							date: formatDate(d.ombudsmanLastDate),
							align: "right"
						}
					].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("absolute top-1/2 flex flex-col", m.align === "left" && "items-start", m.align === "center" && "-translate-x-1/2 items-center", m.align === "right" && "-translate-x-full items-end"),
						style: { left: pos(m.iso) },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "-mt-[5px] size-2.5 rounded-full border-2 border-card bg-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("flex flex-col whitespace-nowrap", m.align === "center" ? "absolute bottom-full mb-3 items-center" : "mt-2", m.align === "right" && "items-end"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-medium text-foreground",
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10.5px] text-muted-foreground",
								children: m.date
							})]
						})]
					}, m.label))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-4 md:grid-cols-3",
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
		})]
	});
}
function addTodayDays(n) {
	const t = /* @__PURE__ */ new Date();
	t.setUTCDate(t.getUTCDate() + n);
	return t.toISOString().slice(0, 10);
}
function LetterTab({ r }) {
	const blocks = (0, import_react.useMemo)(() => buildAppealLetter(r), [r]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const base = `ClauseIQ_Appeal_${(r.claim_number && r.claim_number !== "Not stated" ? r.claim_number : r.case_id).replace(/[^A-Za-z0-9]+/g, "-")}`;
	const insurerLabel = r.insurer && r.insurer !== "Not stated" ? r.insurer : "the insurer";
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(letterToPlainText(blocks));
			toast.success("Letter copied to clipboard");
		} catch {
			toast.error("Could not access the clipboard");
		}
	};
	const dl = async (kind) => {
		setBusy(kind);
		try {
			if (kind === "pdf") await downloadLetterPdf(blocks, `${base}.pdf`);
			else await downloadLetterDocx(blocks, `${base}.docx`);
		} catch {
			toast.error("Download failed — please try again");
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "max-w-lg text-[12.5px] text-muted-foreground",
				children: [
					"Addressed to the Grievance Redressal Officer of ",
					insurerLabel,
					". Review every statement and attach supporting documents before sending."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: copy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), " Copy Letter"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => dl("docx"),
						disabled: busy !== null,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}),
							" ",
							busy === "docx" ? "Preparing…" : "Download DOCX"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => dl("pdf"),
						disabled: busy !== null,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, {}),
							" ",
							busy === "pdf" ? "Preparing…" : "Download PDF"
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-[720px] rounded-sm border border-border bg-card px-8 py-10 font-serif text-[14px] leading-[1.7] text-foreground shadow-raised sm:px-14",
			children: blocks.map((b, i) => {
				if (b.kind === "spacer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4" }, i);
				if (b.kind === "heading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 mb-1 font-sans text-[12px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: b.text
				}, i);
				if (b.kind === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mb-4 ml-5 list-decimal space-y-1.5 marker:font-mono marker:text-[12px] marker:text-muted-foreground",
					children: b.items?.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "pl-1",
						children: t
					}, t))
				}, i);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn(b.bold && "font-semibold", b.kind === "para" && "mb-4"),
					children: b.text
				}, i);
			})
		})]
	});
}
function VerdictWorkspace({ result: r, isSample, backendCaseId, onReset }) {
	const v = VERDICT_META[r.verdict];
	const [purging, setPurging] = (0, import_react.useState)(false);
	const purge = async () => {
		setPurging(true);
		try {
			if (backendCaseId) await deleteCase(backendCaseId);
			toast.success("Case purged — all documents and results deleted");
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onReset,
					className: "inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " New case"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: purge,
					disabled: purging,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}),
						" ",
						purging ? "Purging…" : "Purge case data"
					]
				})]
			}),
			isSample && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 rounded-md border border-contestable-border bg-contestable-bg px-4 py-3 text-[12.5px] text-contestable",
				children: [
					"The analysis service is offline, so this is a ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "sample analysis" }),
					" — not based on your uploaded documents. Connect the backend to analyse your own case."
				]
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
								" · Repudiated ",
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
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LetterTab, { r })
					})
				]
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
