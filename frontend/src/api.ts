import type { ApiResult, ExplainRequest, ExplainResponse, RoleResponse } from "./types";

// The backend gives Gemini 30 s per call; leave headroom for the round trip.
const REQUEST_TIMEOUT_MS = 45_000;

export const NETWORK_ERROR = "Can't reach the PlainSpeak server. Check that the backend is running, then try again.";
export const TIMEOUT_ERROR = "Gemini took too long to answer. Try again.";
export const UNEXPECTED_REPLY = "The server sent an answer PlainSpeak could not read. Try again.";

const FIELD_LABELS: Record<string, string> = { topic: "Topic", expert_role: "Expert" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validationMessage(detail: unknown[]): string | null {
  const first = detail[0];
  if (!isRecord(first) || typeof first.msg !== "string") return null;
  const field = Array.isArray(first.loc) ? String(first.loc.at(-1)) : "";
  const label = FIELD_LABELS[field] ?? "Input";
  const message = first.msg.replace(/^Value error, /, "");
  return `${label} ${message.charAt(0).toLowerCase()}${message.slice(1)}.`;
}

export function errorMessage(status: number, payload: unknown): string {
  const detail = isRecord(payload) ? payload.detail : undefined;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const message = validationMessage(detail);
    if (message) return message;
  }
  return `The server had a problem (${status}). Try again.`;
}

async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, message: errorMessage(response.status, payload) };
    // A proxy or crashed server can answer 200 with HTML; never hand that on as data.
    if (!isRecord(payload)) return { ok: false, message: UNEXPECTED_REPLY };
    return { ok: true, data: payload as T };
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, message: isTimeout ? TIMEOUT_ERROR : NETWORK_ERROR };
  }
}

export function fetchExpert(topic: string): Promise<ApiResult<RoleResponse>> {
  return postJson<RoleResponse>("/api/role", { topic });
}

export function fetchExplanation(request: ExplainRequest): Promise<ApiResult<ExplainResponse>> {
  return postJson<ExplainResponse>("/api/explain", request);
}
