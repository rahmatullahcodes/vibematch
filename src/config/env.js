const DEFAULT_PROD_API_BASE_URL = "/api";
const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:10000/api";

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function isLocalhostBaseUrl(url) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(url);
}

function isRenderHostUrl(url) {
  return /^https?:\/\/[^/]*onrender\.com(?:\/|$)/i.test(String(url || ""));
}

function ensureApiPath(url) {
  try {
    const parsed = new URL(url);
    const pathname = stripTrailingSlash(parsed.pathname || "");

    if (!pathname || pathname === "/") {
      parsed.pathname = "/api";
      return stripTrailingSlash(parsed.toString());
    }

    return stripTrailingSlash(parsed.toString());
  } catch {
    return stripTrailingSlash(url);
  }
}

function resolveApiBaseUrl() {
  if (import.meta.env.PROD) {
    // Production must always use same-origin /api proxy on Vercel.
    return DEFAULT_PROD_API_BASE_URL;
  }

  const rawEnvValue = import.meta.env.VITE_API_BASE_URL;
  const fromEnv = typeof rawEnvValue === "string" ? stripTrailingSlash(rawEnvValue.trim()) : "";

  if (!fromEnv) {
    return DEFAULT_DEV_API_BASE_URL;
  }

  return ensureApiPath(fromEnv);
}

export const API_BASE_URL = resolveApiBaseUrl();
export const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK_API ?? "false") === "true";
