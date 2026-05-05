import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "node:crypto";
import { promisify } from "node:util";

import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
const scryptAsync = promisify(crypto.scrypt);

const suspiciousTextPatterns = [
  /<\s*script\b/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\x00/,
  /<\s*iframe\b/i,
];

const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

function parseAllowedOrigins(rawOrigins) {
  if (!rawOrigins || !rawOrigins.trim()) {
    return [];
  }

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb", strict: true }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

function isSuspiciousPayload(value, depth = 0) {
  if (depth > 8) {
    return true;
  }

  if (typeof value === "string") {
    return suspiciousTextPatterns.some((pattern) => pattern.test(value));
  }

  if (Array.isArray(value)) {
    if (value.length > 500) {
      return true;
    }

    for (const item of value) {
      if (isSuspiciousPayload(item, depth + 1)) {
        return true;
      }
    }
    return false;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length > 200) {
      return true;
    }

    for (const key of keys) {
      if (forbiddenKeys.has(key)) {
        return true;
      }
      if (isSuspiciousPayload(value[key], depth + 1)) {
        return true;
      }
    }
  }

  return false;
}

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && isSuspiciousPayload(req.body)) {
    res.status(400).json({ message: "Suspicious payload rejected." });
    return;
  }
  next();
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function requireAdmin(req, res, next) {
  if (!ADMIN_API_KEY) {
    res.status(503).json({ message: "Admin route unavailable. Set ADMIN_API_KEY first." });
    return;
  }

  const providedKey = req.header("x-admin-key") || "";
  if (providedKey !== ADMIN_API_KEY) {
    res.status(401).json({ message: "Unauthorized admin access." });
    return;
  }

  next();
}

app.get("/", (_req, res) => {
  res.send("Server Running");
});

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: "ok",
    dbState,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

async function registerHandler(req, res) {
  const { name, email, password } = req.body || {};

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "name, email and password are required." });
    return;
  }

  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2 || cleanName.length > 80) {
    res.status(400).json({ message: "Name must be between 2 and 80 characters." });
    return;
  }

  if (!isValidEmail(cleanEmail)) {
    res.status(400).json({ message: "Please provide a valid email." });
    return;
  }

  if (password.length < 8 || password.length > 128) {
    res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    return;
  }

  try {
    const existingUser = await User.findOne({ email: cleanEmail }).lean();
    if (existingUser) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: passwordHash,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed." });
  }
}

app.post("/api/register", registerHandler);
app.post("/api/auth/register", registerHandler);

app.get("/api/admin/users", requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, createdAt: 1, updatedAt: 1 })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ count: users.length, users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

app.use((err, _req, res, _next) => {
  if (err?.message === "Origin not allowed") {
    res.status(403).json({ message: "Origin not allowed." });
    return;
  }

  console.error("Unhandled server error:", err);
  res.status(500).json({ message: "Internal server error." });
});

async function connectMongoWithRetry() {
  if (!MONGO_URI) {
    console.error("[BOOT] MONGO_URI is missing. Add it in Render environment variables.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
    setTimeout(connectMongoWithRetry, 5_000);
  }
}

connectMongoWithRetry();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
