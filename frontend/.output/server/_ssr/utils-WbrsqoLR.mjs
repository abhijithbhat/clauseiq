import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-WbrsqoLR.js
var PIPELINE_STAGES = [
	{
		title: "Reading documents",
		detail: "Extracting text and running OCR on scanned pages"
	},
	{
		title: "Finding key facts",
		detail: "Inception dates, claim amount, diagnosis, and rejection reason"
	},
	{
		title: "Locating clauses",
		detail: "Hybrid BM25 and neural vector search across policy sections"
	},
	{
		title: "Checking rules",
		detail: "Running deterministic R1–R10 statutory checks"
	},
	{
		title: "Verifying evidence",
		detail: "Character-for-character quote verifier against document text"
	},
	{
		title: "Writing explanation",
		detail: "Class 8 plain-English verdict summary and appeal grounds"
	}
];
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { cn as n, PIPELINE_STAGES as t };
