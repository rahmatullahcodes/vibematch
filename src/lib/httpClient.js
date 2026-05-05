import { API_BASE_URL } from "../config/env";

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function request(path, options = {}) {
  const { method = "GET", data, token, headers = {} } = options;
  const endpoint = `${API_BASE_URL}${path}`;

  let response;
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
  } catch (error) {
    const networkMessage =
      "Unable to reach backend API. Check VITE_API_BASE_URL, backend status, and CORS settings.";
    throw new ApiError(networkMessage, 0, {
      endpoint,
      originalError: error?.message || "Network error",
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
