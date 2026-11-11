import { t as PIPELINE_STAGES } from "./utils-WbrsqoLR.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-backend-status-D_-Ii0gR.js
function isBackendAnalysisResult(raw) {
	return typeof raw.verdict === "object" && raw.verdict !== null && "label" in raw.verdict;
}
function mapRuleOutcome(outcome) {
	switch (outcome) {
		case "CONTRADICTS_INSURER": return "CONTRADICTS_INSURER";
		case "SUPPORTS_INSURER": return "SUPPORTS_INSURER";
		case "NOT_APPLICABLE": return "NOT_APPLICABLE";
		default: return "NEEDS_INFO";
	}
}
function mapEvidenceSource(sourceType) {
	switch (sourceType) {
		case "POLICY": return "POLICY";
		case "LETTER": return "REJECTION_LETTER";
		case "LAW_PACK": return "REGULATION";
		case "DISCHARGE": return "DISCHARGE";
		case "DISCHARGE_SUMMARY": return "DISCHARGE_SUMMARY";
		default: return "OTHER";
	}
}
function evidenceDocumentTitle(sourceType) {
	switch (sourceType) {
		case "POLICY": return "Policy Document";
		case "LETTER": return "Rejection Letter";
		case "LAW_PACK": return "IRDAI / Statutory Law Pack";
		default: return "Supporting Document";
	}
}
function policyTypeLabel(policyType) {
	switch (policyType) {
		case "INDIVIDUAL": return "Individual Health Policy";
		case "FLOATER": return "Family Floater Health Policy";
		case "GROUP": return "Group Health Insurance Policy";
		default: return "Health Insurance Policy";
	}
}
function scaleConfidence(rawConfidence) {
	if (!Number.isFinite(rawConfidence)) return 0;
	if (rawConfidence >= 0 && rawConfidence <= 1) return Math.round(rawConfidence * 100);
	return Math.max(0, Math.min(100, Math.round(rawConfidence)));
}
function buildAppealGrounds(raw, rules, evidence) {
	const grounds = [];
	const seen = /* @__PURE__ */ new Set();
	const addUnique = (text) => {
		const cleaned = text?.trim();
		if (!cleaned || seen.has(cleaned)) return;
		seen.add(cleaned);
		grounds.push(cleaned);
	};
	for (const r of rules) if (r.outcome === "CONTRADICTS_INSURER") addUnique(r.finding);
	if (raw.verdict.label === "CONTESTABLE") {
		for (const r of rules) if (r.outcome === "NEEDS_INFO") addUnique(r.finding);
	}
	const reasonIds = new Set(raw.verdict.reasons ?? []);
	const verifiedEvidence = evidence.filter((e) => e.verified !== false);
	const prioritized = verifiedEvidence.filter((e) => reasonIds.has(e.id));
	for (const ev of prioritized.length > 0 ? prioritized : verifiedEvidence.slice(0, 2)) addUnique(`${ev.section} (Page ${ev.page}): "${ev.quote}"`);
	if (grounds.length === 0) {
		if (raw.verdict.summary.trim()) addUnique(raw.verdict.summary);
		for (const r of rules) addUnique(r.finding);
	}
	if (grounds.length === 0) addUnique("Requesting a formal review of the claim decision and supporting policy records.");
	return grounds;
}
/**
* Convert a nested backend AnalysisResult payload into the flat frontend view model.
* Offline DEMO_CASES (already flat) pass through unchanged.
*/
function adaptAnalysisResult(raw) {
	if (!isBackendAnalysisResult(raw)) return raw;
	const facts = raw.facts ?? {};
	const rawRules = Array.isArray(raw.rules) ? raw.rules : [];
	const rawEvidence = Array.isArray(raw.evidence) ? raw.evidence : [];
	const rules = rawRules.map((rule) => ({
		id: rule.rule_id,
		name: rule.name,
		outcome: mapRuleOutcome(rule.outcome),
		citation: rule.law_ref?.trim() || "—",
		finding: rule.explanation
	}));
	const ruleByEvidenceId = /* @__PURE__ */ new Map();
	for (const rule of rawRules) for (const evId of rule.supporting_evidence_ids ?? []) if (!ruleByEvidenceId.has(evId)) ruleByEvidenceId.set(evId, `${rule.rule_id}: ${rule.name}`);
	const evidence = rawEvidence.map((ev) => {
		const linkedRule = ruleByEvidenceId.get(ev.id);
		const defaultRelevance = ev.verified ? linkedRule ? `Verified excerpt supporting ${linkedRule}.` : "Verbatim quote verified against uploaded document text." : "Quote could not be verified verbatim against uploaded documents.";
		return {
			id: ev.id,
			source: mapEvidenceSource(ev.source_type),
			document_title: evidenceDocumentTitle(ev.source_type),
			section: ev.source_ref || "Cited excerpt",
			page: ev.page ?? 1,
			quote: ev.quote,
			match_score: ev.verified ? 1 : 0,
			relevance: defaultRelevance,
			verified: ev.verified
		};
	});
	const claimAmount = raw.money?.claim_amount_inr ?? facts.claim_amount_inr ?? null;
	const settledAmount = raw.money?.settled_amount_inr ?? facts.settled_amount_inr ?? null;
	const disallowedAmount = raw.money?.disallowed_amount_inr ?? facts.disallowed_amount_inr ?? (claimAmount != null && settledAmount != null ? Math.max(0, claimAmount - settledAmount) : null);
	const citedClause = facts.cited_clause_ref?.trim() || (facts.cited_clause_text?.trim() ? facts.cited_clause_text.trim().slice(0, 80) : "Not specified");
	return {
		case_id: raw.case_id,
		claim_number: facts.claim_number?.trim() || "Not stated",
		policy_number: facts.policy_number?.trim() || "Not stated",
		insurer: facts.insurer_name?.trim() || "Not stated",
		insurer_grievance_email: "[[insurer grievance email]]",
		product_name: policyTypeLabel(facts.policy_type),
		policyholder: facts.insured_name?.trim() || "[[policyholder name]]",
		patient: facts.insured_name?.trim() || "Not stated",
		hospital: facts.hospital_name?.trim() || "Not stated",
		diagnosis: facts.diagnosis_text?.trim() || "Not stated",
		treatment: facts.treatment_text?.trim() || facts.diagnosis_text?.trim() || "Not stated",
		claim_amount: claimAmount,
		settled_amount: settledAmount,
		disallowed_amount: disallowedAmount,
		sum_insured: facts.sum_insured_inr ?? facts.base_sum_insured_inr ?? null,
		first_inception_date: facts.policy_first_inception_date ?? null,
		admission_date: facts.admission_date ?? null,
		repudiation_date: facts.rejection_date ?? null,
		continuous_cover_months: facts.continuous_coverage_months ?? null,
		rejection_reason: facts.rejection_reason_text?.trim() || "No verbatim rejection reason extracted.",
		cited_clause: citedClause,
		verdict: raw.verdict.label,
		confidence: scaleConfidence(raw.verdict.confidence),
		needs_human_review: Boolean(raw.verdict.needs_human_review),
		warnings: raw.warnings ?? [],
		backend_deadlines: raw.deadlines ?? [],
		summary: raw.verdict.summary,
		appeal_grounds: buildAppealGrounds(raw, rules, evidence),
		rules,
		evidence
	};
}
function normalizeStageStatus(status) {
	switch (status?.trim().toLowerCase()) {
		case "pending": return "pending";
		case "running": return "running";
		case "done":
		case "completed": return "done";
		case "failed":
		case "error": return "failed";
		default: return null;
	}
}
/**
* Map backend ProgressResponse ({ status, current_step: Optional[str], steps: [{name, status}] })
* into the 6 ordered UI StageStatus values.
*/
function mapProgressToStages(progress) {
	const stepsByName = /* @__PURE__ */ new Map();
	for (const step of progress.steps ?? []) {
		const normalized = normalizeStageStatus(step.status);
		if (step.name && normalized) stepsByName.set(step.name.trim().toLowerCase(), normalized);
	}
	let currentIdx = -1;
	if (typeof progress.current_step === "number" && Number.isFinite(progress.current_step)) currentIdx = Math.max(0, Math.min(progress.current_step, PIPELINE_STAGES.length - 1));
	else if (typeof progress.current_step === "string" && progress.current_step.trim()) {
		const normalizedName = progress.current_step.trim().toLowerCase();
		if (normalizedName === "completed") currentIdx = PIPELINE_STAGES.length;
		else currentIdx = PIPELINE_STAGES.findIndex((s) => s.title.toLowerCase() === normalizedName);
	}
	const overallStatus = progress.status?.trim().toLowerCase();
	const isCompleted = overallStatus === "completed" || currentIdx >= PIPELINE_STAGES.length;
	return PIPELINE_STAGES.map((stage, i) => {
		const namedStatus = stepsByName.get(stage.title.toLowerCase());
		const fallbackStep = stepsByName.size === 0 ? normalizeStageStatus(progress.steps?.[i]?.status) : null;
		const explicit = namedStatus ?? fallbackStep;
		if (explicit === "done" || explicit === "failed" || explicit === "running") return explicit;
		if (isCompleted) return "done";
		if (currentIdx >= 0) {
			if (i < currentIdx) return "done";
			if (i === currentIdx && (overallStatus === "analyzing" || overallStatus === "running")) return "running";
			if (i === currentIdx && overallStatus === "failed") return "failed";
		}
		return explicit ?? "pending";
	});
}
var API_BASE_URL = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_API_BASE_URL"] || "http://localhost:8000";
var ApiError = class extends Error {
	status;
	code;
	hint;
	constructor(message, status, code, hint) {
		super(message);
		this.status = status;
		this.code = code;
		this.hint = hint;
		this.name = "ApiError";
	}
	get isRateLimit() {
		return this.status === 429 || this.code === "AI_RATE_LIMIT";
	}
};
function parseApiErrorPayload(body, status, fallbackText = "Request failed") {
	let code;
	let hint;
	let baseMessage = fallbackText.trim() || "Request failed";
	if (typeof body === "object" && body !== null) {
		const record = body;
		if (typeof record["code"] === "string" && record["code"].trim()) code = record["code"].trim();
		if (typeof record["hint"] === "string" && record["hint"].trim()) hint = record["hint"].trim();
		if (typeof record["message"] === "string" && record["message"].trim()) baseMessage = record["message"].trim();
		else if (typeof record["detail"] === "string" && record["detail"].trim()) baseMessage = record["detail"].trim();
		else if (Array.isArray(record["detail"])) {
			const msgs = record["detail"].map((item) => typeof item === "object" && item !== null ? item["msg"] : void 0).filter((m) => typeof m === "string" && m.trim().length > 0);
			if (msgs.length > 0) baseMessage = msgs.join("; ");
		}
	}
	return new ApiError(hint && !baseMessage.includes(hint) ? `${baseMessage}${/[.!?]$/.test(baseMessage) ? "" : "."} ${hint}` : baseMessage, status, code, hint);
}
async function request(path, init, timeoutMs = 6e4) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			signal: ctrl.signal
		});
		if (!res.ok) {
			let body = null;
			try {
				body = await res.json();
			} catch {}
			throw parseApiErrorPayload(body, res.status, res.statusText || "Request failed");
		}
		if (res.status === 204) return void 0;
		return await res.json();
	} catch (e) {
		if (e instanceof ApiError) throw e;
		if (e instanceof Error && e.name === "AbortError") throw new ApiError("Request timed out — the analysis service took too long to respond. Please retry.", 408, "TIMEOUT");
		throw new ApiError("Network error — the analysis service could not be reached.", 0, "NETWORK_ERROR");
	} finally {
		clearTimeout(t);
	}
}
async function checkHealth() {
	try {
		return (await request("/health", void 0, 2500))?.status === "ok";
	} catch {
		return false;
	}
}
function createCase(case_id) {
	return request("/cases", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			consent_given: true,
			...case_id ? { case_id } : {}
		})
	});
}
function uploadDocument(caseId, file, kind) {
	const wireKind = kind === "DISCHARGE_SUMMARY" ? "DISCHARGE" : kind;
	const fd = new FormData();
	fd.append("file", file);
	fd.append("kind", wireKind);
	return request(`/cases/${encodeURIComponent(caseId)}/documents`, {
		method: "POST",
		body: fd
	});
}
function getProgress(caseId) {
	return request(`/cases/${encodeURIComponent(caseId)}/progress`, void 0, 5e3);
}
async function analyzeCase(caseId, facts) {
	return adaptAnalysisResult(await request(`/cases/${encodeURIComponent(caseId)}/analyze`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(facts ?? {})
	}, 18e4));
}
function deleteCase(caseId) {
	return request(`/cases/${encodeURIComponent(caseId)}`, { method: "DELETE" });
}
function useBackendStatus() {
	const q = useQuery({
		queryKey: ["clauseiq-health"],
		queryFn: checkHealth,
		refetchInterval: 3e4,
		retry: false,
		staleTime: 15e3
	});
	return {
		checking: q.isPending,
		online: q.data === true,
		refresh: () => q.refetch()
	};
}
//#endregion
export { getProgress as a, useBackendStatus as c, deleteCase as i, analyzeCase as n, mapProgressToStages as o, createCase as r, uploadDocument as s, ApiError as t };
