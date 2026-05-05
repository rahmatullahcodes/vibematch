const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL =
  typeof envBaseUrl === "string" && envBaseUrl.trim()
    ? envBaseUrl.trim()
    : "https://vibematch-qqou.onrender.com/api";

export const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK_API ?? "false") === "true";
