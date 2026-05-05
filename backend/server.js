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

app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) {
    next();
    return;
  }

  if (req.path === "/api/health") {
    next();
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database not connected yet. Please try again shortly." });
    return;
  }

  next();
});

const sessionStore = new Map();
const moderationReports = [];
const moderationAudit = [];
const callSessionsByUserId = new Map();
const chatThreadsByUserId = new Map();
const chatMessagesByThreadId = new Map();
const blockedUsersByUserId = new Map();
const notificationStateByUserId = new Map();
const swipeStatsByUserId = new Map();
const swipeHistoryByUserId = new Map();
const discoverPostStateById = new Map();
const discoverReelStateById = new Map();

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "Free",
    description: "Core Spark access",
    features: ["Basic profile", "Limited swipes", "Standard filters"],
  },
  {
    id: "plus",
    name: "Spark Plus",
    priceLabel: "$9 / month",
    description: "More discovery control",
    features: ["Unlimited swipes", "Advanced filters", "Priority profile"],
  },
  {
    id: "pro",
    name: "Spark Pro",
    priceLabel: "$19 / month",
    description: "Power matching toolkit",
    features: ["Boosted visibility", "Premium insights", "Fast-track support"],
  },
];

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

function passwordMatches(storedPassword, inputPassword) {
  if (typeof storedPassword !== "string" || typeof inputPassword !== "string") {
    return false;
  }

  if (storedPassword === inputPassword) {
    return true;
  }

  const segments = storedPassword.split(":");
  if (segments.length !== 2) {
    return false;
  }

  const [salt, hashHex] = segments;
  const isLegacyHash = /^[a-f0-9]{32}$/i.test(salt) && /^[a-f0-9]{128}$/i.test(hashHex);
  if (!isLegacyHash) {
    return false;
  }

  try {
    const computedHex = crypto.scryptSync(inputPassword, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHex, "hex"), Buffer.from(hashHex, "hex"));
  } catch {
    return false;
  }
}

function getUserSubscriptionPlanMeta(planId) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || SUBSCRIPTION_PLANS[0];
}

function getNotificationState(userId) {
  if (!notificationStateByUserId.has(userId)) {
    notificationStateByUserId.set(userId, {
      notifications: [],
      preferences: {
        inAppByType: { system: true, social: true, match: true, message: true, billing: true, safety: true },
        browserByType: { system: true, social: true, match: true, message: true, billing: false, safety: true },
        emailByType: { system: false, social: false, match: true, message: true, billing: true, safety: true },
      },
    });
  }
  return notificationStateByUserId.get(userId);
}

function addNotification(userId, payload) {
  const state = getNotificationState(userId);
  state.notifications.unshift({
    id: createToken(),
    type: payload.type || "system",
    title: payload.title || "Notification",
    message: payload.message || "",
    read: false,
    createdAt: new Date().toISOString(),
  });
  state.notifications = state.notifications.slice(0, 120);
}

function getChatThreads(userId) {
  if (!chatThreadsByUserId.has(userId)) {
    chatThreadsByUserId.set(userId, []);
  }
  return chatThreadsByUserId.get(userId);
}

function getBlockedUsers(userId) {
  if (!blockedUsersByUserId.has(userId)) {
    blockedUsersByUserId.set(userId, []);
  }
  return blockedUsersByUserId.get(userId);
}

function toCallContact(user) {
  return {
    userId: String(user._id),
    name: user.name || "User",
    avatar: user.avatar || "",
    status: user.accountStatus || "active",
    role: user.role || "user",
  };
}

function toSubscriptionPayload(user, extra = {}) {
  const currentPlan = user.subscriptionPlan || "starter";
  return {
    currentPlan,
    status: user.subscriptionStatus || "free",
    renewsAt: user.subscriptionRenewsAt || null,
    plans: SUBSCRIPTION_PLANS.map((plan) => ({
      ...plan,
      isCurrent: plan.id === currentPlan,
    })),
    billingHistory: [],
    checkoutSession: null,
    ...extra,
  };
}

function getSwipeStats(userId) {
  if (!swipeStatsByUserId.has(userId)) {
    swipeStatsByUserId.set(userId, {
      likes: 0,
      matches: 0,
      superLikes: 0,
      passes: 0,
    });
  }
  return swipeStatsByUserId.get(userId);
}

function getSwipeHistory(userId) {
  if (!swipeHistoryByUserId.has(userId)) {
    swipeHistoryByUserId.set(userId, []);
  }
  return swipeHistoryByUserId.get(userId);
}

function buildSwipeProfile(user) {
  const age = Number.isFinite(Number(user.age)) ? Number(user.age) : 25;
  const compatibility = 72 + Math.min(24, Math.abs((user.name || "").length % 25));
  return {
    id: String(user._id),
    name: user.name || "User",
    age,
    city: user.city || "Unknown",
    intent: user.intent || "dating",
    avatar: user.avatar || "",
    bio: user.bio || "",
    interests: Array.isArray(user.interests) ? user.interests : [],
    compatibility,
    distanceKm: Math.max(1, ((user.name || "").length % 17) + 1),
    verification: user.verification || { phone: false, selfie: false, id: false },
    details: {
      lastActiveLabel: "Online now",
      lastActiveMinutes: 0,
    },
    accountStatus: user.accountStatus || "active",
  };
}

function ensureDiscoverPostState(postId) {
  if (!discoverPostStateById.has(postId)) {
    discoverPostStateById.set(postId, {
      likedByViewer: false,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      recentComments: [],
      followingAuthor: false,
    });
  }
  return discoverPostStateById.get(postId);
}

function ensureDiscoverReelState(reelId) {
  if (!discoverReelStateById.has(reelId)) {
    discoverReelStateById.set(reelId, {
      commentsCount: 0,
      sharesCount: 0,
      recentComments: [],
    });
  }
  return discoverReelStateById.get(reelId);
}

function safeUser(user) {
  if (!user) {
    return null;
  }

  const planMeta = getUserSubscriptionPlanMeta(user.subscriptionPlan || "starter");

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
    subscriptionPlanMeta: {
      name: planMeta.name,
      priceLabel: planMeta.priceLabel,
      description: planMeta.description,
      features: planMeta.features,
    },
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

    console.log(`[AUTH][LOGIN] email=${email} passLen=${password.length}`);

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!passwordMatches(user.password, password)) {
      res.status(401).json({ message: "Wrong password" });
      return;
    }

    if (user.accountStatus === "banned") {
      res.status(403).json({ message: "Your account is banned. Contact support." });
      return;
    }
    if (user.accountStatus === "suspended") {
      const until = user.suspendedUntil ? new Date(user.suspendedUntil).toISOString() : "unknown time";
      res.status(403).json({ message: `Your account is suspended until ${until}` });
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
  res.json(toSubscriptionPayload(req.user));
});

app.post("/api/subscription/update", requireAuth, async (req, res) => {
  try {
    const plan = normalizeText(req.body?.planId || req.body?.plan, "starter") || "starter";
    const planMeta = getUserSubscriptionPlanMeta(plan);

    req.user.subscriptionPlan = plan;
    req.user.subscriptionStatus = plan === "starter" ? "free" : "active";
    req.user.subscriptionRenewsAt = req.user.subscriptionStatus === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    req.user.lastActiveAt = new Date();
    await req.user.save();

    addNotification(String(req.user._id), {
      type: "billing",
      title: "Subscription updated",
      message: `Your plan is now ${planMeta.name}.`,
    });

    res.json(
      toSubscriptionPayload(req.user, {
        user: safeUser(req.user),
      }),
    );
  } catch (error) {
    res.status(500).json({ message: error?.message || "Unable to update subscription." });
  }
});

app.post("/api/subscription/checkout", requireAuth, async (req, res) => {
  const planId = normalizeText(req.body?.planId, "starter") || "starter";
  const planMeta = getUserSubscriptionPlanMeta(planId);

  if (planMeta.id === "starter") {
    res.status(400).json({ message: "Starter plan does not require checkout." });
    return;
  }

  res.json({
    session: {
      id: createToken(),
      planId: planMeta.id,
      planName: planMeta.name,
      amountLabel: planMeta.priceLabel,
      createdAt: new Date().toISOString(),
    },
  });
});

app.post("/api/subscription/checkout/confirm", requireAuth, async (req, res) => {
  const sessionId = normalizeText(req.body?.sessionId);
  const planId = normalizeText(req.body?.planId || req.body?.selectedPlanId || "plus", "plus") || "plus";
  if (!sessionId) {
    res.status(400).json({ message: "sessionId is required." });
    return;
  }

  const planMeta = getUserSubscriptionPlanMeta(planId);
  req.user.subscriptionPlan = planMeta.id;
  req.user.subscriptionStatus = planMeta.id === "starter" ? "free" : "active";
  req.user.subscriptionRenewsAt = req.user.subscriptionStatus === "active" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
  req.user.lastActiveAt = new Date();
  await req.user.save();

  addNotification(String(req.user._id), {
    type: "billing",
    title: "Payment successful",
    message: `${planMeta.name} activated successfully.`,
  });

  res.json(
    toSubscriptionPayload(req.user, {
      checkoutSession: null,
      payment: {
        id: createToken(),
        status: "success",
        amountLabel: planMeta.priceLabel,
      },
      user: safeUser(req.user),
    }),
  );
});

app.get("/api/swipe/candidates", requireAuth, async (req, res) => {
  const currentUserId = String(req.user._id);
  const users = await User.find({ _id: { $ne: req.user._id }, accountStatus: "active" }).limit(60);
  const profiles = users.map((entry) => buildSwipeProfile(entry));
  const stats = getSwipeStats(currentUserId);
  const history = getSwipeHistory(currentUserId);

  res.json({
    profiles,
    stats,
    history,
  });
});

app.post("/api/swipe/action", requireAuth, async (req, res) => {
  const currentUserId = String(req.user._id);
  const profileId = normalizeText(req.body?.profileId);
  const action = normalizeText(req.body?.action).toLowerCase();
  if (!profileId || !["like", "pass", "superlike"].includes(action)) {
    res.status(400).json({ message: "Invalid swipe payload." });
    return;
  }

  const stats = getSwipeStats(currentUserId);
  const history = getSwipeHistory(currentUserId);
  const matched = action !== "pass" && Math.random() < 0.35;
  const matchedUser = await User.findById(profileId);

  if (action === "pass") {
    stats.passes += 1;
  } else if (action === "superlike") {
    stats.superLikes += 1;
    if (matched) {
      stats.matches += 1;
    }
  } else {
    stats.likes += 1;
    if (matched) {
      stats.matches += 1;
    }
  }

  history.unshift({
    profileId,
    action,
    matched,
    actedAt: new Date().toISOString(),
  });
  swipeHistoryByUserId.set(currentUserId, history.slice(0, 300));

  if (matched && matchedUser) {
    addNotification(currentUserId, {
      type: "match",
      title: "It's a match!",
      message: `You matched with ${matchedUser.name || "someone new"}.`,
    });
  }

  res.json({
    profileId,
    matched,
    matchUser: matched && matchedUser ? safeUser(matchedUser) : null,
    stats,
  });
});

app.get("/api/discover/feed", requireAuth, (_req, res) => {
  res.json({
    nearbyCountLabel: "Nearby now",
    heroTitle: "Discover people and stories",
    heroDescription: "Fresh recommendations from your city",
    stories: [],
    posts: [],
    reels: [],
    recommendations: [],
    spotlightMatches: [],
    highlight: null,
    viewerName: _req.user?.name || "Guest",
  });
});

app.get("/api/discover/reels", requireAuth, (_req, res) => {
  res.json({ reels: [] });
});

app.get("/api/discover/recommendations", requireAuth, (_req, res) => {
  res.json({ recommendations: [] });
});

app.post("/api/discover/follow", requireAuth, (req, res) => {
  const authorId = normalizeText(req.body?.authorId);
  const state = ensureDiscoverPostState(`author:${authorId || "unknown"}`);
  state.followingAuthor = !state.followingAuthor;
  res.json({ following: state.followingAuthor });
});

app.post("/api/discover/post-like", requireAuth, (req, res) => {
  const postId = normalizeText(req.body?.postId);
  const state = ensureDiscoverPostState(postId || "default");
  state.likedByViewer = !state.likedByViewer;
  state.likesCount = Math.max(0, state.likesCount + (state.likedByViewer ? 1 : -1));
  res.json({
    liked: state.likedByViewer,
    likesCount: state.likesCount,
    likesLabel: `${state.likesCount} likes`,
  });
});

app.post("/api/discover/post-comment", requireAuth, (req, res) => {
  const postId = normalizeText(req.body?.postId);
  const text = normalizeText(req.body?.text);
  const state = ensureDiscoverPostState(postId || "default");
  if (text) {
    state.commentsCount += 1;
    state.recentComments = [{ id: createToken(), author: req.user.name, text }, ...(state.recentComments || [])].slice(0, 3);
  }
  res.json({
    commentsCount: state.commentsCount,
    commentsLabel: `${state.commentsCount} comments`,
    recentComments: state.recentComments || [],
  });
});

app.post("/api/discover/post-share", requireAuth, (req, res) => {
  const postId = normalizeText(req.body?.postId);
  const state = ensureDiscoverPostState(postId || "default");
  state.sharesCount += 1;
  res.json({
    shareCount: state.sharesCount,
    shareLabel: `${state.sharesCount} shares`,
  });
});

app.post("/api/discover/reel-comment", requireAuth, (req, res) => {
  const reelId = normalizeText(req.body?.reelId);
  const text = normalizeText(req.body?.text);
  const state = ensureDiscoverReelState(reelId || "default");
  if (text) {
    state.commentsCount += 1;
    state.recentComments = [{ id: createToken(), author: req.user.name, text }, ...(state.recentComments || [])].slice(0, 3);
  }
  res.json({
    commentsCount: state.commentsCount,
    commentsLabel: `${state.commentsCount} comments`,
    recentComments: state.recentComments || [],
  });
});

app.post("/api/discover/reel-share", requireAuth, (req, res) => {
  const reelId = normalizeText(req.body?.reelId);
  const state = ensureDiscoverReelState(reelId || "default");
  state.sharesCount += 1;
  res.json({
    shareCount: state.sharesCount,
    shareLabel: `${state.sharesCount} shares`,
  });
});

app.post("/api/discover/search", requireAuth, async (req, res) => {
  const query = normalizeText(req.body?.query).toLowerCase();
  const city = normalizeText(req.body?.city);
  const intent = normalizeText(req.body?.intent).toLowerCase();
  const minAge = Number.isFinite(Number(req.body?.minAge)) ? Number(req.body.minAge) : 18;
  const maxAge = Number.isFinite(Number(req.body?.maxAge)) ? Number(req.body.maxAge) : 99;

  const rawUsers = await User.find({ _id: { $ne: req.user._id }, accountStatus: "active" }).limit(120);
  const profiles = rawUsers.map((entry) => buildSwipeProfile(entry));
  const results = profiles.filter((profile) => {
    const passesQuery = !query || profile.name.toLowerCase().includes(query) || profile.city.toLowerCase().includes(query);
    const passesCity = !city || city === "all" || profile.city === city;
    const passesIntent = !intent || intent === "all" || String(profile.intent).toLowerCase() === intent;
    const age = Number(profile.age) || 0;
    const passesAge = age >= minAge && age <= maxAge;
    return passesQuery && passesCity && passesIntent && passesAge;
  });

  const cities = Array.from(new Set(profiles.map((profile) => profile.city).filter(Boolean))).slice(0, 30);
  const intents = Array.from(new Set(profiles.map((profile) => String(profile.intent).toLowerCase()).filter(Boolean))).slice(0, 12);
  const interests = Array.from(
    new Set(
      profiles
        .flatMap((profile) => (Array.isArray(profile.interests) ? profile.interests : []))
        .map((entry) => String(entry).trim())
        .filter(Boolean),
    ),
  ).slice(0, 40);

  res.json({
    filters: {
      query,
      city: city || "",
      intent: intent || "",
      interest: normalizeText(req.body?.interest),
      minAge,
      maxAge,
    },
    total: results.length,
    results,
    suggestions: {
      cities,
      intents,
      interests,
    },
  });
});

app.get("/api/chat/user/blocked", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  res.json({
    blockedUsers: getBlockedUsers(currentUserId),
  });
});

app.get("/api/chat/threads", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  res.json(getChatThreads(currentUserId));
});

app.get("/api/chat/threads/:threadId/messages", requireAuth, (req, res) => {
  const threadId = normalizeText(req.params?.threadId);
  const list = Array.isArray(chatMessagesByThreadId.get(threadId)) ? chatMessagesByThreadId.get(threadId) : [];
  res.json({ messages: list });
});

app.post("/api/chat/messages", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  const threadId = normalizeText(req.body?.threadId, `thread_${currentUserId}`) || `thread_${currentUserId}`;
  const text = normalizeText(req.body?.text);
  if (!text) {
    res.status(400).json({ message: "Message text is required." });
    return;
  }

  const message = {
    id: createToken(),
    threadId,
    from: "me",
    text,
    createdAt: new Date().toISOString(),
    deliveryStatus: "sent",
    reactions: [],
  };

  const currentMessages = Array.isArray(chatMessagesByThreadId.get(threadId)) ? chatMessagesByThreadId.get(threadId) : [];
  chatMessagesByThreadId.set(threadId, [...currentMessages, message]);

  const threadList = getChatThreads(currentUserId);
  if (!threadList.some((thread) => thread.id === threadId)) {
    threadList.unshift({
      id: threadId,
      kind: "direct",
      title: "New conversation",
      peerUserId: normalizeText(req.body?.peerUserId),
      updatedAt: message.createdAt,
      lastMessagePreview: text.slice(0, 120),
      unreadCount: 0,
      status: "Online",
    });
  } else {
    for (const thread of threadList) {
      if (thread.id === threadId) {
        thread.updatedAt = message.createdAt;
        thread.lastMessagePreview = text.slice(0, 120);
      }
    }
  }

  res.json({ message });
});

app.post("/api/chat/typing", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat/read", requireAuth, (req, res) => {
  const threadId = normalizeText(req.body?.threadId);
  const list = Array.isArray(chatMessagesByThreadId.get(threadId)) ? chatMessagesByThreadId.get(threadId) : [];
  const updatedMessageIds = list.filter((message) => message.from === "them").map((message) => message.id);
  res.json({ updatedMessageIds });
});

app.post("/api/chat/messages/react", requireAuth, (req, res) => {
  const threadId = normalizeText(req.body?.threadId);
  const messageId = normalizeText(req.body?.messageId);
  const emoji = normalizeText(req.body?.emoji);
  const list = Array.isArray(chatMessagesByThreadId.get(threadId)) ? chatMessagesByThreadId.get(threadId) : [];
  const nextList = list.map((message) => {
    if (message.id !== messageId) {
      return message;
    }
    const reactions = Array.isArray(message.reactions) ? [...message.reactions] : [];
    const existingIndex = reactions.findIndex((reaction) => reaction.emoji === emoji && reaction.from === "me");
    if (existingIndex >= 0) {
      reactions.splice(existingIndex, 1);
    } else {
      reactions.push({ emoji, from: "me" });
    }
    return {
      ...message,
      reactions,
    };
  });
  chatMessagesByThreadId.set(threadId, nextList);
  res.json({
    message: nextList.find((message) => message.id === messageId) || null,
  });
});

app.post("/api/chat/messages/delete", requireAuth, (req, res) => {
  const threadId = normalizeText(req.body?.threadId);
  const messageId = normalizeText(req.body?.messageId);
  const list = Array.isArray(chatMessagesByThreadId.get(threadId)) ? chatMessagesByThreadId.get(threadId) : [];
  chatMessagesByThreadId.set(
    threadId,
    list.filter((message) => message.id !== messageId),
  );
  res.json({ ok: true });
});

app.post("/api/chat/messages/report", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat/user/report", requireAuth, (req, res) => {
  const targetUserId = normalizeText(req.body?.targetUserId);
  const reason = normalizeText(req.body?.reason, "Safety concern") || "Safety concern";

  moderationReports.unshift({
    id: createToken(),
    status: "open",
    reporterUserId: String(req.user._id),
    reporterName: req.user.name,
    targetUserId,
    targetUserName: "User",
    reason,
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true });
});

app.post("/api/chat/user/block", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  const targetUserId = normalizeText(req.body?.targetUserId);
  if (!targetUserId) {
    res.status(400).json({ message: "targetUserId is required." });
    return;
  }
  const blocked = getBlockedUsers(currentUserId);
  if (!blocked.some((entry) => entry.userId === targetUserId)) {
    blocked.push({
      userId: targetUserId,
      name: "Blocked user",
      blockedAt: new Date().toISOString(),
    });
  }
  res.json({ ok: true });
});

app.post("/api/chat/user/unblock", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  const targetUserId = normalizeText(req.body?.targetUserId);
  blockedUsersByUserId.set(
    currentUserId,
    getBlockedUsers(currentUserId).filter((entry) => entry.userId !== targetUserId),
  );
  res.json({ ok: true });
});

app.post("/api/chat/user/unmatch", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  const targetUserId = normalizeText(req.body?.targetUserId);
  chatThreadsByUserId.set(
    currentUserId,
    getChatThreads(currentUserId).filter((thread) => thread.peerUserId !== targetUserId),
  );
  res.json({ ok: true });
});

app.get("/api/calls", requireAuth, async (req, res) => {
  const currentUserId = String(req.user._id);
  const activeSession = callSessionsByUserId.get(currentUserId) || null;
  const contacts = (await User.find({ _id: { $ne: req.user._id }, accountStatus: "active" }).limit(20)).map((user) => toCallContact(user));
  res.json({
    activeSession,
    recentSessions: [],
    contacts,
  });
});

app.post("/api/calls/start", requireAuth, async (req, res) => {
  const currentUserId = String(req.user._id);
  const peerUserId = normalizeText(req.body?.peerUserId);
  const type = normalizeText(req.body?.type, "voice") || "voice";
  if (!peerUserId) {
    res.status(400).json({ message: "peerUserId is required." });
    return;
  }

  const peerUser = await User.findById(peerUserId);
  const session = {
    id: createToken(),
    peerUserId,
    peerName: peerUser?.name || "User",
    peerAvatar: peerUser?.avatar || "",
    direction: "outgoing",
    status: "ringing",
    type: type === "video" ? "video" : "voice",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    durationLabel: "0:00",
  };
  callSessionsByUserId.set(currentUserId, session);
  res.json({ session });
});

app.post("/api/calls/respond", requireAuth, (req, res) => {
  const currentUserId = String(req.user._id);
  const sessionId = normalizeText(req.body?.sessionId);
  const action = normalizeText(req.body?.action).toLowerCase();
  const session = callSessionsByUserId.get(currentUserId);
  if (!session || session.id !== sessionId) {
    res.status(404).json({ message: "Call session not found." });
    return;
  }

  if (action === "accept") {
    session.status = "accepted";
    session.answeredAt = new Date().toISOString();
  } else if (action === "decline" || action === "cancel" || action === "end") {
    callSessionsByUserId.delete(currentUserId);
    res.json({ session: null });
    return;
  } else {
    res.status(400).json({ message: "Invalid call action." });
    return;
  }
  session.updatedAt = new Date().toISOString();
  callSessionsByUserId.set(currentUserId, session);
  res.json({ session });
});

app.post("/api/calls/signal", requireAuth, (_req, res) => {
  res.json({ success: true });
});

app.get("/api/notifications", requireAuth, (req, res) => {
  const state = getNotificationState(String(req.user._id));
  const notifications = Array.isArray(state.notifications) ? state.notifications : [];
  const unreadCount = notifications.filter((item) => !item.read).length;
  res.json({
    notifications,
    unreadCount,
    queuedEmailCount: notifications.filter((item) => !item.read && item.type === "billing").length,
    preferences: state.preferences,
  });
});

app.post("/api/notifications/read", requireAuth, (req, res) => {
  const notificationId = normalizeText(req.body?.notificationId);
  const state = getNotificationState(String(req.user._id));
  state.notifications = (state.notifications || []).map((item) =>
    item.id === notificationId
      ? {
          ...item,
          read: true,
        }
      : item,
  );
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  res.json({ unreadCount });
});

app.post("/api/notifications/read-all", requireAuth, (req, res) => {
  const state = getNotificationState(String(req.user._id));
  state.notifications = (state.notifications || []).map((item) => ({
    ...item,
    read: true,
  }));
  res.json({ unreadCount: 0 });
});

app.get("/api/notifications/preferences", requireAuth, (req, res) => {
  const state = getNotificationState(String(req.user._id));
  res.json({ preferences: state.preferences });
});

app.post("/api/notifications/preferences", requireAuth, (req, res) => {
  const state = getNotificationState(String(req.user._id));
  const channel = normalizeText(req.body?.channel);
  const type = normalizeText(req.body?.type);
  const enabled = Boolean(req.body?.enabled);

  if (!channel || !type || !state.preferences?.[`${channel}ByType`]) {
    res.status(400).json({ message: "Invalid preference payload." });
    return;
  }

  state.preferences = {
    ...state.preferences,
    [`${channel}ByType`]: {
      ...state.preferences[`${channel}ByType`],
      [type]: enabled,
    },
  };

  res.json({ preferences: state.preferences });
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

app.post("/api/moderation/users/delete", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUserId = normalizeText(req.body?.targetUserId);
    const reason = normalizeText(req.body?.reason, "Deleted by admin") || "Deleted by admin";
    console.log(`[ADMIN][DELETE] actor=${req.user?.email || req.user?._id || "unknown"} target=${targetUserId || "none"}`);

    if (!targetUserId) {
      res.status(400).json({ message: "targetUserId is required." });
      return;
    }

    if (String(req.user._id) === targetUserId) {
      res.status(400).json({ message: "You cannot delete your own admin account." });
      return;
    }

    const target = await User.findById(targetUserId);
    if (!target) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (target.role === "admin") {
      res.status(400).json({ message: "Admin account cannot be deleted." });
      return;
    }

    await User.deleteOne({ _id: target._id });

    for (const [token, session] of sessionStore.entries()) {
      if (session?.userId === targetUserId) {
        sessionStore.delete(token);
      }
    }

    moderationAudit.unshift({
      id: createToken(),
      action: "delete_user",
      actorId: String(req.user._id),
      actorName: req.user.name,
      targetUserId: String(target._id),
      targetName: target.name,
      reason,
      createdAt: new Date().toISOString(),
    });

    console.log(`[ADMIN][DELETE] success target=${targetUserId}`);
    res.json({ ok: true, deletedUserId: targetUserId });
  } catch (error) {
    console.error("[ADMIN][DELETE] failed", error);
    res.status(500).json({ message: error?.message || "Unable to delete user." });
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
