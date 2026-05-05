import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(__dirname, "data");
const STORAGE_FILE = join(DATA_DIR, "local-storage.json");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = match[2] ?? "";
    const hasSingleQuotes = value.startsWith("'") && value.endsWith("'");
    const hasDoubleQuotes = value.startsWith('"') && value.endsWith('"');
    if (hasSingleQuotes || hasDoubleQuotes) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }

    process.env[key] = value.replace(/\\n/g, "\n");
  }
}

loadEnvFile(join(ROOT_DIR, ".env"));
loadEnvFile(join(ROOT_DIR, ".env.local"));
loadEnvFile(join(__dirname, ".env"));
loadEnvFile(join(__dirname, ".env.local"));

function ensureStorageFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(STORAGE_FILE)) {
    writeFileSync(STORAGE_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
}

function readStorageSnapshot() {
  ensureStorageFile();
  try {
    const raw = readFileSync(STORAGE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorageSnapshot(snapshot) {
  writeFileSync(STORAGE_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
}

function createNodeLocalStorage() {
  return {
    getItem(key) {
      const snapshot = readStorageSnapshot();
      return Object.prototype.hasOwnProperty.call(snapshot, key) ? snapshot[key] : null;
    },
    setItem(key, value) {
      const snapshot = readStorageSnapshot();
      snapshot[key] = String(value);
      writeStorageSnapshot(snapshot);
    },
    removeItem(key) {
      const snapshot = readStorageSnapshot();
      delete snapshot[key];
      writeStorageSnapshot(snapshot);
    },
  };
}

if (typeof globalThis.window === "undefined") {
  globalThis.window = {};
}
globalThis.window.localStorage = createNodeLocalStorage();

const mockApi = await import("../src/mocks/mockApi.js");

const PORT = Number(process.env.PORT || 4000);
const API_PREFIX = "/api";
const WS_PATH = "/ws";
const CHAT_STATE_STORAGE_KEY = "spark_mock_chat_state";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const RAZORPAY_ENABLED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "spark_access_secret_dev";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "spark_refresh_secret_dev";
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const WS_OPEN_STATE = 1;
const wsClientsByUserId = new Map();
const wsServer = new WebSocketServer({
  noServer: true,
  path: WS_PATH,
  maxPayload: 64 * 1024,
});
const refreshTokenStore = new Map();
const rateLimitStore = new Map();
const RATE_LIMIT_RULES = [
  {
    key: "auth",
    match: (pathname) => /^\/api\/auth\/(login|register|refresh)$/.test(pathname),
    limit: 24,
    windowMs: 60_000,
  },
  {
    key: "chat_write",
    match: (pathname) =>
      /^\/api\/chat\/(messages|messages\/react|messages\/delete|messages\/report|user\/report|user\/block|user\/unblock|user\/unmatch|read|typing)$/.test(
        pathname,
      ),
    limit: 100,
    windowMs: 60_000,
  },
  {
    key: "calls_write",
    match: (pathname) => /^\/api\/calls\/(start|respond|signal)$/.test(pathname),
    limit: 80,
    windowMs: 60_000,
  },
  {
    key: "general_api",
    match: (pathname) => pathname.startsWith("/api/"),
    limit: 600,
    windowMs: 60_000,
  },
];

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];
const HTTP_ALLOWED_ORIGINS = parseOriginAllowlist(process.env.CORS_ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);
const WS_ALLOWED_ORIGINS = parseOriginAllowlist(
  process.env.WS_ALLOWED_ORIGINS || process.env.CORS_ALLOWED_ORIGINS,
  DEFAULT_ALLOWED_ORIGINS,
);
const MAX_JSON_BODY_BYTES = normalizePositiveInt(process.env.MAX_JSON_BODY_BYTES, 256 * 1024);
const MAX_JSON_DEPTH = normalizePositiveInt(process.env.MAX_JSON_DEPTH, 12);
const MAX_JSON_ARRAY_ITEMS = normalizePositiveInt(process.env.MAX_JSON_ARRAY_ITEMS, 600);
const MAX_JSON_TOTAL_KEYS = normalizePositiveInt(process.env.MAX_JSON_TOTAL_KEYS, 4000);
const SECURITY_AUDIT_MAX_ENTRIES = normalizePositiveInt(process.env.SECURITY_AUDIT_MAX_ENTRIES, 3000);
const FORBIDDEN_JSON_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const SUSPICIOUS_TEXT_PATTERNS = [
  /<\s*script\b/i,
  /<\s*iframe\b/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /<[^>]*\son[a-z]+\s*=/i,
  /%3c\s*script/i,
  /\x00/,
];
const SUSPICIOUS_SCAN_SKIP_KEYS = new Set(["password", "refreshToken", "signature", "razorpay_signature"]);
const MODERATION_REPORT_STATUS_VALUES = new Set(["all", "open", "under_review", "resolved", "dismissed"]);
const MODERATION_USER_STATUS_VALUES = new Set(["all", "active", "suspended", "banned"]);
const MODERATION_REPORT_ACTION_VALUES = new Set(["dismiss", "review", "warn", "suspend", "ban"]);
const MODERATION_USER_ACTION_VALUES = new Set(["activate", "suspend", "ban"]);
const securityAuditEntries = [];

function normalizePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.round(parsed);
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return "";
  }
}

function parseOriginAllowlist(rawValue, fallback = []) {
  const fallbackOrigins = fallback.map((item) => normalizeOrigin(item)).filter(Boolean);
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return new Set(fallbackOrigins);
  }

  const parsedOrigins = rawValue
    .split(",")
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);
  return new Set(parsedOrigins.length ? parsedOrigins : fallbackOrigins);
}

function isOriginAllowed(origin, allowlist) {
  if (!origin) {
    return true;
  }
  return allowlist.has(origin);
}

function setCors(request, response) {
  const requestOrigin = normalizeOrigin(request.headers.origin);
  const originAllowed = isOriginAllowed(requestOrigin, HTTP_ALLOWED_ORIGINS);

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Max-Age", "600");
  if (requestOrigin && originAllowed) {
    response.setHeader("Access-Control-Allow-Origin", requestOrigin);
  }

  return {
    originAllowed,
    requestOrigin,
  };
}

function setSecurityHeaders(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("X-DNS-Prefetch-Control", "off");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  response.setHeader("Cross-Origin-Resource-Policy", "same-site");
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

  const forwardedProtoRaw = request.headers["x-forwarded-proto"];
  const forwardedProto = typeof forwardedProtoRaw === "string" ? forwardedProtoRaw.split(",")[0].trim().toLowerCase() : "";
  if (forwardedProto === "https") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function sendError(response, status, message) {
  sendJson(response, status, { message });
}

function getToken(request) {
  const header = request.headers.authorization;
  if (!header || typeof header !== "string") {
    return "";
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return "";
  }
  return token;
}

function parseUserIdFromToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    return "";
  }

  if (token.startsWith("mock|") || token.startsWith("srv|")) {
    const parts = token.split("|");
    if (parts.length >= 3) {
      try {
        return decodeURIComponent(parts[1] || "");
      } catch {
        return parts[1] || "";
      }
    }
  }

  if (token.startsWith("mock_") || token.startsWith("srv_")) {
    const parts = token.split("_");
    if (parts.length >= 3) {
      return parts.slice(1, -1).join("_");
    }
  }

  return "";
}

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket?.remoteAddress || "unknown";
}

function sanitizeLogString(value, maxLength = 240) {
  if (typeof value !== "string") {
    return "";
  }
  const clean = value.replace(/[\r\n\t]/g, " ").trim();
  if (!clean) {
    return "";
  }
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
}

function hashAuditIp(ip) {
  const normalizedIp = sanitizeLogString(ip, 80) || "unknown";
  return crypto.createHash("sha256").update(`${ACCESS_TOKEN_SECRET}|${normalizedIp}`).digest("hex").slice(0, 24);
}

function sanitizeAuditMeta(value, depth = 0) {
  if (depth > 2) {
    return "[truncated]";
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return sanitizeLogString(value, 240);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeAuditMeta(item, depth + 1));
  }
  if (typeof value === "object") {
    const safeObject = {};
    for (const [key, nestedValue] of Object.entries(value).slice(0, 25)) {
      safeObject[sanitizeLogString(key, 60) || "key"] = sanitizeAuditMeta(nestedValue, depth + 1);
    }
    return safeObject;
  }
  return String(value);
}

function pushSecurityAuditEvent(event) {
  securityAuditEntries.push(event);
  if (securityAuditEntries.length > SECURITY_AUDIT_MAX_ENTRIES) {
    securityAuditEntries.splice(0, securityAuditEntries.length - SECURITY_AUDIT_MAX_ENTRIES);
  }
}

function logSecurityEvent(request, eventType, severity = "info", details = {}) {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const tokenUserId = parseUserIdFromToken(getToken(request));
  const eventPayload = {
    at: new Date().toISOString(),
    type: sanitizeLogString(eventType, 80) || "security_event",
    severity: sanitizeLogString(severity, 20) || "info",
    method: sanitizeLogString(request.method || "GET", 10),
    path: sanitizeLogString(requestUrl.pathname, 180),
    ipHash: hashAuditIp(getClientIp(request)),
    origin: normalizeOrigin(request.headers.origin) || "none",
    userId: sanitizeLogString(tokenUserId, 100) || "anonymous",
    details: sanitizeAuditMeta(details),
  };

  pushSecurityAuditEvent(eventPayload);
  console.log(`[SECURITY_AUDIT] ${JSON.stringify(eventPayload)}`);
}

function createAccessToken(userId) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + ACCESS_TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(8).toString("hex");
  const payload = `${userId}.${issuedAt}.${expiresAt}.${nonce}`;
  const signature = crypto.createHmac("sha256", ACCESS_TOKEN_SECRET).update(payload).digest("hex");
  return `srv|${encodeURIComponent(userId)}|${issuedAt}|${expiresAt}|${nonce}|${signature}`;
}

function verifyAccessToken(token) {
  if (typeof token !== "string" || !token.startsWith("srv|")) {
    return {
      ok: false,
      userId: "",
      reason: "invalid token format",
    };
  }

  const parts = token.split("|");
  if (parts.length < 6) {
    return {
      ok: false,
      userId: "",
      reason: "invalid token shape",
    };
  }

  const encodedUserId = parts[1] || "";
  const issuedAt = Number(parts[2]);
  const expiresAt = Number(parts[3]);
  const nonce = parts[4] || "";
  const signature = parts[5] || "";
  let userId = "";
  try {
    userId = decodeURIComponent(encodedUserId);
  } catch {
    userId = encodedUserId;
  }

  if (!userId || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || !nonce || !signature) {
    return {
      ok: false,
      userId: "",
      reason: "invalid token payload",
    };
  }

  if (expiresAt <= Date.now()) {
    return {
      ok: false,
      userId,
      reason: "token expired",
    };
  }

  const payload = `${userId}.${issuedAt}.${expiresAt}.${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", ACCESS_TOKEN_SECRET).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) {
    return {
      ok: false,
      userId,
      reason: "signature mismatch",
    };
  }

  if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return {
      ok: false,
      userId,
      reason: "signature mismatch",
    };
  }

  return {
    ok: true,
    userId,
    issuedAt,
    expiresAt,
  };
}

function resolveRequestToken(rawToken) {
  if (!rawToken) {
    return "";
  }

  if (rawToken.startsWith("srv|")) {
    const verification = verifyAccessToken(rawToken);
    if (!verification.ok) {
      throw new Error("Session expired. Please login again.");
    }
    return rawToken;
  }

  return rawToken;
}

function createRefreshToken(userId) {
  const expiresAt = Date.now() + REFRESH_TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `${userId}.${expiresAt}.${nonce}`;
  const signature = crypto.createHmac("sha256", REFRESH_TOKEN_SECRET).update(payload).digest("hex");
  const refreshToken = `rfh|${encodeURIComponent(userId)}|${expiresAt}|${nonce}|${signature}`;
  refreshTokenStore.set(refreshToken, {
    userId,
    expiresAt,
  });
  return refreshToken;
}

function verifyRefreshToken(refreshToken) {
  if (typeof refreshToken !== "string" || !refreshToken.startsWith("rfh|")) {
    return {
      ok: false,
      userId: "",
    };
  }

  const record = refreshTokenStore.get(refreshToken);
  if (!record) {
    return {
      ok: false,
      userId: "",
    };
  }

  const parts = refreshToken.split("|");
  if (parts.length < 5) {
    refreshTokenStore.delete(refreshToken);
    return {
      ok: false,
      userId: "",
    };
  }

  const encodedUserId = parts[1] || "";
  const expiresAt = Number(parts[2]);
  const nonce = parts[3] || "";
  const signature = parts[4] || "";
  let userId = "";
  try {
    userId = decodeURIComponent(encodedUserId);
  } catch {
    userId = encodedUserId;
  }

  const payload = `${userId}.${expiresAt}.${nonce}`;
  const expectedSignature = crypto.createHmac("sha256", REFRESH_TOKEN_SECRET).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (
    !userId ||
    !Number.isFinite(expiresAt) ||
    !nonce ||
    !signature ||
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    refreshTokenStore.delete(refreshToken);
    return {
      ok: false,
      userId: "",
    };
  }

  if (expiresAt <= Date.now()) {
    refreshTokenStore.delete(refreshToken);
    return {
      ok: false,
      userId: "",
    };
  }

  if (record.userId !== userId) {
    refreshTokenStore.delete(refreshToken);
    return {
      ok: false,
      userId: "",
    };
  }

  return {
    ok: true,
    userId,
  };
}

function enforceRateLimit(request, pathname) {
  const rule = RATE_LIMIT_RULES.find((entry) => entry.match(pathname));
  if (!rule) {
    return;
  }

  const ip = getClientIp(request);
  const key = `${rule.key}:${ip}`;
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + rule.windowMs,
    });
    return;
  }

  if (current.count >= rule.limit) {
    throw new Error("Rate limit exceeded. Please try again shortly.");
  }

  current.count += 1;
  rateLimitStore.set(key, current);
}

function containsSuspiciousText(value) {
  if (typeof value !== "string" || !value) {
    return false;
  }
  return SUSPICIOUS_TEXT_PATTERNS.some((pattern) => pattern.test(value));
}

function ensureTrimmedString(value, fieldName, maxLength = 300, options = {}) {
  const { allowSuspicious = false, required = false } = options;
  if (typeof value !== "string") {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }
    return "";
  }
  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new Error(`${fieldName} is required.`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }
  if (!allowSuspicious && trimmed && containsSuspiciousText(trimmed)) {
    throw new Error(`${fieldName} contains suspicious content.`);
  }
  return trimmed;
}

function ensureValidEmail(value, fieldName = "email") {
  const normalized = ensureTrimmedString(value, fieldName, 160, { required: true }).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalized)) {
    throw new Error("Invalid email format.");
  }
  return normalized;
}

function ensureSafeHttpUrl(value, fieldName = "url", maxLength = 500) {
  const trimmed = ensureTrimmedString(value, fieldName, maxLength);
  if (!trimmed) {
    return "";
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error(`${fieldName} must be a valid URL.`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`${fieldName} protocol is not allowed.`);
  }
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error(`${fieldName} cannot include credentials.`);
  }
  if (containsSuspiciousText(parsedUrl.href)) {
    throw new Error(`${fieldName} contains suspicious content.`);
  }

  return parsedUrl.href;
}

function validatePayloadTextSafety(value, path = "payload", keyHint = "") {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === "string") {
    if (SUSPICIOUS_SCAN_SKIP_KEYS.has(keyHint)) {
      return;
    }
    if (containsSuspiciousText(value)) {
      throw new Error(`${path} contains suspicious content.`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => validatePayloadTextSafety(item, `${path}[${index}]`, keyHint));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, nestedValue]) => {
      validatePayloadTextSafety(nestedValue, `${path}.${key}`, key);
    });
  }
}

function ensureEnumString(value, fieldName, allowedValues, maxLength = 40, required = false) {
  const normalized = ensureTrimmedString(value, fieldName, maxLength, { required }).toLowerCase();
  if (!normalized) {
    return "";
  }
  if (!allowedValues.has(normalized)) {
    throw new Error(`Invalid ${fieldName}.`);
  }
  return normalized;
}

function ensureBoundedInteger(value, fieldName, min, max, fallbackValue = min) {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}.`);
  }
  return parsed;
}

function validateQueryForRoute(pathname, searchParams) {
  if (pathname === `${API_PREFIX}/moderation/reports`) {
    ensureEnumString(searchParams.get("status") || "all", "status", MODERATION_REPORT_STATUS_VALUES, 24, true);
  }

  if (pathname === `${API_PREFIX}/moderation/users`) {
    ensureEnumString(searchParams.get("status") || "all", "status", MODERATION_USER_STATUS_VALUES, 24, true);
    ensureTrimmedString(searchParams.get("query") || "", "query", 120);
  }

  if (pathname === `${API_PREFIX}/security/audit`) {
    ensureBoundedInteger(searchParams.get("limit"), "limit", 1, 500, 200);
  }
}

function validatePayloadForRoute(pathname, body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Payload must be a JSON object.");
  }
  validatePayloadTextSafety(body);

  if (pathname === `${API_PREFIX}/chat/messages`) {
    const text = ensureTrimmedString(body.text, "text", 1500, { required: true });
    if (!text) {
      throw new Error("Message cannot be empty.");
    }
  }

  if (pathname === `${API_PREFIX}/auth/register`) {
    ensureTrimmedString(body.name, "name", 80, { required: true });
    ensureValidEmail(body.email, "email");
    const password = ensureTrimmedString(body.password, "password", 120, { required: true, allowSuspicious: true });
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    ensureSafeHttpUrl(body.avatar, "avatar", 500);
  }

  if (pathname === `${API_PREFIX}/auth/login`) {
    ensureValidEmail(body.email, "email");
    ensureTrimmedString(body.password, "password", 120, { required: true, allowSuspicious: true });
  }

  if (pathname === `${API_PREFIX}/auth/profile`) {
    ensureTrimmedString(body.name, "name", 80);
    ensureTrimmedString(body.city, "city", 80);
    ensureTrimmedString(body.bio, "bio", 600);
    ensureSafeHttpUrl(body.avatar, "avatar", 500);
  }

  if (pathname === `${API_PREFIX}/discover/post-comment` || pathname === `${API_PREFIX}/discover/reel-comment`) {
    const text = ensureTrimmedString(body.text, "text", 280, { required: true });
    if (!text) {
      throw new Error("Comment cannot be empty.");
    }
  }

  if (pathname === `${API_PREFIX}/discover/search`) {
    ensureTrimmedString(body.query, "query", 80);
    ensureTrimmedString(body.city, "city", 40);
    ensureTrimmedString(body.intent, "intent", 24);
    ensureTrimmedString(body.interest, "interest", 30);
  }

  if (pathname === `${API_PREFIX}/calls/start`) {
    ensureTrimmedString(body.peerUserId, "peerUserId", 120);
    ensureTrimmedString(body.type, "type", 10);
  }

  if (pathname === `${API_PREFIX}/calls/respond`) {
    ensureTrimmedString(body.sessionId, "sessionId", 120);
    ensureTrimmedString(body.action, "action", 12);
  }

  if (pathname === `${API_PREFIX}/calls/signal`) {
    ensureTrimmedString(body.sessionId, "sessionId", 120);
    ensureTrimmedString(body.toUserId, "toUserId", 120);
    ensureTrimmedString(body.signalType, "signalType", 24);
  }

  if (pathname === `${API_PREFIX}/moderation/reports/resolve`) {
    ensureTrimmedString(body.reportId, "reportId", 120, { required: true });
    ensureEnumString(body.action, "action", MODERATION_REPORT_ACTION_VALUES, 24, true);
    ensureTrimmedString(body.note, "note", 400);
    if (body.suspendHours !== undefined && body.suspendHours !== null) {
      const suspendHours = Number(body.suspendHours);
      if (!Number.isInteger(suspendHours) || suspendHours < 1 || suspendHours > 24 * 30) {
        throw new Error("suspendHours must be an integer between 1 and 720.");
      }
    }
  }

  if (pathname === `${API_PREFIX}/moderation/users/status`) {
    ensureTrimmedString(body.targetUserId, "targetUserId", 120, { required: true });
    ensureEnumString(body.action, "action", MODERATION_USER_ACTION_VALUES, 24, true);
    ensureTrimmedString(body.reason, "reason", 300);
  }
}

function issueServerAuthPayload(user) {
  const userId = user?.id;
  if (!userId) {
    throw new Error("Unable to create session.");
  }
  const token = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);
  const verification = verifyAccessToken(token);
  return {
    token,
    refreshToken,
    tokenExpiresAt: verification.expiresAt ? new Date(verification.expiresAt).toISOString() : null,
    user,
  };
}

async function resolveWsUserId(token) {
  if (!token) {
    return "";
  }

  try {
    const safeToken = resolveRequestToken(token);
    const session = await mockApi.getCurrentUser(safeToken);
    const userId = session?.user?.id;
    return typeof userId === "string" ? userId : "";
  } catch {
    return "";
  }
}

function registerWsClient(userId, socket) {
  if (!userId) {
    return;
  }
  const current = wsClientsByUserId.get(userId) ?? new Set();
  const wasOffline = current.size === 0;
  current.add(socket);
  wsClientsByUserId.set(userId, current);
  if (wasOffline) {
    broadcastPresenceEvent(userId, true);
  }
}

function unregisterWsClient(userId, socket) {
  if (!userId) {
    return;
  }
  const current = wsClientsByUserId.get(userId);
  if (!current) {
    return;
  }
  current.delete(socket);
  if (current.size === 0) {
    wsClientsByUserId.delete(userId);
    broadcastPresenceEvent(userId, false);
  }
}

function sendWsEventToUser(userId, payload) {
  if (!userId) {
    return;
  }
  const clients = wsClientsByUserId.get(userId);
  if (!clients || clients.size === 0) {
    return;
  }

  const serializedPayload = JSON.stringify(payload);
  for (const socket of clients) {
    if (socket.readyState !== WS_OPEN_STATE) {
      continue;
    }
    try {
      socket.send(serializedPayload);
    } catch {
      // Ignore websocket send errors; stale sockets are cleaned on close/error.
    }
  }
}

function resolvePeerThreadInfo(userId, threadId) {
  if (!userId || !threadId) {
    return null;
  }

  const snapshot = readStorageSnapshot();
  const rawChatState = snapshot[CHAT_STATE_STORAGE_KEY];
  if (typeof rawChatState !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(rawChatState);
    const threadList = parsed?.byUser?.[userId]?.threads;
    if (!Array.isArray(threadList)) {
      return null;
    }

    const directThread = threadList.find((thread) => thread.id === threadId);
    if (
      !directThread ||
      directThread.kind !== "direct" ||
      typeof directThread.peerUserId !== "string" ||
      typeof directThread.peerThreadId !== "string" ||
      !directThread.peerUserId ||
      !directThread.peerThreadId
    ) {
      return null;
    }

    return {
      peerUserId: directThread.peerUserId,
      peerThreadId: directThread.peerThreadId,
    };
  } catch {
    return null;
  }
}

function broadcastChatMessageEvent(userId, threadId) {
  if (!userId || !threadId) {
    return;
  }

  const peerThread = resolvePeerThreadInfo(userId, threadId);
  if (!peerThread) {
    return;
  }

  sendWsEventToUser(peerThread.peerUserId, {
    type: "chat_message",
    threadId: peerThread.peerThreadId,
    fromUserId: userId,
    at: new Date().toISOString(),
  });
}

function broadcastMatchEvent(primaryUserId, matchedUserId) {
  if (!primaryUserId || !matchedUserId) {
    return;
  }

  const eventPayload = {
    type: "chat_thread_created",
    at: new Date().toISOString(),
  };

  sendWsEventToUser(primaryUserId, eventPayload);
  sendWsEventToUser(matchedUserId, eventPayload);
}

function broadcastReadEvent(peerUserId, peerThreadId, messageIds) {
  if (!peerUserId || !peerThreadId || !Array.isArray(messageIds) || !messageIds.length) {
    return;
  }

  sendWsEventToUser(peerUserId, {
    type: "chat_read",
    threadId: peerThreadId,
    messageIds,
    at: new Date().toISOString(),
  });
}

function getDirectPeerUserIds(userId) {
  if (!userId) {
    return [];
  }

  const snapshot = readStorageSnapshot();
  const rawChatState = snapshot[CHAT_STATE_STORAGE_KEY];
  if (typeof rawChatState !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawChatState);
    const threadList = parsed?.byUser?.[userId]?.threads;
    if (!Array.isArray(threadList)) {
      return [];
    }
    const peerIds = threadList
      .filter((thread) => thread?.kind === "direct" && typeof thread.peerUserId === "string" && thread.peerUserId)
      .map((thread) => thread.peerUserId);
    return Array.from(new Set(peerIds));
  } catch {
    return [];
  }
}

function broadcastPresenceEvent(userId, isOnline) {
  if (!userId) {
    return;
  }

  const peers = getDirectPeerUserIds(userId);
  peers.forEach((peerUserId) => {
    sendWsEventToUser(peerUserId, {
      type: "chat_presence",
      userId,
      isOnline: Boolean(isOnline),
      at: new Date().toISOString(),
    });
  });
}

function broadcastTypingEvent(userId, threadId, isTyping) {
  if (!userId || !threadId) {
    return;
  }

  const peerThread = resolvePeerThreadInfo(userId, threadId);
  if (!peerThread) {
    return;
  }

  sendWsEventToUser(peerThread.peerUserId, {
    type: "chat_typing",
    threadId: peerThread.peerThreadId,
    fromUserId: userId,
    isTyping: Boolean(isTyping),
    at: new Date().toISOString(),
  });
}

function broadcastCallUpdateEvent({ userId, peerUserId, sessionId, status, callType }) {
  if (!userId || !sessionId) {
    return;
  }

  const payload = {
    type: "call_update",
    sessionId,
    status: typeof status === "string" ? status : "",
    callType: typeof callType === "string" ? callType : "voice",
    fromUserId: userId,
    peerUserId: typeof peerUserId === "string" ? peerUserId : "",
    at: new Date().toISOString(),
  };

  sendWsEventToUser(userId, payload);
  if (peerUserId) {
    sendWsEventToUser(peerUserId, payload);
  }
}

function broadcastCallSignalEvent({ fromUserId, toUserId, sessionId, signalType, description, candidate, callType }) {
  if (!fromUserId || !toUserId || !sessionId || !signalType) {
    return;
  }

  sendWsEventToUser(toUserId, {
    type: "call_signal",
    fromUserId,
    toUserId,
    sessionId,
    signalType,
    callType: typeof callType === "string" ? callType : "voice",
    description: description && typeof description === "object" ? description : null,
    candidate: candidate && typeof candidate === "object" ? candidate : null,
    at: new Date().toISOString(),
  });
}

function isApiJsonRequest(method, pathname) {
  return method === "POST" && pathname.startsWith(API_PREFIX);
}

function enforceJsonRequestContentType(request, method, pathname) {
  if (!isApiJsonRequest(method, pathname)) {
    return;
  }

  const contentLengthHeader = request.headers["content-length"];
  const contentLength = Number(contentLengthHeader);
  const hasTransferEncoding = Boolean(request.headers["transfer-encoding"]);
  const hasBody = (Number.isFinite(contentLength) && contentLength > 0) || hasTransferEncoding;
  if (!hasBody) {
    return;
  }

  const contentType = request.headers["content-type"];
  if (typeof contentType !== "string" || !contentType.toLowerCase().includes("application/json")) {
    throw new Error("Unsupported content type. Use application/json.");
  }
}

function validateJsonPayloadShape(value, depth = 0, state = { totalKeys: 0 }) {
  if (depth > MAX_JSON_DEPTH) {
    throw new Error("JSON payload is too deeply nested.");
  }
  if (value === null) {
    return;
  }

  const valueType = typeof value;
  if (valueType === "string" || valueType === "boolean") {
    return;
  }
  if (valueType === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("JSON payload contains invalid numeric values.");
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_JSON_ARRAY_ITEMS) {
      throw new Error("JSON array is too large.");
    }
    for (const item of value) {
      validateJsonPayloadShape(item, depth + 1, state);
    }
    return;
  }
  if (valueType !== "object") {
    throw new Error("JSON payload contains unsupported value types.");
  }

  const keys = Object.keys(value);
  state.totalKeys += keys.length;
  if (state.totalKeys > MAX_JSON_TOTAL_KEYS) {
    throw new Error("JSON payload contains too many keys.");
  }

  for (const key of keys) {
    if (FORBIDDEN_JSON_KEYS.has(key)) {
      throw new Error("Payload contains forbidden object keys.");
    }
    if (key.length > 120) {
      throw new Error("Payload key is too long.");
    }
    validateJsonPayloadShape(value[key], depth + 1, state);
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let ended = false;

    request.on("data", (chunk) => {
      if (ended) {
        return;
      }
      totalBytes += chunk.length;
      if (totalBytes > MAX_JSON_BODY_BYTES) {
        ended = true;
        reject(new Error("Payload too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (ended) {
        return;
      }

      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        validateJsonPayloadShape(parsed);
        resolve(parsed);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error("Invalid JSON payload"));
          return;
        }
        reject(error instanceof Error ? error : new Error("Invalid JSON payload"));
      }
    });

    request.on("error", reject);
  });
}

function resolveStatusFromMessage(message) {
  if (!message) {
    return 500;
  }
  if (message.includes("Origin not allowed") || message.includes("WebSocket origin not allowed")) {
    return 403;
  }
  if (message.includes("Unsupported content type")) {
    return 415;
  }
  if (message.includes("Payload too large")) {
    return 413;
  }
  if (message.includes("Admin access required")) {
    return 403;
  }
  if (message.includes("Rate limit exceeded")) {
    return 429;
  }
  if (message.includes("suspended") || message.includes("banned")) {
    return 403;
  }
  if (message.includes("required")) {
    return 400;
  }
  if (message.includes("already exists")) {
    return 409;
  }
  if (message.includes("Invalid email or password") || message.includes("Session expired")) {
    return 401;
  }
  if (message.includes("not found")) {
    return 404;
  }
  if (message.includes("Invalid swipe action")) {
    return 400;
  }
  if (message.includes("Invalid signalType") || message.includes("Invalid signal payload")) {
    return 400;
  }
  if (message.includes("cannot be empty")) {
    return 400;
  }
  if (message.startsWith("Invalid ") || message.includes(" must be between ")) {
    return 400;
  }
  if (
    message.includes("suspicious content") ||
    message.includes("Invalid email format") ||
    message.includes("must be a valid URL") ||
    message.includes("protocol is not allowed") ||
    message.includes("cannot include credentials")
  ) {
    return 400;
  }
  if (message.includes("too long")) {
    return 400;
  }
  if (
    message.includes("Payload must be a JSON object") ||
    message.includes("forbidden object keys") ||
    message.includes("too deeply nested") ||
    message.includes("too many keys") ||
    message.includes("array is too large") ||
    message.includes("unsupported value types") ||
    message.includes("invalid numeric values")
  ) {
    return 400;
  }
  if (message.includes("require checkout") || message.includes("does not require payment")) {
    return 400;
  }
  if (message.includes("payment signature") || message.includes("order reference")) {
    return 400;
  }
  if (message.includes("Cannot call") || message.includes("cannot be accepted") || message.includes("cannot be")) {
    return 400;
  }
  if (message.includes("unavailable")) {
    return 403;
  }
  return 500;
}

function buildRazorpayAuthHeader() {
  const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function createRazorpayOrder(payload) {
  const response = await fetch(RAZORPAY_ORDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildRazorpayAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  const parsedBody = rawText ? safeJsonParse(rawText) : null;
  if (!response.ok) {
    const message = parsedBody?.error?.description || parsedBody?.message || "Failed to create Razorpay order.";
    throw new Error(message);
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

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;
  const method = request.method || "GET";
  const rawToken = getToken(request);
  const token = resolveRequestToken(rawToken);

  enforceRateLimit(request, pathname);
  validateQueryForRoute(pathname, requestUrl.searchParams);

  if (method === "POST" && pathname === `${API_PREFIX}/auth/register`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.register(body);
    sendJson(response, 200, issueServerAuthPayload(result.user));
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/auth/login`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.login(body);
    sendJson(response, 200, issueServerAuthPayload(result.user));
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/auth/refresh`) {
    const body = await readJsonBody(request);
    const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";
    if (!refreshToken) {
      throw new Error("refreshToken is required.");
    }
    const refreshVerification = verifyRefreshToken(refreshToken);
    if (!refreshVerification.ok || !refreshVerification.userId) {
      throw new Error("Session expired. Please login again.");
    }

    const lookupToken = createAccessToken(refreshVerification.userId);
    const session = await mockApi.getCurrentUser(lookupToken);
    sendJson(response, 200, issueServerAuthPayload(session?.user));
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/auth/me`) {
    const result = await mockApi.getCurrentUser(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/subscription`) {
    const result = await mockApi.getSubscription(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/subscription/update`) {
    const body = await readJsonBody(request);
    const result = await mockApi.updateSubscription(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/subscription/checkout`) {
    const body = await readJsonBody(request);
    if (!RAZORPAY_ENABLED) {
      const result = await mockApi.createSubscriptionCheckout(token, body);
      sendJson(response, 200, result);
      return;
    }

    const planId = typeof body?.planId === "string" ? body.planId.trim().toLowerCase() : "";
    if (!planId) {
      throw new Error("planId is required.");
    }

    const subscriptionSnapshot = await mockApi.getSubscription(token);
    const plans = Array.isArray(subscriptionSnapshot?.plans) ? subscriptionSnapshot.plans : [];
    const selectedPlan = plans.find((plan) => typeof plan?.id === "string" && plan.id === planId);
    if (!selectedPlan) {
      throw new Error("Plan not found.");
    }
    if (selectedPlan.id === "starter") {
      throw new Error("Starter plan does not require payment.");
    }

    const amount = Math.max(0, Math.round(Number(selectedPlan.monthlyPrice || 0) * 100));
    if (!amount) {
      throw new Error("Invalid plan amount.");
    }

    const receipt = `spark_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt,
      notes: {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      },
    });

    const result = await mockApi.createSubscriptionCheckout(token, {
      planId: selectedPlan.id,
      amount: order.amount,
      currency: order.currency,
      provider: "Razorpay",
      orderRef: order.receipt || receipt,
      gatewayOrderId: order.id,
      keyId: RAZORPAY_KEY_ID,
      description: `${selectedPlan.name} subscription`,
    });
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/subscription/checkout/confirm`) {
    const body = await readJsonBody(request);
    if (!RAZORPAY_ENABLED) {
      const result = await mockApi.confirmSubscriptionCheckout(token, body);
      sendJson(response, 200, result);
      return;
    }

    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
    const paymentId = typeof body?.paymentId === "string" ? body.paymentId : body?.razorpay_payment_id || "";
    const orderId = typeof body?.orderId === "string" ? body.orderId : body?.razorpay_order_id || "";
    const signature = typeof body?.signature === "string" ? body.signature : body?.razorpay_signature || "";

    if (!sessionId || !paymentId || !orderId || !signature) {
      throw new Error("sessionId, paymentId, orderId, and signature are required.");
    }

    const subscriptionSnapshot = await mockApi.getSubscription(token);
    const checkoutSession = subscriptionSnapshot?.checkoutSession;
    if (!checkoutSession || checkoutSession.id !== sessionId) {
      throw new Error("Checkout session not found.");
    }
    if (checkoutSession.gatewayOrderId && checkoutSession.gatewayOrderId !== orderId) {
      throw new Error("Invalid order reference.");
    }
    if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
      throw new Error("Invalid payment signature.");
    }

    const result = await mockApi.confirmSubscriptionCheckout(token, {
      sessionId,
      paymentId,
      orderId,
    });
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/auth/profile`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.updateProfile(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/auth/verify`) {
    const body = await readJsonBody(request);
    const result = await mockApi.completeVerification(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/discover/feed`) {
    const result = await mockApi.getDiscoverFeed(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/follow`) {
    const body = await readJsonBody(request);
    const result = await mockApi.toggleFollowAuthor(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/post-like`) {
    const body = await readJsonBody(request);
    const result = await mockApi.togglePostLike(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/post-comment`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.addPostComment(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/post-share`) {
    const body = await readJsonBody(request);
    const result = await mockApi.sharePost(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/discover/reels`) {
    const result = await mockApi.getReelsFeed(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/reel-comment`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.addReelComment(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/reel-share`) {
    const body = await readJsonBody(request);
    const result = await mockApi.shareReel(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/discover/search`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.searchDiscoverProfiles(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/discover/recommendations`) {
    const result = await mockApi.getSmartRecommendations(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/calls`) {
    const result = await mockApi.getCallDashboard(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/calls/start`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.startCallSession(token, body);
    sendJson(response, 200, result);
    const userId = parseUserIdFromToken(token);
    const session = result?.session;
    if (userId && session?.id) {
      broadcastCallUpdateEvent({
        userId,
        peerUserId: session?.peerUserId || body?.peerUserId || "",
        sessionId: session.id,
        status: session.status || "ringing",
        callType: session.type || "voice",
      });
    }
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/calls/respond`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.respondCallSession(token, body);
    sendJson(response, 200, result);
    const userId = parseUserIdFromToken(token);
    const session = result?.session;
    if (userId && session?.id) {
      broadcastCallUpdateEvent({
        userId,
        peerUserId: session?.peerUserId || "",
        sessionId: session.id,
        status: session.status || "",
        callType: session.type || "voice",
      });
    }
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/calls/signal`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);

    const fromUserId = parseUserIdFromToken(token);
    if (!fromUserId) {
      throw new Error("Session expired. Please login again.");
    }

    const toUserId = typeof body?.toUserId === "string" ? body.toUserId.trim() : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    const signalType = typeof body?.signalType === "string" ? body.signalType.trim().toLowerCase() : "";
    if (!toUserId || !sessionId || !signalType) {
      throw new Error("toUserId, sessionId, and signalType are required.");
    }
    if (!["offer", "answer", "ice_candidate"].includes(signalType)) {
      throw new Error("Invalid signalType.");
    }

    const description = body?.description && typeof body.description === "object" ? body.description : null;
    const candidate = body?.candidate && typeof body.candidate === "object" ? body.candidate : null;

    if ((signalType === "offer" || signalType === "answer") && !description) {
      throw new Error("Invalid signal payload.");
    }
    if (signalType === "ice_candidate" && !candidate) {
      throw new Error("Invalid signal payload.");
    }

    broadcastCallSignalEvent({
      fromUserId,
      toUserId,
      sessionId,
      signalType,
      description,
      candidate,
      callType: typeof body?.callType === "string" ? body.callType : "voice",
    });

    sendJson(response, 200, { success: true });
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/swipe/candidates`) {
    const result = await mockApi.getSwipeCandidates(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/swipe/action`) {
    const body = await readJsonBody(request);
    const result = await mockApi.sendSwipeAction(token, body);
    sendJson(response, 200, result);
    if (result?.matched && result?.matchUser?.id) {
      const userId = parseUserIdFromToken(token);
      if (userId) {
        broadcastMatchEvent(userId, result.matchUser.id);
      }
    }
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/chat/threads`) {
    const result = await mockApi.getChatThreads(token);
    sendJson(response, 200, result);
    return;
  }

  const threadMessageMatch = pathname.match(/^\/api\/chat\/threads\/([^/]+)\/messages$/);
  if (method === "GET" && threadMessageMatch) {
    const threadId = decodeURIComponent(threadMessageMatch[1]);
    const result = await mockApi.getChatMessages(token, threadId);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/messages`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.sendMessage(token, body);
    sendJson(response, 200, result);
    const userId = parseUserIdFromToken(token);
    if (userId) {
      broadcastChatMessageEvent(userId, body?.threadId);
    }
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/typing`) {
    const body = await readJsonBody(request);
    const result = await mockApi.sendTypingSignal(token, body);
    const userId = parseUserIdFromToken(token);
    if (userId && body?.threadId) {
      broadcastTypingEvent(userId, body.threadId, Boolean(body?.isTyping));
    }
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/read`) {
    const body = await readJsonBody(request);
    const result = await mockApi.markThreadRead(token, body?.threadId);
    sendJson(response, 200, result);
    if (result?.peerUserId && result?.peerThreadId && result?.updatedMessageIds?.length) {
      broadcastReadEvent(result.peerUserId, result.peerThreadId, result.updatedMessageIds);
    }
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/messages/react`) {
    const body = await readJsonBody(request);
    const result = await mockApi.toggleMessageReaction(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/messages/delete`) {
    const body = await readJsonBody(request);
    const result = await mockApi.deleteMessage(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/messages/report`) {
    const body = await readJsonBody(request);
    const result = await mockApi.reportMessage(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/user/report`) {
    const body = await readJsonBody(request);
    const result = await mockApi.reportUser(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/chat/user/blocked`) {
    const result = await mockApi.getBlockedUsers(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/user/block`) {
    const body = await readJsonBody(request);
    const result = await mockApi.blockUser(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/user/unblock`) {
    const body = await readJsonBody(request);
    const result = await mockApi.unblockUser(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/chat/user/unmatch`) {
    const body = await readJsonBody(request);
    const result = await mockApi.unmatchUser(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/notifications`) {
    const result = await mockApi.getNotifications(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/notifications/read`) {
    const body = await readJsonBody(request);
    const result = await mockApi.markNotificationRead(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/notifications/read-all`) {
    const result = await mockApi.markAllNotificationsRead(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/notifications/preferences`) {
    const result = await mockApi.getNotificationPreferences(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/notifications/preferences`) {
    const body = await readJsonBody(request);
    const result = await mockApi.updateNotificationPreferences(token, body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/moderation/reports`) {
    const status = requestUrl.searchParams.get("status") || "all";
    const result = await mockApi.getModerationReports(token, { status });
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/moderation/reports/resolve`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.resolveModerationReport(token, body);
    logSecurityEvent(request, "moderation_report_resolve_success", "info", {
      reportId: body?.reportId || "",
      action: body?.action || "",
    });
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/moderation/audit`) {
    const result = await mockApi.getModerationAudit(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && pathname === `${API_PREFIX}/moderation/users/status`) {
    const body = await readJsonBody(request);
    validatePayloadForRoute(pathname, body);
    const result = await mockApi.updateUserModerationStatus(token, body);
    logSecurityEvent(request, "moderation_user_status_update_success", "info", {
      targetUserId: body?.targetUserId || "",
      action: body?.action || "",
    });
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/moderation/users`) {
    const status = requestUrl.searchParams.get("status") || "all";
    const query = requestUrl.searchParams.get("query") || "";
    const result = await mockApi.getModerationUsers(token, { status, query });
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/analytics/dashboard`) {
    const result = await mockApi.getAnalyticsDashboard(token);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/security/audit`) {
    const session = await mockApi.getCurrentUser(token);
    if (session?.user?.role !== "admin") {
      throw new Error("Admin access required.");
    }
    const limit = ensureBoundedInteger(requestUrl.searchParams.get("limit"), "limit", 1, 500, 200);
    const events = securityAuditEntries.slice(-limit).reverse();
    logSecurityEvent(request, "security_audit_viewed", "info", {
      limit,
    });
    sendJson(response, 200, {
      events,
      count: events.length,
      maxEntries: SECURITY_AUDIT_MAX_ENTRIES,
    });
    return;
  }

  if (method === "GET" && pathname === `${API_PREFIX}/health`) {
    sendJson(response, 200, {
      status: "ok",
      now: new Date().toISOString(),
      service: "spark-backend",
    });
    return;
  }

  sendError(response, 404, "Endpoint not found.");
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;
  const method = request.method || "GET";
  const corsState = setCors(request, response);
  setSecurityHeaders(request, response);

  if (!corsState.originAllowed) {
    logSecurityEvent(request, "blocked_origin_http", "warn", {
      origin: corsState.requestOrigin || "none",
    });
    sendError(response, 403, "Origin not allowed.");
    return;
  }

  if (method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const startedAt = Date.now();

  try {
    enforceJsonRequestContentType(request, method, pathname);
    await handleRequest(request, response);
  } catch (error) {
    const message = error?.message ?? "Internal server error.";
    const status = resolveStatusFromMessage(message);
    if (status >= 400) {
      logSecurityEvent(request, "request_rejected", status >= 500 ? "error" : "warn", {
        status,
        reason: message,
      });
    }
    sendError(response, status, message);
  } finally {
    const duration = Date.now() - startedAt;
    console.log(`[${new Date().toISOString()}] ${method} ${requestUrl.pathname} ${duration}ms`);
  }
});

wsServer.on("connection", (socket, _request, userId) => {
  if (!userId) {
    socket.close(1008, "Unauthorized");
    return;
  }

  registerWsClient(userId, socket);

  socket.on("close", () => {
    unregisterWsClient(userId, socket);
  });

  socket.on("error", () => {
    unregisterWsClient(userId, socket);
  });

  try {
    socket.send(
      JSON.stringify({
        type: "ws_ready",
        at: new Date().toISOString(),
      }),
    );
  } catch {
    unregisterWsClient(userId, socket);
  }
});

server.on("upgrade", (request, socket, head) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (requestUrl.pathname !== WS_PATH) {
    socket.destroy();
    return;
  }

  const requestOrigin = normalizeOrigin(request.headers.origin);
  if (!isOriginAllowed(requestOrigin, WS_ALLOWED_ORIGINS)) {
    logSecurityEvent(request, "blocked_origin_websocket", "warn", {
      origin: requestOrigin || "none",
    });
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  const token = requestUrl.searchParams.get("token") ?? getToken(request);
  resolveWsUserId(token)
    .then((userId) => {
      if (!userId) {
        logSecurityEvent(request, "websocket_auth_failed", "warn", {
          reason: "missing_or_invalid_session",
        });
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit("connection", ws, request, userId);
      });
    })
    .catch(() => {
      logSecurityEvent(request, "websocket_upgrade_error", "error", {
        reason: "unexpected_upgrade_error",
      });
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    });
});

server.listen(PORT, () => {
  console.log(`Spark backend running on http://localhost:${PORT}${API_PREFIX}`);
});
