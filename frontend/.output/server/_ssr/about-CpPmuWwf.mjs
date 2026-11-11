import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { S as EyeOff, a as ShieldCheck, c as Scale, v as FileX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-CpPmuWwf.js
var import_jsx_runtime = require_jsx_runtime();
var PRINCIPLES = [
	{
		icon: FileX,
		title: "Raw documents are purged",
		body: "Uploaded files are deleted once analysis completes. You can purge a case and all derived results at any time from the results screen."
	},
	{
		icon: EyeOff,
		title: "No profiling, no resale",
		body: "Your medical and policy data is used only to analyse your case. It is never sold, shared with insurers, or used for advertising."
	},
	{
		icon: ShieldCheck,
		title: "Consent before processing",
		body: "Nothing is processed until you give explicit consent, in line with the Digital Personal Data Protection Act, 2023."
	},
	{
		icon: Scale,
		title: "Assistive, not legal advice",
		body: "ClauseIQ highlights grounds for appeal. It is not a lawyer and cannot guarantee any outcome. Verify every clause before you submit."
	}
];
function About() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise mx-auto max-w-4xl px-4 py-16 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "About & Privacy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 text-[34px] font-semibold leading-tight text-foreground",
				children: "Built for policyholders, not insurers."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 max-w-2xl space-y-4 text-[15.5px] leading-relaxed text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Every year, lakhs of health insurance claims in India are rejected on grounds that do not survive scrutiny — waiting periods that have already ended, moratorium protections that are ignored, or room-rent deductions applied to costs they cannot legally touch." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ClauseIQ helps policyholders and grievance volunteers test a rejection against the IRDAI Master Circular on Health Insurance Business (2024), Section 45 of the Insurance Act, and the Insurance Ombudsman Rules (2017) — and prepares a grievance letter grounded in verified quotes." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-4 sm:grid-cols-2",
				children: PRINCIPLES.map(({ icon: Icon, title, body }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface lift p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-[15px] font-semibold text-foreground",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[13.5px] leading-relaxed text-muted-foreground",
							children: body
						})
					]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface mt-10 p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[15px] font-semibold text-foreground",
					children: "Where to escalate"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-[13.5px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Insurer's Grievance Redressal Officer — first step, 30-day resolution window." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. IRDAI Bima Bharosa portal — bimabharosa.irdai.gov.in." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Council for Insurance Ombudsmen — within one year of repudiation, free of cost." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "4. District Consumer Disputes Redressal Commission — within two years." })
					]
				})]
			})
		]
	});
}
//#endregion
export { About as component };
