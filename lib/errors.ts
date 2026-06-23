/**
 * Centralized error categorization and user-friendly messaging system.
 *
 * Every error surfaced to the user must come from here so that:
 *   - the API, the form, and the global error boundary speak the same language
 *   - end-users never see raw stack traces or framework jargon
 *   - each category maps to an actionable message
 */

export type ErrorCategory =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "server"
  | "unknown";

/**
 * User-facing messages. Keep them short, calm, and actionable.
 * Tone is consistent across the whole product.
 */
export const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  network: "network issue pls wait",
  authentication:
    "We couldn't verify your session. Please refresh the page and try again.",
  authorization: "You don't have permission to do that. Please contact support if this seems wrong.",
  validation:
    "Some of the information looks off. Please review the highlighted fields and try again.",
  not_found: "We couldn't find what you were looking for. It may have been moved or removed.",
  conflict: "This record already exists. Please use a different value.",
  rate_limit:
    "You're going a little fast 🙂. Please wait a moment and try again.",
  server:
    "Something went wrong on our end. Our team has been notified — please try again shortly.",
  unknown:
    "Something unexpected happened. Please try again, and reach out if it keeps occurring.",
};

/**
 * HTTP status code → category. Used when the API returns a code without a
 * category field (defensive fallback).
 */
export function categorizeStatus(status: number): ErrorCategory {
  if (status === 0 || status === 408) return "network";
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

/**
 * Browser fetch() rejects with a TypeError ("Failed to fetch" / "NetworkError")
 * when the request never reached the server. This detects that case explicitly.
 */
export function isNetworkError(err: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (err instanceof TypeError) {
    const msg = err.message?.toLowerCase() || "";
    return msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch");
  }
  // Navigator online check as a secondary signal
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return false;
}

/**
 * Shape of any error object that travels over the wire (API → client).
 * The client uses this to render the right toast / inline error.
 */
export interface ApiErrorBody {
  error: string;
  category: ErrorCategory;
  field?: string;
  statusCode: number;
}

/**
 * Build a structured error response. Always use this from API routes so the
 * shape stays consistent.
 */
export function apiError(
  category: ErrorCategory,
  options: {
    statusCode?: number;
    message?: string;
    field?: string;
    details?: string;
  } = {}
): Response {
  const statusCode = options.statusCode ?? defaultStatus(category);
  const userMessage = options.message ?? ERROR_MESSAGES[category];
  const body: ApiErrorBody & { details?: string } = {
    error: userMessage,
    category,
    statusCode,
  };
  if (options.field) body.field = options.field;
  if (process.env.NODE_ENV !== "production" && options.details) {
    body.details = options.details;
  }
  return Response.json(body, { status: statusCode });
}

function defaultStatus(category: ErrorCategory): number {
  switch (category) {
    case "network":
      return 503;
    case "authentication":
      return 401;
    case "authorization":
      return 403;
    case "validation":
      return 422;
    case "not_found":
      return 404;
    case "conflict":
      return 409;
    case "rate_limit":
      return 429;
    case "server":
      return 500;
    default:
      return 500;
  }
}

/**
 * Parse the JSON body of a non-OK Response into an ApiErrorBody.
 * Falls back to category inferred from status if the body is missing/malformed.
 */
export async function parseApiError(res: Response): Promise<ApiErrorBody> {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string" && typeof data.category === "string") {
      return {
        error: data.error,
        category: data.category as ErrorCategory,
        field: data.field,
        statusCode: res.status,
      };
    }
  } catch {
    // body wasn't JSON — fall through to status-based fallback
  }
  const category = categorizeStatus(res.status);
  return {
    error: ERROR_MESSAGES[category],
    category,
    statusCode: res.status,
  };
}

/**
 * Convenience wrapper around fetch() that throws a categorized error on
 * non-2xx responses. The thrown value is an ApiErrorBody so callers can
 * dispatch on .category.
 */
export class ApiCallError extends Error {
  body: ApiErrorBody;
  constructor(body: ApiErrorBody) {
    super(body.error);
    this.name = "ApiCallError";
    this.body = body;
  }
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (err) {
    if (isNetworkError(err)) {
      throw new ApiCallError({
        error: ERROR_MESSAGES.network,
        category: "network",
        statusCode: 0,
      });
    }
    throw new ApiCallError({
      error: ERROR_MESSAGES.unknown,
      category: "unknown",
      statusCode: 0,
    });
  }
  if (!res.ok) {
    const body = await parseApiError(res);
    throw new ApiCallError(body);
  }
  return res;
}
