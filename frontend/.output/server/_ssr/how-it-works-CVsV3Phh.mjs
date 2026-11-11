import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { k as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as cn, t as PIPELINE_STAGES } from "./utils-WbrsqoLR.mjs";
import { r as VERDICT_META, t as Button } from "./verdict-V8xaGJcn.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/how-it-works-CVsV3Phh.js
var import_jsx_runtime = require_jsx_runtime();
var RULES = [
	[
		"R1",
		"PED Waiting Period",
		"Pre-existing disease waiting periods cannot exceed 36 months (IRDAI Master Circular 2024); continuous cover across renewals applies."
	],
	[
		"R2",
		"60-Month Moratorium",
		"After 60 months of continuous cover, non-disclosure or misrepresentation cannot be raised except for established fraud (Insurance Act Section 45)."
	],
	[
		"R3",
		"Early Onset",
		"An illness diagnosed within the first 3 months with no prior signs or consultation is not treated as a pre-existing disease."
	],
	[
		"R4",
		"Specific Illness Waiting",
		"Listed procedures (such as cataract, hernia, joint replacement) are checked against the policy's stated waiting period."
	],
	[
		"R5",
		"Initial 30-Day Waiting Period",
		"Only illnesses (not accidents) occurring within the initial 30-day waiting period after policy inception are excluded."
	],
	[
		"R6",
		"Room Rent Proportionate Deduction",
		"Proportionate deductions apply only if stated in the policy, and cannot exceed the eligible-to-actual room rent ratio or touch non-associated charges."
	],
	[
		"R7",
		"Non-Payable Items",
		"Disallowed items are checked against the standard regulatory non-payable consumables list; unlisted items are flagged as contestable."
	],
	[
		"R8",
		"Documents or Delay",
		"Checks whether claim intimation falls within the policy window and lists any missing documents requested by the insurer."
	],
	[
		"R9",
		"Grievance & Ombudsman Deadlines",
		"Tracks the 30-day insurer grievance resolution window and the 1-year Insurance Ombudsman filing deadline from rejection."
	],
	[
		"R10",
		"Cashless Timelines",
		"Informational benchmark under IRDAI Master Circular 2024: ~1 hour for cashless pre-authorisation and ~3 hours for discharge."
	]
];
function HowItWorks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "animate-rise mx-auto max-w-4xl px-4 py-16 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Method"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 text-[34px] font-semibold leading-tight text-foreground",
				children: "How It Works"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground",
				children: "ClauseIQ never asks a language model to decide your case. Verdicts come from fixed, auditable rules applied to facts extracted from your documents — and every quote shown to you is checked character-for-character against the source text."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "surface mt-10 divide-y divide-border",
				children: PIPELINE_STAGES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-5 px-6 py-5 transition-colors duration-200 ease-out hover:bg-secondary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-[13px] text-subtle-foreground",
						children: ["0", i + 1]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[15px] font-medium text-foreground",
						children: s.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[13.5px] text-muted-foreground",
						children: s.detail
					})] })]
				}, s.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-14 text-[20px] font-semibold text-foreground",
				children: "The R1–R10 statutory checks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface mt-4 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
					className: "w-full text-left text-[13.5px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: RULES.map(([id, name, d]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border align-top transition-colors duration-150 ease-out last:border-0 hover:bg-secondary/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "w-14 px-5 py-3 font-mono text-[12px] text-muted-foreground",
								children: id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-medium text-foreground",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-muted-foreground",
								children: d
							})
						]
					}, id)) })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-14 text-[20px] font-semibold text-foreground",
				children: "What the verdicts mean"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: Object.keys(VERDICT_META).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface lift p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider", VERDICT_META[k].className),
						children: VERDICT_META[k].label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[13.5px] leading-relaxed text-muted-foreground",
						children: VERDICT_META[k].description
					})]
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						hash: "demo-cases",
						children: ["Try a Demo Case ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
					})
				})
			})
		]
	});
}
//#endregion
export { HowItWorks as component };
