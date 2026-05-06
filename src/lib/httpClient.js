import { API_BASE_URL } from "../config/env";

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const NETWORK_RETRY_COUNT = 1;
const NETWORK_RETRY_DELAY_MS = 1200;
const SAME_ORIGIN_API_BASE_URL = "/api";
const DIRECT_RENDER_API_BASE_URL = "https://vibematch-qqou.onrender.com/api";

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isLocalApiBaseUrl(url) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(String(url || ""));
}

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function normalizeApiBaseUrl(url) {
  const normalized = stripTrailingSlash(String(url || "").trim());
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    return stripTrailingSlash(new URL(normalized).toString());
  } catch {
    return "";
  }
}

function buildApiBaseCandidates(primaryBaseUrl) {
  const primary = normalizeApiBaseUrl(primaryBaseUrl);
  const candidates = [];

  if (primary) {
    candidates.push(primary);
  }

  const normalizedSameOrigin = normalizeApiBaseUrl(SAME_ORIGIN_API_BASE_URL);
  const normalizedDirectRender = normalizeApiBaseUrl(DIRECT_RENDER_API_BASE_URL);

  if (primary === normalizedSameOrigin) {
    candidates.push(normalizedDirectRender);
  } else if (primary === normalizedDirectRender) {
    candidates.push(normalizedSameOrigin);
  } else {
    candidates.push(normalizedSameOrigin, normalizedDirectRender);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

async function fetchWithRetry(endpoint, fetchOptions) {
  let response;
  let networkError = null;

  for (let attempt = 0; attempt <= NETWORK_RETRY_COUNT; attempt += 1) {
    try {
      response = await fetch(endpoint, fetchOptions);
      networkError = null;
      break;
    } catch (error) {
      networkError = error;
      if (attempt < NETWORK_RETRY_COUNT) {
        await sleep(NETWORK_RETRY_DELAY_MS);
      }
    }
  }

  return { response, networkError };
}

export async function request(path, options = {}) {
  const { method = "GET", data, token, headers = {} } = options;
  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  const baseCandidates = buildApiBaseCandidates(API_BASE_URL);
  let lastNetworkIssue = null;
  let lastHttpError = null;

  for (let index = 0; index < baseCandidates.length; index += 1) {
    const baseUrl = baseCandidates[index];
    const endpoint = `${baseUrl}${path}`;
    const { response, networkError } = await fetchWithRetry(endpoint, fetchOptions);

    if (networkError || !response) {
      lastNetworkIssue = {
        endpoint,
        originalError: networkError?.message || "Network error",
      };
      continue;
    }

    const rawText = await response.text();
    const parsedBody = rawText ? safeJsonParse(rawText) : null;

    if (response.ok) {
      return parsedBody;
    }

    const endpointMissing =
      response.status === 404 &&
      typeof parsedBody?.message === "string" &&
      parsedBody.message.toLowerCase().includes("endpoint not found");

    const message = endpointMissing
      ? "Backend endpoints are outdated. Please redeploy backend and retry."
      : parsedBody?.message ?? `Request failed with status ${response.status}`;

    const errorPayload = {
      endpoint,
      body: parsedBody,
      status: response.status,
    };

    // If route is missing on one target, try next candidate before failing.
    if (response.status === 404 && index < baseCandidates.length - 1) {
      lastHttpError = new ApiError(message, response.status, errorPayload);
      continue;
    }

    throw new ApiError(message, response.status, errorPayload);
  }

  if (lastHttpError) {
    throw lastHttpError;
  }

  const networkMessage = isLocalApiBaseUrl(API_BASE_URL)
    ? `Unable to reach local backend at ${API_BASE_URL}. Start backend with \`npm run backend\`, then retry.`
    : `Unable to reach backend API at ${API_BASE_URL}. Check backend status, CORS, and deploy config.`;

  throw new ApiError(networkMessage, 0, {
    endpoint: lastNetworkIssue?.endpoint || `${API_BASE_URL}${path}`,
    originalError: lastNetworkIssue?.originalError || "Network error",
  });
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export { ApiError };
