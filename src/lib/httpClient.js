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

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isLocalApiBaseUrl(url) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(String(url || ""));
}

export async function request(path, options = {}) {
  const { method = "GET", data, token, headers = {} } = options;
  const endpoint = `${API_BASE_URL}${path}`;

  let response;
  let networkError = null;
  for (let attempt = 0; attempt <= NETWORK_RETRY_COUNT; attempt += 1) {
    try {
      response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      networkError = null;
      break;
    } catch (error) {
      networkError = error;
      if (attempt < NETWORK_RETRY_COUNT) {
        await sleep(NETWORK_RETRY_DELAY_MS);
      }
    }
  }

  if (networkError || !response) {
    const networkMessage = isLocalApiBaseUrl(API_BASE_URL)
      ? `Unable to reach local backend at ${API_BASE_URL}. Start backend with \`npm run backend\`, then retry.`
      : `Unable to reach backend API at ${API_BASE_URL}. Check backend status, CORS, and Vercel env config.`;
    throw new ApiError(networkMessage, 0, {
      endpoint,
      originalError: networkError?.message || "Network error",
    });
  }

  const rawText = await response.text();
  const parsedBody = rawText ? safeJsonParse(rawText) : null;

  if (!response.ok) {
    const endpointMissing =
      response.status === 404 &&
      typeof parsedBody?.message === "string" &&
      parsedBody.message.toLowerCase().includes("endpoint not found");
    const message = endpointMissing
      ? "Backend endpoints are outdated. Please restart backend with `npm run backend`."
      : parsedBody?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, parsedBody);
  }

  return parsedBody;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export { ApiError };
