import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "node:crypto";

import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 10000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const sessionStore = new Map();
const moderationReports = [];
const moderationAudit = [];

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }
  return authHeader.slice(7).trim();
}

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim();
}

function safeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    accountStatus: user.accountStatus || "active",
    suspendedUntil: user.suspendedUntil || null,
    suspensionReason: user.suspensionReason || "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt || user.updatedAt || user.createdAt,
    age: user.age ?? null,
    city: user.city || "",
    intent: user.intent || "dating",
    avatar: user.avatar || "",
    bio: user.bio || "",
    interests: Array.isArray(user.interests) ? user.interests : [],
    verification: user.verification || { phone: false, selfie: false, id: false },
    subscriptionStatus: user.subscriptionStatus || "free",
    subscriptionPlan: user.subscriptionPlan || "starter",
    subscriptionPlanMeta: { name: user.subscriptionPlan || "Starter" },
    subscriptionRenewsAt: user.subscriptionRenewsAt || null,
    profileCompletionScore: user.profileCompletionScore || 0,
    relationshipGoal: user.relationshipGoal || "",
    occupation: user.occupation || "",
    education: user.education || "",
    handle: user.handle || `@${(user.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
  };
}

function createSession(user) {
  const token = createToken();
  sessionStore.set(token, {
    userId: String(user._id),
    createdAt: Date.now(),
  });
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ message: "Login required." });
      return;
    }

    const session = sessionStore.get(token);
    if (!session?.userId) {
      res.status(401).json({ message: "Session expired. Please login again." });
      return;
    }

    const user = await User.findById(session.userId);
    if (!user) {
      sessionStore.delete(token);
      res.status(401).json({ message: "User not found." });
      return;
    }

    req.authToken = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Auth check failed." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return;
  }
  next();
}

function summarizeUsers(users) {
  const summary = {
    total: users.length,
    active: 0,
    suspended: 0,
    banned: 0,
  };

  for (const user of users) {
    const status = user.accountStatus || "active";
    if (summary[status] !== undefined) {
      summary[status] += 1;
    }
  }

  return summary;
}

function summarizeReports(reports) {
  const summary = {
    total: reports.length,
    open: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
  };

  for (const report of reports) {
    const status = report.status || "open";
    if (status === "under_review") {
      summary.underReview += 1;
    } else if (status === "open") {
      summary.open += 1;
    } else if (status === "resolved") {
      summary.resolved += 1;
    } else if (status === "dismissed") {
      summary.dismissed += 1;
    }
  }

  return summary;
}

app.get("/", (_req, res) => {
  res.send("Server Running");
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
  });
});

async function registerHandler(req, res) {
  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const password = normalizeText(req.body?.password);

    if (!name || !email || !password) {
      res.status(400).json({ message: "name, email and password are required." });
      return;
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    const derivedRole = email.includes("admin") ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      password,
      role: derivedRole,
      age: Number.isFinite(Number(req.body?.age)) ? Number(req.body.age) : null,
      city: normalizeText(req.body?.city),
      intent: normalizeText(req.body?.intent, "dating") || "dating",
      avatar: normalizeText(req.body?.avatar),
      bio: normalizeText(req.body?.bio),
      interests: Array.isArray(req.body?.interests)
        ? req.body.interests.map((item) => normalizeText(item)).filter(Boolean).slice(0, 20)
        : [],
      profileCompletionScore: 30,
      handle: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "user"}`,
      lastActiveAt: new Date(),
    });

    const token = createSession(user);

    res.status(201).json({
      token,
      refreshToken: "",
      tokenExpiresAt: "",
      user: safeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Registration failed." });
  }
}

app.post("/api/auth/register", registerHandler);
app.post("/api/register", registerHandler);

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email).toLowerCase();
    const password = normalizeText(req.body?.password);

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email, password });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    user.lastActiveAt = new Date();
    await user.save();

    const token = createSession(user);

    res.json({
      token,
      refreshToken: "",
      tokenExpiresAt: "",
      user: safeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Login failed." });
  }
});

app.post("/api/auth/refresh", (_req, res) => {
  res.status(501).json({ message: "Refresh token not enabled yet." });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  res.json({ user: safeUser(req.user) });
});

app.post("/api/auth/profile", requireAuth, async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body?.name === "string") {
      updates.name = normalizeText(req.body.name);
    }
    if (typeof req.body?.city === "string") {
      updates.city = normalizeText(req.body.city);
    }
    if (typeof req.body?.bio === "string") {
      updates.bio = normalizeText(req.body.bio);
    }
    if (typeof req.body?.avatar === "string") {
      updates.avatar = normalizeText(req.body.avatar);
    }
    if (typeof req.body?.intent === "string") {
      updates.intent = normalizeText(req.body.intent);
    }
    if (typeof req.body?.age !== "undefined") {
      const ageValue = Number(req.body.age);
      updates.age = Number.isFinite(ageValue) ? ageValue : null;
    }
    if (Array.isArray(req.body?.interests)) {
      updates.interests = req.body.interests.map((item) => normalizeText(item)).filter(Boolean).slice(0, 20);
    }

    updates.profileCompletionScore = Math.min(
      100,
      [updates.name || req.user.name, updates.city || req.user.city, updates.bio || req.user.bio, updates.avatar || req.user.avatar].filter(Boolean)
        .length * 25,
    );
    updates.lastActiveAt = new Date();

    Object.assign(req.user, updates);
    await req.user.save();

    res.json({ user: safeUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Unable to update profile." });
  }
});

app.post("/api/auth/verify", requireAuth, async (req, res) => {
  try {
    const method = normalizeText(req.body?.method).toLowerCase();
    if (!method || !["phone", "selfie", "id"].includes(method)) {
      res.status(400).json({ message: "Verification method must be phone, selfie, or id." });
      return;
    }

    req.user.verification = req.user.verification || { phone: false, selfie: false, id: false };
    req.user.verification[method] = true;
    req.user.lastActiveAt = new Date();
    await req.user.save();

    res.json({ user: safeUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Unable to complete verification." });
  }
});

app.get("/api/subscription", requireAuth, async (req, res) => {
  res.json({
    status: req.user.subscriptionStatus || "free",
    plan: req.user.subscriptionPlan || "starter",
    renewsAt: req.user.subscriptionRenewsAt || null,
  });
});

app.post("/api/subscription/update", requireAuth, async (req, res) => {
  try {
    const plan = normalizeText(req.body?.plan, "starter") || "starter";
    req.user.subscriptionPlan = plan;
    req.user.subscriptionStatus = plan === "starter" ? "free" : "active";
    req.user.subscriptionRenewsAt = req.user.subscriptionStatus === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    req.user.lastActiveAt = new Date();
    await req.user.save();

    res.json({
      status: req.user.subscriptionStatus,
      plan: req.user.subscriptionPlan,
      renewsAt: req.user.subscriptionRenewsAt,
      user: safeUser(req.user),
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Unable to update subscription." });
  }
});

app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((item) => safeUser(item)));
});

app.get("/api/moderation/users", requireAuth, requireAdmin, async (req, res) => {
  const queryText = normalizeText(req.query?.query).toLowerCase();
  const status = normalizeText(req.query?.status, "all");

  const users = await User.find().sort({ createdAt: -1 });
  const filtered = users.filter((item) => {
    const user = safeUser(item);
    const statusPass = status === "all" || user.accountStatus === status;
    const queryPass =
      !queryText ||
      user.name.toLowerCase().includes(queryText) ||
      user.email.toLowerCase().includes(queryText) ||
      user.id.toLowerCase().includes(queryText);
    return statusPass && queryPass;
  });

  const mapped = filtered.map((item) => safeUser(item));
  res.json({
    users: mapped,
    summary: summarizeUsers(users.map((item) => safeUser(item))),
  });
});

app.post("/api/moderation/users/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUserId = normalizeText(req.body?.targetUserId);
    const action = normalizeText(req.body?.action).toLowerCase();
    const reason = normalizeText(req.body?.reason, "Updated by admin") || "Updated by admin";

    if (!targetUserId || !["activate", "suspend", "ban"].includes(action)) {
      res.status(400).json({ message: "Invalid user moderation payload." });
      return;
    }

    const target = await User.findById(targetUserId);
    if (!target) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (target.role === "admin") {
      res.status(400).json({ message: "Admin account cannot be moderated." });
      return;
    }

    if (action === "activate") {
      target.accountStatus = "active";
      target.suspendedUntil = null;
      target.suspensionReason = "";
    } else if (action === "suspend") {
      target.accountStatus = "suspended";
      target.suspensionReason = reason;
      target.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      target.accountStatus = "banned";
      target.suspensionReason = reason;
      target.suspendedUntil = null;
    }

    await target.save();

    moderationAudit.unshift({
      id: createToken(),
      action,
      actorId: String(req.user._id),
      actorName: req.user.name,
      targetUserId: String(target._id),
      targetName: target.name,
      reason,
      createdAt: new Date().toISOString(),
    });

    res.json({ ok: true, user: safeUser(target) });
  } catch (error) {
    res.status(500).json({ message: error?.message || "Unable to update user status." });
  }
});

app.get("/api/moderation/reports", requireAuth, requireAdmin, (req, res) => {
  const status = normalizeText(req.query?.status, "all");
  const reports =
    status === "all" ? moderationReports : moderationReports.filter((item) => (item.status || "open") === status);

  res.json({
    reports,
    summary: summarizeReports(moderationReports),
  });
});

app.post("/api/moderation/reports/resolve", requireAuth, requireAdmin, (req, res) => {
  const reportId = normalizeText(req.body?.reportId);
  const action = normalizeText(req.body?.action, "dismiss").toLowerCase();

  const report = moderationReports.find((item) => item.id === reportId);
  if (!report) {
    res.status(404).json({ message: "Report not found." });
    return;
  }

  if (action === "dismiss") {
    report.status = "dismissed";
  } else {
    report.status = "resolved";
  }

  moderationAudit.unshift({
    id: createToken(),
    action: `report_${action}`,
    actorId: String(req.user._id),
    actorName: req.user.name,
    targetUserId: report.targetUserId || "",
    targetName: report.targetUserName || "Unknown",
    reason: normalizeText(req.body?.reason, "Report action") || "Report action",
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true, report });
});

app.get("/api/moderation/audit", requireAuth, requireAdmin, (_req, res) => {
  res.json({ audit: moderationAudit.slice(0, 200) });
});

app.get("/api/analytics/dashboard", requireAuth, requireAdmin, async (_req, res) => {
  const allUsers = await User.find();
  const safeUsers = allUsers.map((item) => safeUser(item));
  const paidUsers = safeUsers.filter((item) => item.subscriptionStatus === "active").length;

  res.json({
    metrics: {
      totalUsers: safeUsers.length,
      dailyActiveUsers: safeUsers.filter((item) => item.lastActiveAt && new Date(item.lastActiveAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length,
      weeklyActiveUsers: safeUsers.filter((item) => item.lastActiveAt && new Date(item.lastActiveAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
      matchConversionRate: 0,
      chatResponseRate: 0,
      paidConversionRate: safeUsers.length ? Number(((paidUsers / safeUsers.length) * 100).toFixed(2)) : 0,
      totalLikes: 0,
      totalMatches: 0,
      paidUsers,
      reportsOpen: moderationReports.filter((item) => item.status === "open").length,
    },
    trends: {
      dau7d: [],
      paidConversion7d: [],
    },
    generatedAt: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
