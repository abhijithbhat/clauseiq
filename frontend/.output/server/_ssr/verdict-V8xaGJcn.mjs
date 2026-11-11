import { i as __toESM } from "../_runtime.mjs";
import { p as require_jsx_runtime, u as Slot } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-WbrsqoLR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verdict-V8xaGJcn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer press focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			action: "bg-action text-action-foreground shadow-card hover:bg-action/90",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var VERDICT_META = {
	LIKELY_WRONGFUL: {
		label: "Likely Wrongful",
		short: "Insurer appears to have violated the regulations",
		description: "The rejection conflicts with binding IRDAI rules or the policy's own terms.",
		className: "text-wrongful bg-wrongful-bg border-wrongful-border",
		dot: "bg-wrongful",
		accentClassName: "border-t-wrongful-accent"
	},
	CONTESTABLE: {
		label: "Contestable",
		short: "Strong grounds exist to dispute this rejection",
		description: "Material arguments favour the policyholder, but some facts remain disputed.",
		className: "text-contestable bg-contestable-bg border-contestable-border",
		dot: "bg-contestable",
		accentClassName: "border-t-contestable-accent"
	},
	LIKELY_VALID: {
		label: "Likely Valid",
		short: "The insurer's position is legally supported",
		description: "The cited clause appears to apply and is within regulatory limits.",
		className: "text-valid bg-valid-bg border-valid-border",
		dot: "bg-valid",
		accentClassName: "border-t-valid-accent"
	},
	INSUFFICIENT_INFO: {
		label: "Insufficient Info",
		short: "Key facts are missing for a reliable verdict",
		description: "Upload additional documents or provide the missing dates to continue.",
		className: "text-info bg-info-bg border-info-border",
		dot: "bg-info",
		accentClassName: "border-t-info"
	}
};
var OUTCOME_META = {
	CONTRADICTS_INSURER: {
		label: "Contradicts insurer",
		className: "text-wrongful bg-wrongful-bg border-wrongful-border"
	},
	SUPPORTS_INSURER: {
		label: "Supports insurer",
		className: "text-valid bg-valid-bg border-valid-border"
	},
	NEEDS_INFO: {
		label: "Needs info",
		className: "text-info bg-info-bg border-info-border"
	},
	NOT_APPLICABLE: {
		label: "Not applicable",
		className: "text-subtle-foreground bg-card border-border"
	}
};
function confidenceLabel(score) {
	if (score >= 90) return "High Evidentiary Match";
	if (score >= 75) return "Strong Evidentiary Match";
	if (score >= 55) return "Moderate Evidentiary Match";
	return "Low Evidentiary Match";
}
//#endregion
export { confidenceLabel as i, OUTCOME_META as n, VERDICT_META as r, Button as t };
