const DEFAULT_PROD_API_BASE_URL = "https://vibematch-qqou.onrender.com/api";
const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:10000/api";

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function ensureApiPath(url) {
  const normalized = stripTrailingSlash(String(url || "").trim());
  if (!normalized || normalized === "/") {
    return "/api";
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    const pathname = stripTrailingSlash(parsed.pathname || "");
    if (!pathname || pathname === "/") {
      parsed.pathname = "/api";
      return stripTrailingSlash(parsed.toString());
    }
    return stripTrailingSlash(parsed.toString());
  } catch {
    return ensureApiPath(`/${normalized}`);
  }
}

function resolveApiBaseUrl() {
  const rawEnvValue = import.meta.env.VITE_API_BASE_URL;
  const fromEnv = typeof rawEnvValue === "string" ? ensureApiPath(rawEnvValue) : "";

  if (fromEnv) {
    return fromEnv;
  }

  if (import.meta.env.PROD) {
    return DEFAULT_PROD_API_BASE_URL;
  }

  return DEFAULT_DEV_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK_API ?? "false") === "true";
