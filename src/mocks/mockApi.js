const USERS_STORAGE_KEY = "spark_mock_users";
const DISCOVER_STATE_STORAGE_KEY = "spark_mock_discover_state";
const SWIPE_STATE_STORAGE_KEY = "spark_mock_swipe_state";
const CHAT_STATE_STORAGE_KEY = "spark_mock_chat_state";
const CALL_STATE_STORAGE_KEY = "spark_mock_call_state";
const SAFETY_STATE_STORAGE_KEY = "spark_mock_safety_state";
const NOTIFICATION_STATE_STORAGE_KEY = "spark_mock_notification_state";
const BILLING_STATE_STORAGE_KEY = "spark_mock_billing_state";
const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=200&q=80";
const ADMIN_EMAIL_ALLOWLIST = ["demo@spark.app", "admin@spark.app"];
const NOTIFICATION_TYPES = ["system", "social", "match", "message", "billing", "safety"];
const NOTIFICATION_CHANNELS = ["inApp", "browser", "email"];

const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "Free",
    monthlyPrice: 0,
    description: "Best for trying core Spark experience.",
    features: ["Basic swipes", "Limited inbox tools", "Standard profile visibility"],
  },
  {
    id: "plus",
    name: "Plus",
    priceLabel: "$9/mo",
    monthlyPrice: 9,
    description: "For active users who want deeper control.",
    features: ["Unlimited likes", "Advanced filters", "Priority profile placement"],
  },
  {
    id: "premium",
    name: "Premium",
    priceLabel: "$19/mo",
    monthlyPrice: 19,
    description: "For power users with premium networking goals.",
    features: ["Read receipts", "Weekly profile boosts", "Premium event access"],
  },
];

const CITY_POOL = ["Delhi", "Mumbai", "Bangalore", "Pune", "Gurugram", "Hyderabad", "Kolkata", "Chandigarh"];
const BIO_FALLBACKS = [
  "Looking for meaningful conversations and real plans.",
  "Coffee, music, and honest vibes over random swipes.",
  "Intentional dating with fun weekend adventures.",
  "New here. Open to quality connections and genuine chats.",
];

const discoverFeedBase = {
  nearbyCountLabel: "1,247 people nearby tonight",
  heroTitle: "Meet new people, share moments, and build real vibes.",
  heroDescription:
    "A modern social dating experience where stories, reels, and matches all live in one stylish space.",
  stories: [
    {
      id: "story_1",
      name: "Kiara",
      city: "Gurugram",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "story_2",
      name: "Abeer",
      city: "Mumbai",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "story_3",
      name: "Rhea",
      city: "Pune",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "story_4",
      name: "Ishaan",
      city: "Delhi",
      image:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "story_5",
      name: "Aanya",
      city: "Bangalore",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  ],
  spotlightMatches: [
    { id: "m1", name: "Mia", age: 24, vibe: "Coffee and books", gradient: "from-orange-400 to-amber-500" },
    { id: "m2", name: "Reyansh", age: 27, vibe: "Road trips", gradient: "from-teal-400 to-cyan-500" },
    { id: "m3", name: "Tara", age: 23, vibe: "Live music", gradient: "from-rose-400 to-orange-500" },
  ],
  highlight: {
    title: "Rooftop Mixer",
    timeLabel: "8:30 PM",
    description: "Curated social night with music, networking games, and match circles.",
  },
};

const discoverPosts = [
  {
    id: "post_1",
    authorId: "author_anaya",
    author: "Anaya Malhotra",
    handle: "@anaya.m",
    time: "2h ago",
    caption: "Friday mixer plan? Good playlists, coffee, and zero awkward vibes.",
    image:
      "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    baseLikesCount: 3200,
    comments: 186,
    profile: {
      id: "seed_anaya",
      avatar:
        "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=400&q=80",
      age: 26,
      city: "Gurugram",
      intent: "dating",
      interests: ["Music", "Coffee", "Weekend outings"],
      verification: {
        phone: true,
        selfie: true,
        id: false,
      },
      occupation: "Brand Strategist",
      education: "MBA",
      relationshipGoal: "Meaningful dating",
      lastActiveLabel: "Active 18m ago",
      prompt: "Ideal first date: rooftop cafe with live acoustic music.",
    },
  },
  {
    id: "post_2",
    authorId: "author_kabir",
    author: "Kabir Singh",
    handle: "@kabirx",
    time: "5h ago",
    caption: "Captured this sunset after a rooftop date. Delhi never disappoints.",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    baseLikesCount: 2100,
    comments: 92,
    profile: {
      id: "seed_kabir",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      age: 29,
      city: "Delhi",
      intent: "long_term",
      interests: ["Cinema", "Photography", "Travel"],
      verification: {
        phone: true,
        selfie: false,
        id: false,
      },
      occupation: "Filmmaker",
      education: "Media School",
      relationshipGoal: "Serious relationship",
      lastActiveLabel: "Active 1h ago",
      prompt: "Sunday plan: old city walk and chai spot hopping.",
    },
  },
];

const discoverReels = [
  {
    id: "reel_1",
    authorId: "author_kiara",
    sourceUserId: "",
    author: "Kiara Verma",
    handle: "@kiara.v",
    city: "Delhi",
    caption: "Quick transition from work mode to salsa night.",
    thumbnail:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    durationLabel: "00:27",
    baseViewsCount: 15400,
    baseLikesCount: 1870,
  },
  {
    id: "reel_2",
    authorId: "author_aditya",
    sourceUserId: "",
    author: "Aditya Rao",
    handle: "@adi.rao",
    city: "Bangalore",
    caption: "Rooftop coffee review in 15 seconds.",
    thumbnail:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    durationLabel: "00:15",
    baseViewsCount: 10320,
    baseLikesCount: 1190,
  },
  {
    id: "reel_3",
    authorId: "author_sara",
    sourceUserId: "",
    author: "Sara Khan",
    handle: "@sara.k",
    city: "Mumbai",
    caption: "Sunday beach walk plus my favorite lo-fi playlist.",
    thumbnail:
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=900&q=80",
    durationLabel: "00:33",
    baseViewsCount: 22010,
    baseLikesCount: 2740,
  },
];

const swipeCandidates = [
  {
    id: "s1",
    name: "Nyra",
    age: 25,
    city: "Bangalore",
    distanceKm: 4,
    compatibility: 92,
    bio: "Product designer. Loves indie music, rain rides, and cafe journaling.",
    interests: ["Design", "Travel", "Coffee"],
    intent: "dating",
    lastActiveMinutes: 3,
    verification: {
      phone: true,
      selfie: true,
      id: false,
    },
    details: {
      occupation: "Product Designer",
      education: "NIFT",
      relationshipGoal: "Meaningful dating",
      lifestyle: "Art exhibits and cafe hopping",
      lastActiveMinutes: 3,
      lastActiveLabel: "Active now",
      communicationStyle: "Warm and expressive",
    },
    image:
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "s2",
    name: "Arjun",
    age: 28,
    city: "Mumbai",
    distanceKm: 7,
    compatibility: 87,
    bio: "Filmmaker and fitness enthusiast. Looking for real conversations.",
    interests: ["Cinema", "Gym", "Food"],
    intent: "long_term",
    lastActiveMinutes: 12,
    verification: {
      phone: true,
      selfie: false,
      id: false,
    },
    details: {
      occupation: "Filmmaker",
      education: "Media Arts",
      relationshipGoal: "Serious relationship",
      lifestyle: "Gym mornings and movie nights",
      lastActiveMinutes: 12,
      lastActiveLabel: "Active 12m ago",
      communicationStyle: "Direct and clear",
    },
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "s3",
    name: "Sana",
    age: 24,
    city: "Delhi",
    distanceKm: 3,
    compatibility: 89,
    bio: "Social media strategist. Weekend plans include standup and street food.",
    interests: ["Marketing", "Comedy", "Food"],
    intent: "friendship",
    lastActiveMinutes: 34,
    verification: {
      phone: true,
      selfie: true,
      id: true,
    },
    details: {
      occupation: "Social Media Strategist",
      education: "Mass Communication",
      relationshipGoal: "Friendship first",
      lifestyle: "Comedy gigs and city walks",
      lastActiveMinutes: 34,
      lastActiveLabel: "Active 34m ago",
      communicationStyle: "Funny and energetic",
    },
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80",
  },
];

const baseThreads = [
  {
    id: "anaya",
    name: "Anaya",
    status: "Online",
    avatar:
      "https://images.unsplash.com/photo-1542204625-de293a5b7a3b?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "dev",
    name: "Dev",
    status: "Away",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "riya",
    name: "Riya",
    status: "Online",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80",
  },
];

const baseMessages = {
  anaya: [
    { id: "anaya_1", from: "them", text: "Hey! You free this weekend?", sentAt: "6:10 PM" },
    { id: "anaya_2", from: "me", text: "Yes, Sunday works for me.", sentAt: "6:11 PM" },
    { id: "anaya_3", from: "them", text: "That rooftop place looks perfect for Friday.", sentAt: "6:14 PM" },
  ],
  dev: [
    { id: "dev_1", from: "them", text: "Can we do coffee near Indiranagar?", sentAt: "4:02 PM" },
    { id: "dev_2", from: "me", text: "Done. 6:30 PM?", sentAt: "4:08 PM" },
  ],
  riya: [
    { id: "riya_1", from: "them", text: "I found a fun board-game cafe.", sentAt: "2:24 PM" },
    { id: "riya_2", from: "me", text: "Nice. Sharing location?", sentAt: "2:30 PM" },
    { id: "riya_3", from: "them", text: "Sending you playlist in 5 mins.", sentAt: "2:32 PM" },
  ],
};

let users = getInitialUsers();
let discoverState = getInitialDiscoverState();
let swipeState = getInitialSwipeState();
let chatState = getInitialChatState();
let callState = getInitialCallState();
let safetyState = getInitialSafetyState();
let notificationState = getInitialNotificationState();
let billingState = getInitialBillingState();
const tokenUserMap = new Map();

function normalizeUserRecord(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    role: normalizeUserRole(user.role, user.email),
    accountStatus: normalizeAccountStatus(user.accountStatus),
    suspendedUntil: hasFutureDate(user.suspendedUntil) ? user.suspendedUntil : null,
    suspensionReason: typeof user.suspensionReason === "string" ? user.suspensionReason : "",
    lastActiveAt: typeof user.lastActiveAt === "string" ? user.lastActiveAt : new Date().toISOString(),
    createdAt: typeof user.createdAt === "string" ? user.createdAt : new Date().toISOString(),
  };
}

function getInitialUsers() {
  if (typeof window === "undefined") {
    return [seedDemoUser()];
  }

  const saved = safeStorageGet(USERS_STORAGE_KEY);
  if (!saved) {
    const baseUsers = [seedDemoUser()];
    safeStorageSet(USERS_STORAGE_KEY, JSON.stringify(baseUsers));
    return baseUsers;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [seedDemoUser()];
    }
    return parsed.map((item) => normalizeUserRecord(item)).filter(Boolean);
  } catch {
    return [seedDemoUser()];
  }
}

function hydrateFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  const savedUsers = safeStorageGet(USERS_STORAGE_KEY);
  if (savedUsers) {
    try {
      const parsedUsers = JSON.parse(savedUsers);
      if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
        users = parsedUsers.map((item) => normalizeUserRecord(item)).filter(Boolean);
      }
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedDiscoverState = safeStorageGet(DISCOVER_STATE_STORAGE_KEY);
  if (savedDiscoverState) {
    try {
      discoverState = normalizeDiscoverState(JSON.parse(savedDiscoverState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedSwipeState = safeStorageGet(SWIPE_STATE_STORAGE_KEY);
  if (savedSwipeState) {
    try {
      swipeState = normalizeSwipeState(JSON.parse(savedSwipeState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedChatState = safeStorageGet(CHAT_STATE_STORAGE_KEY);
  if (savedChatState) {
    try {
      chatState = normalizeChatState(JSON.parse(savedChatState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedCallState = safeStorageGet(CALL_STATE_STORAGE_KEY);
  if (savedCallState) {
    try {
      callState = normalizeCallState(JSON.parse(savedCallState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedSafetyState = safeStorageGet(SAFETY_STATE_STORAGE_KEY);
  if (savedSafetyState) {
    try {
      safetyState = normalizeSafetyState(JSON.parse(savedSafetyState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedNotificationState = safeStorageGet(NOTIFICATION_STATE_STORAGE_KEY);
  if (savedNotificationState) {
    try {
      notificationState = normalizeNotificationState(JSON.parse(savedNotificationState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }

  const savedBillingState = safeStorageGet(BILLING_STATE_STORAGE_KEY);
  if (savedBillingState) {
    try {
      billingState = normalizeBillingState(JSON.parse(savedBillingState));
    } catch {
      // Ignore invalid payload and continue with in-memory state.
    }
  }
}

function getInitialDiscoverState() {
  const seeded = seedDiscoverState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(DISCOVER_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(DISCOVER_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeDiscoverState(JSON.parse(saved));
    safeStorageSet(DISCOVER_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(DISCOVER_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialSwipeState() {
  const seeded = seedSwipeState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(SWIPE_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(SWIPE_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeSwipeState(JSON.parse(saved));
    safeStorageSet(SWIPE_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(SWIPE_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialChatState() {
  const seeded = seedChatState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(CHAT_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(CHAT_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeChatState(JSON.parse(saved));
    safeStorageSet(CHAT_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(CHAT_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialCallState() {
  const seeded = seedCallState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(CALL_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(CALL_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeCallState(JSON.parse(saved));
    safeStorageSet(CALL_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(CALL_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialSafetyState() {
  const seeded = seedSafetyState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(SAFETY_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(SAFETY_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeSafetyState(JSON.parse(saved));
    safeStorageSet(SAFETY_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(SAFETY_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialNotificationState() {
  const seeded = seedNotificationState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(NOTIFICATION_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(NOTIFICATION_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeNotificationState(JSON.parse(saved));
    safeStorageSet(NOTIFICATION_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(NOTIFICATION_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function getInitialBillingState() {
  const seeded = seedBillingState();

  if (typeof window === "undefined") {
    return seeded;
  }

  const saved = safeStorageGet(BILLING_STATE_STORAGE_KEY);
  if (!saved) {
    safeStorageSet(BILLING_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeBillingState(JSON.parse(saved));
    safeStorageSet(BILLING_STATE_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    safeStorageSet(BILLING_STATE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function seedDiscoverState() {
  return {
    posts: discoverPosts.map((post) => ({
      id: post.id,
      likesCount: post.baseLikesCount,
      likedBy: [],
      comments: [],
      shares: [],
    })),
    reels: discoverReels.map((reel) => ({
      id: reel.id,
      likesCount: reel.baseLikesCount,
      likedBy: [],
      viewsCount: reel.baseViewsCount,
      comments: [],
      shares: [],
    })),
    followsByUser: {},
  };
}

function seedSwipeState() {
  return {
    byUser: {},
  };
}

function seedChatState() {
  return {
    byUser: {},
    directPairs: {},
  };
}

function seedCallState() {
  return {
    sessions: [],
  };
}

function seedSafetyState() {
  return {
    blockedByUser: {},
    unmatchedPairs: {},
    reports: [],
    moderationAudit: [],
  };
}

function seedNotificationState() {
  return {
    byUser: {},
    preferencesByUser: {},
    emailLog: [],
  };
}

function seedBillingState() {
  return {
    byUser: {},
  };
}

function normalizeDiscoverState(state) {
  const seeded = seedDiscoverState();

  if (!state || typeof state !== "object") {
    return seeded;
  }

  const incomingPosts = Array.isArray(state.posts) ? state.posts : [];
  const incomingPostMap = new Map(incomingPosts.map((post) => [post?.id, post]));

  const posts = seeded.posts.map((seededPost) => {
    const incoming = incomingPostMap.get(seededPost.id);
    const parsedLikes = Number(incoming?.likesCount);
    const likesCount = Number.isFinite(parsedLikes) ? Math.max(0, Math.floor(parsedLikes)) : seededPost.likesCount;
    const likedBy = Array.isArray(incoming?.likedBy)
      ? Array.from(new Set(incoming.likedBy.filter((item) => typeof item === "string")))
      : [];
    const comments = Array.isArray(incoming?.comments)
      ? incoming.comments
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("comment"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            text: typeof entry.text === "string" ? entry.text.trim().slice(0, 280) : "",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .filter((entry) => entry.text)
          .slice(-300)
      : [];
    const shares = Array.isArray(incoming?.shares)
      ? incoming.shares
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("share"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            channel: typeof entry.channel === "string" ? entry.channel.slice(0, 24) : "copy_link",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .slice(-500)
      : [];

    return {
      id: seededPost.id,
      likesCount,
      likedBy,
      comments,
      shares,
    };
  });

  const seededPostIds = new Set(posts.map((post) => post.id));
  incomingPosts.forEach((incoming) => {
    if (!incoming || typeof incoming !== "object" || seededPostIds.has(incoming.id)) {
      return;
    }

    const parsedLikes = Number(incoming.likesCount);
    const likesCount = Number.isFinite(parsedLikes) ? Math.max(0, Math.floor(parsedLikes)) : 0;
    const likedBy = Array.isArray(incoming.likedBy)
      ? Array.from(new Set(incoming.likedBy.filter((item) => typeof item === "string")))
      : [];
    const comments = Array.isArray(incoming?.comments)
      ? incoming.comments
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("comment"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            text: typeof entry.text === "string" ? entry.text.trim().slice(0, 280) : "",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .filter((entry) => entry.text)
          .slice(-300)
      : [];
    const shares = Array.isArray(incoming?.shares)
      ? incoming.shares
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("share"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            channel: typeof entry.channel === "string" ? entry.channel.slice(0, 24) : "copy_link",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .slice(-500)
      : [];

    if (typeof incoming.id === "string" && incoming.id) {
      posts.push({
        id: incoming.id,
        likesCount,
        likedBy,
        comments,
        shares,
      });
    }
  });

  const incomingReels = Array.isArray(state.reels) ? state.reels : [];
  const incomingReelMap = new Map(incomingReels.map((reel) => [reel?.id, reel]));
  const reels = seeded.reels.map((seededReel) => {
    const incoming = incomingReelMap.get(seededReel.id);
    const parsedLikes = Number(incoming?.likesCount);
    const parsedViews = Number(incoming?.viewsCount);
    const likesCount = Number.isFinite(parsedLikes) ? Math.max(0, Math.floor(parsedLikes)) : seededReel.likesCount;
    const viewsCount = Number.isFinite(parsedViews) ? Math.max(0, Math.floor(parsedViews)) : seededReel.viewsCount;
    const likedBy = Array.isArray(incoming?.likedBy)
      ? Array.from(new Set(incoming.likedBy.filter((item) => typeof item === "string")))
      : [];
    const comments = Array.isArray(incoming?.comments)
      ? incoming.comments
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("comment"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            text: typeof entry.text === "string" ? entry.text.trim().slice(0, 280) : "",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .filter((entry) => entry.text)
          .slice(-300)
      : [];
    const shares = Array.isArray(incoming?.shares)
      ? incoming.shares
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("share"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            channel: typeof entry.channel === "string" ? entry.channel.slice(0, 24) : "copy_link",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .slice(-500)
      : [];

    return {
      id: seededReel.id,
      likesCount,
      likedBy,
      viewsCount,
      comments,
      shares,
    };
  });

  const seededReelIds = new Set(reels.map((reel) => reel.id));
  incomingReels.forEach((incoming) => {
    if (!incoming || typeof incoming !== "object" || seededReelIds.has(incoming.id)) {
      return;
    }
    const parsedLikes = Number(incoming?.likesCount);
    const parsedViews = Number(incoming?.viewsCount);
    const likesCount = Number.isFinite(parsedLikes) ? Math.max(0, Math.floor(parsedLikes)) : 0;
    const viewsCount = Number.isFinite(parsedViews) ? Math.max(0, Math.floor(parsedViews)) : 0;
    const likedBy = Array.isArray(incoming?.likedBy)
      ? Array.from(new Set(incoming.likedBy.filter((item) => typeof item === "string")))
      : [];
    const comments = Array.isArray(incoming?.comments)
      ? incoming.comments
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("comment"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            text: typeof entry.text === "string" ? entry.text.trim().slice(0, 280) : "",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .filter((entry) => entry.text)
          .slice(-300)
      : [];
    const shares = Array.isArray(incoming?.shares)
      ? incoming.shares
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => ({
            id: typeof entry.id === "string" ? entry.id : createId("share"),
            userId: typeof entry.userId === "string" ? entry.userId : "",
            channel: typeof entry.channel === "string" ? entry.channel.slice(0, 24) : "copy_link",
            createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
          }))
          .slice(-500)
      : [];

    if (typeof incoming.id === "string" && incoming.id) {
      reels.push({
        id: incoming.id,
        likesCount,
        likedBy,
        viewsCount,
        comments,
        shares,
      });
    }
  });

  const followsByUser = {};
  if (state.followsByUser && typeof state.followsByUser === "object") {
    Object.entries(state.followsByUser).forEach(([userId, authors]) => {
      if (typeof userId !== "string") {
        return;
      }
      followsByUser[userId] = Array.isArray(authors)
        ? Array.from(new Set(authors.filter((item) => typeof item === "string")))
        : [];
    });
  }

  return {
    posts,
    reels,
    followsByUser,
  };
}

function normalizeSwipeState(state) {
  if (!state || typeof state !== "object") {
    return seedSwipeState();
  }

  const byUser = {};
  const sourceByUser = state.byUser && typeof state.byUser === "object" ? state.byUser : {};

  Object.entries(sourceByUser).forEach(([userId, userState]) => {
    if (typeof userId !== "string") {
      return;
    }

    const stats = normalizeSwipeStats(userState?.stats);
    const history = Array.isArray(userState?.history)
      ? userState.history
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : createId("swipe"),
            profileId: typeof item.profileId === "string" ? item.profileId : "",
            profileName: typeof item.profileName === "string" ? item.profileName : "",
            action: ["pass", "like", "superlike"].includes(item.action) ? item.action : "pass",
            matched: Boolean(item.matched),
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          }))
          .filter((item) => item.profileId)
          .slice(-120)
      : [];

    const actionsByTarget = {};
    const sourceActions =
      userState?.actionsByTarget && typeof userState.actionsByTarget === "object"
        ? userState.actionsByTarget
        : {};
    Object.entries(sourceActions).forEach(([targetUserId, action]) => {
      if (typeof targetUserId === "string" && ["pass", "like", "superlike"].includes(action)) {
        actionsByTarget[targetUserId] = action;
      }
    });

    byUser[userId] = {
      stats,
      history,
      actionsByTarget,
    };
  });

  return { byUser };
}

function normalizeChatState(state) {
  if (!state || typeof state !== "object") {
    return seedChatState();
  }

  const byUser = {};
  const directPairs = {};
  const sourceByUser = state.byUser && typeof state.byUser === "object" ? state.byUser : {};

  Object.entries(sourceByUser).forEach(([userId, userChat]) => {
    if (typeof userId !== "string") {
      return;
    }

    const sourceThreads = Array.isArray(userChat?.threads) && userChat.threads.length
      ? userChat.threads
      : cloneBaseThreads();

    const threads = sourceThreads
      .filter((thread) => thread && typeof thread === "object" && typeof thread.id === "string")
      .map((thread) => ({
        id: thread.id,
        name: typeof thread.name === "string" ? thread.name : "Unknown",
        status: typeof thread.status === "string" ? thread.status : "Offline",
        avatar:
          typeof thread.avatar === "string"
            ? thread.avatar
            : "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
        kind: thread.kind === "direct" ? "direct" : "seeded",
        peerUserId: typeof thread.peerUserId === "string" ? thread.peerUserId : "",
        peerThreadId: typeof thread.peerThreadId === "string" ? thread.peerThreadId : "",
      }));

    const messageMap = {};
    const sourceMessages = userChat?.messages && typeof userChat.messages === "object" ? userChat.messages : {};

    threads.forEach((thread) => {
      const fallbackMessages = baseMessages[thread.id] ?? [];
      const list = Array.isArray(sourceMessages[thread.id]) ? sourceMessages[thread.id] : fallbackMessages;

      messageMap[thread.id] = list
        .map((message) => normalizeMessage(message))
        .filter(Boolean);
    });

    byUser[userId] = {
      threads,
      messages: messageMap,
    };
  });

  const sourceDirectPairs =
    state.directPairs && typeof state.directPairs === "object" ? state.directPairs : {};
  Object.entries(sourceDirectPairs).forEach(([pairKey, mapping]) => {
    if (!pairKey || !mapping || typeof mapping !== "object") {
      return;
    }

    const normalizedMapping = {};
    Object.entries(mapping).forEach(([userId, threadId]) => {
      if (typeof userId === "string" && typeof threadId === "string") {
        normalizedMapping[userId] = threadId;
      }
    });

    if (Object.keys(normalizedMapping).length >= 2) {
      directPairs[pairKey] = normalizedMapping;
    }
  });

  return { byUser, directPairs };
}

function normalizeSafetyState(state) {
  if (!state || typeof state !== "object") {
    return seedSafetyState();
  }

  const blockedByUser = {};
  const sourceBlocked = state.blockedByUser && typeof state.blockedByUser === "object" ? state.blockedByUser : {};
  Object.entries(sourceBlocked).forEach(([userId, blockedIds]) => {
    if (typeof userId !== "string") {
      return;
    }
    blockedByUser[userId] = Array.isArray(blockedIds)
      ? Array.from(new Set(blockedIds.filter((item) => typeof item === "string")))
      : [];
  });

  const unmatchedPairs = {};
  const sourceUnmatched = state.unmatchedPairs && typeof state.unmatchedPairs === "object" ? state.unmatchedPairs : {};
  Object.entries(sourceUnmatched).forEach(([pairKey, value]) => {
    if (typeof pairKey !== "string" || !pairKey.trim()) {
      return;
    }
    unmatchedPairs[pairKey] = Boolean(value);
  });

  const reports = Array.isArray(state.reports)
    ? state.reports
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : createId("report"),
          kind: item.kind === "user" ? "user" : "message",
          reporterUserId: typeof item.reporterUserId === "string" ? item.reporterUserId : "",
          targetUserId: typeof item.targetUserId === "string" ? item.targetUserId : "",
          threadId: typeof item.threadId === "string" ? item.threadId : "",
          messageId: typeof item.messageId === "string" ? item.messageId : "",
          reason: typeof item.reason === "string" ? item.reason : "Not provided",
          createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
          status: ["open", "under_review", "resolved", "dismissed"].includes(item.status) ? item.status : "open",
          actionTaken: typeof item.actionTaken === "string" ? item.actionTaken : "",
          reviewedByUserId: typeof item.reviewedByUserId === "string" ? item.reviewedByUserId : "",
          reviewedAt: typeof item.reviewedAt === "string" ? item.reviewedAt : "",
          resolutionNote: typeof item.resolutionNote === "string" ? item.resolutionNote : "",
        }))
        .filter((item) => item.reporterUserId)
        .slice(-800)
    : [];

  const moderationAudit = Array.isArray(state.moderationAudit)
    ? state.moderationAudit
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : createId("audit"),
          actorUserId: typeof item.actorUserId === "string" ? item.actorUserId : "",
          targetUserId: typeof item.targetUserId === "string" ? item.targetUserId : "",
          reportId: typeof item.reportId === "string" ? item.reportId : "",
          action: typeof item.action === "string" ? item.action : "",
          note: typeof item.note === "string" ? item.note : "",
          createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        }))
        .slice(-2000)
    : [];

  return {
    blockedByUser,
    unmatchedPairs,
    reports,
    moderationAudit,
  };
}

function normalizeNotificationState(state) {
  if (!state || typeof state !== "object") {
    return seedNotificationState();
  }

  const byUser = {};
  const sourceByUser = state.byUser && typeof state.byUser === "object" ? state.byUser : {};
  Object.entries(sourceByUser).forEach(([userId, notifications]) => {
    if (typeof userId !== "string") {
      return;
    }

    byUser[userId] = Array.isArray(notifications)
      ? notifications
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : createId("notice"),
            type:
              typeof item.type === "string" && NOTIFICATION_TYPES.includes(item.type)
                ? item.type
                : "system",
            title: typeof item.title === "string" ? item.title : "Notification",
            message: typeof item.message === "string" ? item.message : "",
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
            read: Boolean(item.read),
            actionLabel: typeof item.actionLabel === "string" ? item.actionLabel : "",
            actionTab: typeof item.actionTab === "string" ? item.actionTab : "",
            deliveryChannels:
              item.deliveryChannels && typeof item.deliveryChannels === "object"
                ? {
                    inApp: Boolean(item.deliveryChannels.inApp),
                    browser: Boolean(item.deliveryChannels.browser),
                    email: Boolean(item.deliveryChannels.email),
                  }
                : { inApp: true, browser: false, email: false },
          }))
          .slice(-200)
      : [];
  });

  const preferencesByUser = {};
  const sourcePreferences =
    state.preferencesByUser && typeof state.preferencesByUser === "object" ? state.preferencesByUser : {};
  Object.entries(sourcePreferences).forEach(([userId, preferences]) => {
    if (typeof userId !== "string") {
      return;
    }
    preferencesByUser[userId] = normalizeNotificationPreferences(preferences);
  });

  const emailLog = Array.isArray(state.emailLog)
    ? state.emailLog
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => ({
          id: typeof entry.id === "string" ? entry.id : createId("email"),
          userId: typeof entry.userId === "string" ? entry.userId : "",
          type:
            typeof entry.type === "string" && NOTIFICATION_TYPES.includes(entry.type)
              ? entry.type
              : "system",
          title: typeof entry.title === "string" ? entry.title : "Notification",
          message: typeof entry.message === "string" ? entry.message : "",
          status: typeof entry.status === "string" ? entry.status : "queued",
          createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        }))
        .filter((entry) => entry.userId)
        .slice(-2000)
    : [];

  return { byUser, preferencesByUser, emailLog };
}

function normalizeBillingState(state) {
  if (!state || typeof state !== "object") {
    return seedBillingState();
  }

  const byUser = {};
  const sourceByUser = state.byUser && typeof state.byUser === "object" ? state.byUser : {};
  Object.entries(sourceByUser).forEach(([userId, payload]) => {
    if (typeof userId !== "string") {
      return;
    }

    const sessions = Array.isArray(payload?.sessions)
      ? payload.sessions
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : createId("checkout"),
            planId: normalizeSubscriptionPlan(item.planId),
            amount: toNonNegativeInteger(item.amount),
            currency: typeof item.currency === "string" ? item.currency : "USD",
            status: typeof item.status === "string" ? item.status : "pending",
            provider: typeof item.provider === "string" ? item.provider : "Razorpay Sandbox",
            orderRef: typeof item.orderRef === "string" ? item.orderRef : `ORD-${createId("ord").slice(-8).toUpperCase()}`,
            gatewayOrderId: typeof item.gatewayOrderId === "string" ? item.gatewayOrderId : "",
            keyId: typeof item.keyId === "string" ? item.keyId : "",
            description: typeof item.description === "string" ? item.description : "",
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
            expiresAt: typeof item.expiresAt === "string" ? item.expiresAt : new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          }))
          .slice(-100)
      : [];

    const history = Array.isArray(payload?.history)
      ? payload.history
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            id: typeof item.id === "string" ? item.id : createId("txn"),
            planId: normalizeSubscriptionPlan(item.planId),
            planName: typeof item.planName === "string" ? item.planName : getPlanById(item.planId).name,
            amount: toNonNegativeInteger(item.amount),
            currency: typeof item.currency === "string" ? item.currency : "USD",
            status: typeof item.status === "string" ? item.status : "paid",
            provider: typeof item.provider === "string" ? item.provider : "Razorpay Sandbox",
            paymentRef: typeof item.paymentRef === "string" ? item.paymentRef : `PAY-${createId("pay").slice(-8).toUpperCase()}`,
            paidAt: typeof item.paidAt === "string" ? item.paidAt : new Date().toISOString(),
          }))
          .slice(-200)
      : [];

    byUser[userId] = {
      sessions,
      history,
    };
  });

  return { byUser };
}

function normalizeCallState(state) {
  const seeded = seedCallState();
  if (!state || typeof state !== "object") {
    return seeded;
  }

  const sessions = Array.isArray(state.sessions)
    ? state.sessions
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const status =
            item.status === "ringing" ||
            item.status === "accepted" ||
            item.status === "declined" ||
            item.status === "missed" ||
            item.status === "cancelled" ||
            item.status === "ended"
              ? item.status
              : "ended";
          const type = item.type === "video" ? "video" : "voice";

          return {
            id: typeof item.id === "string" ? item.id : createId("call"),
            callerUserId: typeof item.callerUserId === "string" ? item.callerUserId : "",
            calleeUserId: typeof item.calleeUserId === "string" ? item.calleeUserId : "",
            type,
            status,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
            answeredAt: typeof item.answeredAt === "string" ? item.answeredAt : "",
            endedAt: typeof item.endedAt === "string" ? item.endedAt : "",
            endedByUserId: typeof item.endedByUserId === "string" ? item.endedByUserId : "",
            declineReason: typeof item.declineReason === "string" ? item.declineReason : "",
          };
        })
        .filter((item) => item.callerUserId && item.calleeUserId && item.callerUserId !== item.calleeUserId)
        .slice(-400)
    : [];

  return {
    sessions,
  };
}

function seedDemoUser() {
  return {
    id: "user_demo",
    name: "Demo User",
    email: "demo@spark.app",
    password: "demo1234",
    interests: ["Music", "Travel", "Coffee"],
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
    age: 27,
    city: "Delhi",
    bio: "Intentional conversations, weekend coffee, and honest vibes.",
    intent: "dating",
    verification: {
      phone: true,
      selfie: true,
      id: false,
    },
    subscriptionPlan: "starter",
    subscriptionStatus: "free",
    subscriptionRenewsAt: null,
    role: "admin",
    accountStatus: "active",
    suspendedUntil: null,
    suspensionReason: "",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function cloneBaseThreads() {
  return baseThreads.map((thread) => ({ ...thread, kind: "seeded", peerUserId: "", peerThreadId: "" }));
}

function cloneBaseMessages() {
  const output = {};
  Object.entries(baseMessages).forEach(([threadId, messages]) => {
    output[threadId] = messages.map((message) => ({ ...message }));
  });
  return output;
}

function createUserSwipeState() {
  return {
    stats: {
      likes: 0,
      matches: 0,
      superLikes: 0,
      passes: 0,
    },
    history: [],
    actionsByTarget: {},
  };
}

function createUserChatState() {
  return {
    threads: cloneBaseThreads(),
    messages: cloneBaseMessages(),
  };
}

function createUserNotificationState(userId) {
  const welcomeTitle = "Welcome to Spark";
  const welcomeMessage = "Complete your profile and start matching with verified users.";
  return [
    {
      id: createId("notice"),
      type: "system",
      title: welcomeTitle,
      message: welcomeMessage,
      createdAt: new Date().toISOString(),
      read: false,
      actionLabel: "Open Account",
      actionTab: "auth",
    },
    {
      id: createId("notice"),
      type: "safety",
      title: "Safety Tip",
      message: "Never share personal contact details before trust is established.",
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      read: false,
      actionLabel: "Open Messages",
      actionTab: "chat",
      userId,
    },
  ];
}

function createUserBillingState() {
  return {
    sessions: [],
    history: [],
  };
}

function inferUserRole(email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (ADMIN_EMAIL_ALLOWLIST.includes(normalizedEmail) || normalizedEmail.startsWith("admin@")) {
    return "admin";
  }
  return "member";
}

function createDefaultNotificationPreferences() {
  const base = {};
  NOTIFICATION_TYPES.forEach((type) => {
    base[type] = true;
  });
  return {
    inAppByType: { ...base },
    browserByType: { ...base, billing: false, safety: true },
    emailByType: { ...base, system: false, social: false },
  };
}

function normalizeNotificationChannelMap(value) {
  const source = value && typeof value === "object" ? value : {};
  const defaults = {};
  NOTIFICATION_TYPES.forEach((type) => {
    defaults[type] = true;
  });
  const next = {};
  NOTIFICATION_TYPES.forEach((type) => {
    next[type] = typeof source[type] === "boolean" ? source[type] : defaults[type];
  });
  return next;
}

function normalizeNotificationPreferences(preferences) {
  const source = preferences && typeof preferences === "object" ? preferences : {};
  const defaults = createDefaultNotificationPreferences();
  return {
    inAppByType: normalizeNotificationChannelMap(source.inAppByType || defaults.inAppByType),
    browserByType: normalizeNotificationChannelMap(source.browserByType || defaults.browserByType),
    emailByType: normalizeNotificationChannelMap(source.emailByType || defaults.emailByType),
  };
}

function ensureUserSwipeState(userId) {
  if (!swipeState.byUser[userId]) {
    swipeState.byUser[userId] = createUserSwipeState();
    persistSwipeState();
  }

  return swipeState.byUser[userId];
}

function ensureUserChatState(userId) {
  if (!chatState.byUser[userId]) {
    chatState.byUser[userId] = createUserChatState();
    persistChatState();
  }

  return chatState.byUser[userId];
}

function ensureUserNotificationState(userId) {
  if (!notificationState.byUser[userId]) {
    notificationState.byUser[userId] = createUserNotificationState(userId);
    persistNotificationState();
  }
  return notificationState.byUser[userId];
}

function ensureUserNotificationPreferences(userId) {
  if (!notificationState.preferencesByUser[userId]) {
    notificationState.preferencesByUser[userId] = createDefaultNotificationPreferences();
    persistNotificationState();
  } else {
    notificationState.preferencesByUser[userId] = normalizeNotificationPreferences(
      notificationState.preferencesByUser[userId],
    );
  }
  return notificationState.preferencesByUser[userId];
}

function ensureUserBillingState(userId) {
  if (!billingState.byUser[userId]) {
    billingState.byUser[userId] = createUserBillingState();
    persistBillingState();
  }
  return billingState.byUser[userId];
}

function pushNotification(userId, payload) {
  if (!userId) {
    return;
  }

  const type =
    typeof payload?.type === "string" && NOTIFICATION_TYPES.includes(payload.type) ? payload.type : "system";
  const preferences = ensureUserNotificationPreferences(userId);
  const inAppEnabled = Boolean(preferences.inAppByType?.[type]);
  const browserEnabled = Boolean(preferences.browserByType?.[type]);
  const emailEnabled = Boolean(preferences.emailByType?.[type]);

  if (!inAppEnabled && !emailEnabled) {
    return;
  }

  const current = ensureUserNotificationState(userId);
  const nextNotification = {
    id: createId("notice"),
    type,
    title: typeof payload?.title === "string" && payload.title.trim() ? payload.title.trim() : "Notification",
    message: typeof payload?.message === "string" ? payload.message.trim() : "",
    createdAt: new Date().toISOString(),
    read: false,
    actionLabel: typeof payload?.actionLabel === "string" ? payload.actionLabel : "",
    actionTab: typeof payload?.actionTab === "string" ? payload.actionTab : "",
    deliveryChannels: {
      inApp: inAppEnabled,
      browser: browserEnabled,
      email: emailEnabled,
    },
  };

  if (inAppEnabled) {
    notificationState.byUser[userId] = [nextNotification, ...current].slice(0, 200);
  }

  if (emailEnabled) {
    notificationState.emailLog = [
      {
        id: createId("email"),
        userId,
        type,
        title: nextNotification.title,
        message: nextNotification.message,
        status: "queued",
        createdAt: new Date().toISOString(),
      },
      ...(Array.isArray(notificationState.emailLog) ? notificationState.emailLog : []),
    ].slice(0, 2000);
  }

  persistNotificationState();
}

function normalizeSwipeStats(stats) {
  return {
    likes: toNonNegativeInteger(stats?.likes),
    matches: toNonNegativeInteger(stats?.matches),
    superLikes: toNonNegativeInteger(stats?.superLikes),
    passes: toNonNegativeInteger(stats?.passes),
  };
}

function toNonNegativeInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.floor(parsed));
}

function normalizeMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }

  const text = typeof message.text === "string" ? message.text.trim() : "";
  if (!text) {
    return null;
  }

  return {
    id: typeof message.id === "string" ? message.id : createId("msg"),
    from: message.from === "me" ? "me" : "them",
    text,
    sentAt: typeof message.sentAt === "string" ? message.sentAt : getCurrentTimeLabel(),
    deliveryStatus:
      message.deliveryStatus === "read" ? "read" : message.deliveryStatus === "delivered" ? "delivered" : "sent",
    reactions:
      message.reactions && typeof message.reactions === "object"
        ? Object.fromEntries(
            Object.entries(message.reactions)
              .filter(([emoji, count]) => typeof emoji === "string" && Number.isFinite(Number(count)))
              .map(([emoji, count]) => [emoji, toNonNegativeInteger(count)]),
          )
        : {},
    replyTo:
      message.replyTo && typeof message.replyTo === "object"
        ? {
            id: typeof message.replyTo.id === "string" ? message.replyTo.id : "",
            text: typeof message.replyTo.text === "string" ? message.replyTo.text.slice(0, 120) : "",
          }
        : null,
  };
}

function persistUsers() {
  safeStorageSet(USERS_STORAGE_KEY, JSON.stringify(users));
}

function persistDiscoverState() {
  safeStorageSet(DISCOVER_STATE_STORAGE_KEY, JSON.stringify(discoverState));
}

function persistSwipeState() {
  safeStorageSet(SWIPE_STATE_STORAGE_KEY, JSON.stringify(swipeState));
}

function persistChatState() {
  safeStorageSet(CHAT_STATE_STORAGE_KEY, JSON.stringify(chatState));
}

function persistCallState() {
  safeStorageSet(CALL_STATE_STORAGE_KEY, JSON.stringify(callState));
}

function persistSafetyState() {
  safeStorageSet(SAFETY_STATE_STORAGE_KEY, JSON.stringify(safetyState));
}

function persistNotificationState() {
  safeStorageSet(NOTIFICATION_STATE_STORAGE_KEY, JSON.stringify(notificationState));
}

function persistBillingState() {
  safeStorageSet(BILLING_STATE_STORAGE_KEY, JSON.stringify(billingState));
}

function normalizeVerificationState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    phone: Boolean(source.phone),
    selfie: Boolean(source.selfie),
    id: Boolean(source.id),
  };
}

function normalizeIntent(value, seed = "") {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["dating", "friendship", "long_term", "casual"].includes(normalized)) {
    return normalized;
  }
  const fallbacks = ["dating", "friendship", "long_term", "casual"];
  return fallbacks[hashValue(seed) % fallbacks.length];
}

function normalizeSubscriptionPlan(value) {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SUBSCRIPTION_PLANS.some((plan) => plan.id === candidate) ? candidate : "starter";
}

function getPlanById(planId) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) ?? SUBSCRIPTION_PLANS[0];
}

function normalizeSubscriptionStatus(value) {
  const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ["active", "trial", "canceled", "free"].includes(candidate) ? candidate : "free";
}

function applySubscriptionPlan(userId, nextPlanId) {
  const userIndex = users.findIndex((item) => item.id === userId);
  if (userIndex < 0) {
    throw new Error("User not found.");
  }

  const nextStatus = nextPlanId === "starter" ? "free" : "active";
  const renewsAt = nextPlanId === "starter" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  users[userIndex] = {
    ...users[userIndex],
    subscriptionPlan: nextPlanId,
    subscriptionStatus: nextStatus,
    subscriptionRenewsAt: renewsAt,
  };
  persistUsers();

  return {
    user: users[userIndex],
    status: nextStatus,
    renewsAt,
  };
}

function buildSubscriptionSnapshot(user) {
  const currentPlanId = normalizeSubscriptionPlan(user.subscriptionPlan);
  const userBilling = ensureUserBillingState(user.id);

  return {
    currentPlan: currentPlanId,
    status: normalizeSubscriptionStatus(user.subscriptionStatus),
    renewsAt: typeof user.subscriptionRenewsAt === "string" ? user.subscriptionRenewsAt : null,
    plans: SUBSCRIPTION_PLANS.map((plan) => ({
      ...plan,
      isCurrent: plan.id === currentPlanId,
    })),
    billingHistory: [...userBilling.history]
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .slice(0, 15),
  };
}

function formatCurrencyAmount(amountMinor, currency = "USD") {
  const safeAmount = toNonNegativeInteger(amountMinor) / 100;
  const safeCurrency = typeof currency === "string" && currency ? currency.toUpperCase() : "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: safeCurrency }).format(safeAmount);
  } catch {
    return `${safeCurrency} ${safeAmount.toFixed(2)}`;
  }
}

function getProfileCompletionScore(user) {
  const profile = normalizeUserProfile(user);
  let score = 0;
  if (profile.name && profile.name !== "Spark Member") score += 16;
  if (profile.email) score += 12;
  if (profile.avatar && profile.avatar !== DEFAULT_AVATAR_URL) score += 12;
  if (profile.age >= 18) score += 10;
  if (profile.city) score += 10;
  if (profile.bio && profile.bio.length >= 20) score += 14;
  if (profile.interests.length >= 2) score += 14;
  if (profile.intent) score += 8;
  if (profile.verification.phone) score += 2;
  if (profile.verification.selfie) score += 1;
  if (profile.verification.id) score += 1;
  return Math.min(100, score);
}

function toPublicUser(user) {
  const { password, passwordHash, passwordSalt, ...publicData } = user;
  const subscriptionPlan = normalizeSubscriptionPlan(publicData.subscriptionPlan);
  const planMeta = getPlanById(subscriptionPlan);
  return {
    ...publicData,
    role: normalizeUserRole(publicData.role, publicData.email),
    accountStatus: normalizeAccountStatus(publicData.accountStatus),
    suspendedUntil: hasFutureDate(publicData.suspendedUntil) ? publicData.suspendedUntil : null,
    suspensionReason: typeof publicData.suspensionReason === "string" ? publicData.suspensionReason : "",
    intent: normalizeIntent(publicData.intent, publicData.id || publicData.email || publicData.name),
    verification: normalizeVerificationState(publicData.verification),
    subscriptionPlan,
    subscriptionStatus: normalizeSubscriptionStatus(publicData.subscriptionStatus),
    subscriptionRenewsAt:
      typeof publicData.subscriptionRenewsAt === "string" && publicData.subscriptionRenewsAt
        ? publicData.subscriptionRenewsAt
        : null,
    subscriptionPlanMeta: planMeta,
    profileCompletionScore: getProfileCompletionScore(publicData),
  };
}

function createToken(userId) {
  return `mock|${encodeURIComponent(userId)}|${Date.now()}`;
}

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function splitInterests(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hashValue(input) {
  const value = String(input ?? "");
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFromPool(pool, seed) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return "";
  }
  return pool[hashValue(seed) % pool.length];
}

function normalizeUserProfile(user) {
  const interests = splitInterests(user?.interests);
  const derivedCity = pickFromPool(CITY_POOL, user?.id || user?.email || user?.name);
  const derivedAge = 21 + (hashValue(user?.id || user?.email || "spark") % 12);
  const derivedBio = interests.length
    ? `Into ${interests.slice(0, 3).join(", ")}. Looking for genuine connection.`
    : pickFromPool(BIO_FALLBACKS, user?.id || user?.name);

  return {
    id: user?.id,
    name: user?.name || "Spark Member",
    email: user?.email || "",
    avatar: user?.avatar || DEFAULT_AVATAR_URL,
    interests,
    intent: normalizeIntent(user?.intent, user?.id || user?.email || user?.name),
    verification: normalizeVerificationState(user?.verification),
    age: toNonNegativeInteger(user?.age) || derivedAge,
    city: typeof user?.city === "string" && user.city.trim() ? user.city.trim() : derivedCity,
    bio: typeof user?.bio === "string" && user.bio.trim() ? user.bio.trim() : derivedBio,
  };
}

function buildUserHandle(user) {
  const base = (user?.name || "spark member")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  const shortId = (user?.id || "user").replace(/[^a-z0-9]/gi, "").slice(-4).toLowerCase();
  return `@${base || "spark.member"}${shortId ? `.${shortId}` : ""}`;
}

function formatLastActiveLabel(minutes) {
  const safeMinutes = toNonNegativeInteger(minutes);
  if (safeMinutes <= 2) {
    return "Active now";
  }
  if (safeMinutes < 60) {
    return `Active ${safeMinutes}m ago`;
  }
  const hours = Math.max(1, Math.round(safeMinutes / 60));
  if (hours < 24) {
    return `Active ${hours}h ago`;
  }
  const days = Math.max(1, Math.round(hours / 24));
  return `Active ${days}d ago`;
}

function buildUserProfilePreview(profile) {
  const occupationPool = ["Product Designer", "Software Engineer", "Marketing Lead", "Consultant", "Founder"];
  const educationPool = ["Delhi University", "IIT", "NIFT", "Symbiosis", "Christ University"];
  const lastActiveMinutes = hashValue(`${profile.id}_discover_last_active`) % 360;

  return {
    id: profile.id,
    avatar: profile.avatar,
    age: profile.age,
    city: profile.city,
    intent: profile.intent,
    interests: profile.interests.length ? profile.interests : ["Coffee", "Conversations"],
    verification: {
      phone: Boolean(profile.verification?.phone),
      selfie: Boolean(profile.verification?.selfie),
      id: Boolean(profile.verification?.id),
    },
    occupation: pickFromPool(occupationPool, `${profile.id}_occupation`),
    education: pickFromPool(educationPool, `${profile.id}_education`),
    relationshipGoal:
      profile.intent === "long_term"
        ? "Serious relationship"
        : profile.intent === "friendship"
          ? "Like-minded friendship"
          : profile.intent === "casual"
            ? "Casual dating"
            : "Meaningful dating",
    lastActiveMinutes,
    lastActiveLabel: formatLastActiveLabel(lastActiveMinutes),
    prompt: `Conversation spark: ${profile.interests[0] || "Travel"} stories over coffee.`,
  };
}

function buildUserDiscoverPost(user) {
  const profile = normalizeUserProfile(user);
  return {
    id: `post_user_${profile.id}`,
    authorId: `author_${profile.id}`,
    author: profile.name,
    handle: buildUserHandle(profile),
    time: "new",
    caption: profile.bio,
    image: profile.avatar,
    baseLikesCount: 0,
    comments: 0,
    sourceUserId: profile.id,
    profile: buildUserProfilePreview(profile),
  };
}

function buildDiscoverPostsForUser(viewerUserId) {
  const communityPosts = users
    .filter((user) => user.id !== viewerUserId)
    .filter((user) => !isUserBlocked(viewerUserId, user.id))
    .filter((user) => !isPairUnmatched(viewerUserId, user.id))
    .map((user) => buildUserDiscoverPost(user));

  return [...communityPosts, ...discoverPosts];
}

function buildUserReel(user) {
  const profile = normalizeUserProfile(user);
  const lastActiveMinutes = hashValue(`${profile.id}_reel_last_active`) % 420;
  const viewsBase = 700 + (hashValue(`${profile.id}_reel_views`) % 14000);
  const likesBase = 80 + (hashValue(`${profile.id}_reel_likes`) % 2200);

  return {
    id: `reel_user_${profile.id}`,
    authorId: `author_${profile.id}`,
    sourceUserId: profile.id,
    author: profile.name,
    handle: buildUserHandle(profile),
    city: profile.city,
    caption: `Day snapshot: ${profile.interests[0] || "City vibes"} and intentional conversations.`,
    thumbnail: profile.avatar,
    durationLabel: `00:${String(12 + (hashValue(profile.id) % 35)).padStart(2, "0")}`,
    baseViewsCount: viewsBase,
    baseLikesCount: likesBase,
    lastActiveLabel: formatLastActiveLabel(lastActiveMinutes),
  };
}

function buildDiscoverReelsForUser(viewerUserId) {
  const communityReels = users
    .filter((user) => user.id !== viewerUserId)
    .filter((user) => !isUserBlocked(viewerUserId, user.id))
    .filter((user) => !isPairUnmatched(viewerUserId, user.id))
    .slice(0, 20)
    .map((user) => buildUserReel(user));

  return [...communityReels, ...discoverReels];
}

function normalizeSearchFilters(payload = {}) {
  const minAgeInput = toNonNegativeInteger(payload?.minAge);
  const maxAgeInput = toNonNegativeInteger(payload?.maxAge);
  const minAge = minAgeInput > 0 ? minAgeInput : 18;
  const maxAge = maxAgeInput >= minAge ? maxAgeInput : 60;
  return {
    query: typeof payload?.query === "string" ? payload.query.trim().toLowerCase().slice(0, 80) : "",
    city: typeof payload?.city === "string" ? payload.city.trim().toLowerCase().slice(0, 40) : "",
    intent: typeof payload?.intent === "string" ? payload.intent.trim().toLowerCase().slice(0, 24) : "",
    interest: typeof payload?.interest === "string" ? payload.interest.trim().toLowerCase().slice(0, 30) : "",
    minAge,
    maxAge,
  };
}

function calculateRecommendationScore(viewerProfile, candidate) {
  let score = Number(candidate.compatibility) || 70;
  if (viewerProfile?.intent && candidate?.intent && viewerProfile.intent === candidate.intent) {
    score += 9;
  }
  const viewerInterests = Array.isArray(viewerProfile?.interests)
    ? viewerProfile.interests.map((item) => String(item).toLowerCase())
    : [];
  const candidateInterests = Array.isArray(candidate?.interests)
    ? candidate.interests.map((item) => String(item).toLowerCase())
    : [];
  const sharedInterests = viewerInterests.filter((item) => candidateInterests.includes(item));
  score += Math.min(18, sharedInterests.length * 6);
  score += Math.max(0, 12 - Math.min(12, Number(candidate.distanceKm) || 0));
  return {
    score: Math.min(99, Math.max(52, Math.round(score))),
    sharedInterests,
  };
}

function buildSearchResultItem(candidate) {
  return {
    id: candidate.id,
    sourceUserId: candidate.sourceUserId || "",
    name: candidate.name,
    age: candidate.age,
    city: candidate.city,
    intent: candidate.intent,
    interests: candidate.interests || [],
    bio: candidate.bio,
    avatar: candidate.image || DEFAULT_AVATAR_URL,
    compatibility: Number(candidate.compatibility) || 0,
    distanceKm: Number(candidate.distanceKm) || 0,
    verification: normalizeVerificationState(candidate.verification),
    lastActiveLabel: candidate.details?.lastActiveLabel || "Recently active",
  };
}

function buildUserSwipeCandidate(user) {
  const profile = normalizeUserProfile(user);
  const compatibilityBase = 72 + (hashValue(`${profile.id}_compat`) % 24);
  const distanceBase = 1 + (hashValue(`${profile.id}_distance`) % 14);
  const interestScore = 66 + (hashValue(`${profile.id}_interest`) % 28);
  const communicationScore = 61 + (hashValue(`${profile.id}_comms`) % 33);
  const lifestyleScore = 63 + (hashValue(`${profile.id}_lifestyle`) % 31);
  const intentScore = profile.intent === "long_term" ? 92 : profile.intent === "dating" ? 86 : 74;
  const professionPool = ["Product Designer", "Engineer", "Consultant", "Content Creator", "Architect"];
  const educationPool = ["Delhi University", "Mumbai University", "IIT", "NID", "IIM"];
  const lastActiveMinutes = hashValue(`${profile.id}_swipe_last_active`) % 720;

  return {
    id: `profile_${profile.id}`,
    sourceUserId: profile.id,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    distanceKm: distanceBase,
    compatibility: compatibilityBase,
    bio: profile.bio,
    interests: profile.interests.length ? profile.interests : ["Coffee", "Conversations"],
    intent: profile.intent,
    image: profile.avatar,
    verification: profile.verification,
    lastActiveMinutes,
    details: {
      occupation: pickFromPool(professionPool, `${profile.id}_job`),
      education: pickFromPool(educationPool, `${profile.id}_edu`),
      relationshipGoal:
        profile.intent === "long_term"
          ? "Serious relationship"
          : profile.intent === "friendship"
            ? "Friendship first"
            : profile.intent === "casual"
              ? "Casual dating"
              : "Intentional dating",
      lifestyle: "Fitness + Weekend exploration",
      lastActiveMinutes,
      lastActiveLabel: formatLastActiveLabel(lastActiveMinutes),
      communicationStyle: "Thoughtful and consistent",
    },
    compatibilityBreakdown: {
      interestScore,
      communicationScore,
      lifestyleScore,
      intentScore,
      reasons: [
        `${profile.interests[0] || "Conversation quality"} aligns strongly`,
        `${profile.city} proximity improves meetup chances`,
        `Intent preference: ${profile.intent.replace("_", " ")}`,
      ],
    },
  };
}

function buildSwipeCandidatesForUser(viewerUserId) {
  const communityCandidates = users
    .filter((user) => user.id !== viewerUserId)
    .filter((user) => !isUserBlocked(viewerUserId, user.id))
    .filter((user) => !isPairUnmatched(viewerUserId, user.id))
    .map((user) => buildUserSwipeCandidate(user));

  return [...communityCandidates, ...swipeCandidates];
}

function resolveUserFromToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const mappedUserId = tokenUserMap.get(token);
  if (mappedUserId) {
    return users.find((user) => user.id === mappedUserId) ?? null;
  }

  const userId = parseUserIdFromToken(token);
  if (!userId) {
    return null;
  }

  const user = users.find((item) => item.id === userId) ?? null;
  if (user) {
    tokenUserMap.set(token, user.id);
  }
  return user;
}

function parseUserIdFromToken(token) {
  if (typeof token !== "string") {
    return null;
  }

  if (token.startsWith("mock|") || token.startsWith("srv|")) {
    const tokenParts = token.split("|");
    if (tokenParts.length < 3) {
      return null;
    }
    if (tokenParts[0] !== "mock" && tokenParts[0] !== "srv") {
      return null;
    }
    return decodeURIComponent(tokenParts[1]);
  }

  if (token.startsWith("mock_") || token.startsWith("srv_")) {
    const legacyParts = token.split("_");
    if (legacyParts.length < 3) {
      return null;
    }
    if (legacyParts[0] !== "mock" && legacyParts[0] !== "srv") {
      return null;
    }
    return legacyParts.slice(1, -1).join("_");
  }

  return null;
}

function requireUser(token, options = {}) {
  const user = resolveUserFromToken(token);
  if (!user) {
    throw new Error("Session expired. Please login again.");
  }
  if (!options.allowRestricted && isUserRestricted(user)) {
    throw new Error(getRestrictionMessage(user));
  }
  if (!options.skipActivityTracking) {
    trackUserActivity(user);
  }
  return user;
}

function requireAdmin(token) {
  const user = requireUser(token);
  if (normalizeUserRole(user.role, user.email) !== "admin") {
    throw new Error("Admin access required.");
  }
  return user;
}

function resolvePostState(postId) {
  return discoverState.posts.find((item) => item.id === postId) ?? null;
}

function ensureDiscoverPostState(postId, baseLikesCount = 0) {
  const existing = resolvePostState(postId);
  if (existing) {
    return existing;
  }

  const next = {
    id: postId,
    likesCount: toNonNegativeInteger(baseLikesCount),
    likedBy: [],
  };
  discoverState.posts.push(next);
  persistDiscoverState();
  return next;
}

function resolveReelState(reelId) {
  return discoverState.reels.find((item) => item.id === reelId) ?? null;
}

function ensureDiscoverReelState(reelId, defaults = {}) {
  const existing = resolveReelState(reelId);
  if (existing) {
    return existing;
  }

  const next = {
    id: reelId,
    likesCount: toNonNegativeInteger(defaults.baseLikesCount),
    likedBy: [],
    viewsCount: toNonNegativeInteger(defaults.baseViewsCount),
    comments: [],
    shares: [],
  };
  discoverState.reels.push(next);
  persistDiscoverState();
  return next;
}

function formatRelativeTimeLabel(isoValue) {
  const timestamp = new Date(isoValue).getTime();
  if (!Number.isFinite(timestamp)) {
    return "just now";
  }
  const deltaMs = Date.now() - timestamp;
  if (deltaMs < 45_000) {
    return "just now";
  }
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildCommentView(comment) {
  const author = users.find((entry) => entry.id === comment.userId);
  return {
    id: comment.id,
    userId: comment.userId,
    authorName: author?.name || "Spark member",
    authorAvatar: author?.avatar || DEFAULT_AVATAR_URL,
    text: comment.text,
    createdAt: comment.createdAt,
    timeLabel: formatRelativeTimeLabel(comment.createdAt),
  };
}

function sanitizeCommentText(value) {
  return typeof value === "string" ? value.trim().slice(0, 280) : "";
}

function sanitizeShareChannel(value) {
  if (typeof value !== "string") {
    return "copy_link";
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "copy_link";
  }
  return normalized.slice(0, 24);
}

function buildPairKey(userIdOne, userIdTwo) {
  return [userIdOne, userIdTwo].sort().join("__");
}

function isUserBlocked(userId, targetUserId) {
  if (!userId || !targetUserId) {
    return false;
  }
  const blockedByUser = new Set(safetyState.blockedByUser[userId] ?? []);
  const reverseBlockedByUser = new Set(safetyState.blockedByUser[targetUserId] ?? []);
  return blockedByUser.has(targetUserId) || reverseBlockedByUser.has(userId);
}

function isPairUnmatched(userIdOne, userIdTwo) {
  if (!userIdOne || !userIdTwo) {
    return false;
  }
  return Boolean(safetyState.unmatchedPairs[buildPairKey(userIdOne, userIdTwo)]);
}

function removeDirectThreadPair(userIdOne, userIdTwo) {
  const pairKey = buildPairKey(userIdOne, userIdTwo);
  const pairMap = chatState.directPairs[pairKey];
  if (!pairMap || typeof pairMap !== "object") {
    return;
  }

  const threadOne = pairMap[userIdOne];
  const threadTwo = pairMap[userIdTwo];
  const oneState = chatState.byUser[userIdOne];
  const twoState = chatState.byUser[userIdTwo];

  if (oneState && threadOne) {
    oneState.threads = oneState.threads.filter((thread) => thread.id !== threadOne);
    delete oneState.messages[threadOne];
  }

  if (twoState && threadTwo) {
    twoState.threads = twoState.threads.filter((thread) => thread.id !== threadTwo);
    delete twoState.messages[threadTwo];
  }

  delete chatState.directPairs[pairKey];
  persistChatState();
}

function upsertThread(userChatState, thread) {
  const existingIndex = userChatState.threads.findIndex((item) => item.id === thread.id);
  if (existingIndex >= 0) {
    const copy = [...userChatState.threads];
    copy[existingIndex] = { ...copy[existingIndex], ...thread };
    userChatState.threads = copy;
    return;
  }
  userChatState.threads = [thread, ...userChatState.threads];
}

function ensureDirectMatchThread(userOne, userTwo) {
  if (isUserBlocked(userOne.id, userTwo.id) || isPairUnmatched(userOne.id, userTwo.id)) {
    return {
      threadIdForUserOne: "",
      threadIdForUserTwo: "",
    };
  }

  const oneState = ensureUserChatState(userOne.id);
  const twoState = ensureUserChatState(userTwo.id);
  const pairKey = buildPairKey(userOne.id, userTwo.id);
  const currentPair = chatState.directPairs[pairKey] ?? {};
  const threadIdOne = currentPair[userOne.id] ?? createId("thread");
  const threadIdTwo = currentPair[userTwo.id] ?? createId("thread");

  upsertThread(oneState, {
    id: threadIdOne,
    name: userTwo.name,
    status: "Matched",
    avatar: userTwo.avatar || DEFAULT_AVATAR_URL,
    kind: "direct",
    peerUserId: userTwo.id,
    peerThreadId: threadIdTwo,
  });

  upsertThread(twoState, {
    id: threadIdTwo,
    name: userOne.name,
    status: "Matched",
    avatar: userOne.avatar || DEFAULT_AVATAR_URL,
    kind: "direct",
    peerUserId: userOne.id,
    peerThreadId: threadIdOne,
  });

  if (!Array.isArray(oneState.messages[threadIdOne])) {
    oneState.messages[threadIdOne] = [];
  }
  if (!Array.isArray(twoState.messages[threadIdTwo])) {
    twoState.messages[threadIdTwo] = [];
  }

  if (oneState.messages[threadIdOne].length === 0 && twoState.messages[threadIdTwo].length === 0) {
    const sentAt = getCurrentTimeLabel();
    oneState.messages[threadIdOne] = [
      {
        id: createId("msg"),
        from: "them",
        text: `You matched with ${userTwo.name}. Say hello.`,
        sentAt,
      },
    ];
    twoState.messages[threadIdTwo] = [
      {
        id: createId("msg"),
        from: "them",
        text: `You matched with ${userOne.name}. Say hello.`,
        sentAt,
      },
    ];
  }

  chatState.directPairs[pairKey] = {
    [userOne.id]: threadIdOne,
    [userTwo.id]: threadIdTwo,
  };

  persistChatState();

  return {
    threadIdForUserOne: threadIdOne,
    threadIdForUserTwo: threadIdTwo,
  };
}

function expireStaleRingingCalls() {
  const threshold = Date.now() - 45_000;
  let changed = false;
  callState.sessions = (callState.sessions ?? []).map((session) => {
    if (session.status !== "ringing") {
      return session;
    }
    const createdAtMs = new Date(session.createdAt).getTime();
    if (!Number.isFinite(createdAtMs) || createdAtMs > threshold) {
      return session;
    }
    changed = true;
    return {
      ...session,
      status: "missed",
      endedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      endedByUserId: "",
      declineReason: "no_response",
    };
  });
  if (changed) {
    persistCallState();
  }
}

function formatCallDurationLabel(session) {
  const startTimestamp = new Date(session.answeredAt || session.createdAt).getTime();
  if (!Number.isFinite(startTimestamp)) {
    return "0m";
  }
  const endTimestamp =
    session.status === "accepted" && !session.endedAt
      ? Date.now()
      : new Date(session.endedAt || session.updatedAt || new Date().toISOString()).getTime();
  const durationSeconds = Math.max(0, Math.floor((endTimestamp - startTimestamp) / 1000));
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function buildCallSessionView(session, viewerUserId) {
  const isCaller = session.callerUserId === viewerUserId;
  const peerUserId = isCaller ? session.calleeUserId : session.callerUserId;
  const peerUser = users.find((entry) => entry.id === peerUserId);
  const direction = isCaller ? "outgoing" : "incoming";

  return {
    id: session.id,
    type: session.type,
    status: session.status,
    direction,
    peerUserId,
    peerName: peerUser?.name || "Spark member",
    peerAvatar: peerUser?.avatar || DEFAULT_AVATAR_URL,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    answeredAt: session.answeredAt || "",
    endedAt: session.endedAt || "",
    durationLabel: formatCallDurationLabel(session),
    canAccept: !isCaller && session.status === "ringing",
    canEnd: session.status === "ringing" || session.status === "accepted",
  };
}

function getCallContactsForUser(userId) {
  const userChatState = ensureUserChatState(userId);
  return userChatState.threads
    .filter((thread) => thread.kind === "direct" && thread.peerUserId)
    .map((thread) => {
      const peer = users.find((entry) => entry.id === thread.peerUserId);
      return {
        peerUserId: thread.peerUserId,
        name: peer?.name || thread.name || "Spark member",
        avatar: peer?.avatar || thread.avatar || DEFAULT_AVATAR_URL,
        status: peer ? "Matched contact" : "Contact",
      };
    });
}

function formatCompactNumber(value) {
  const count = toNonNegativeInteger(value);

  if (count >= 1000000) {
    const millions = count / 1000000;
    return `${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, "")}m`;
  }

  if (count >= 1000) {
    const thousands = count / 1000;
    return `${thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1).replace(/\.0$/, "")}k`;
  }

  return `${count}`;
}

function normalizeUserRole(role, email) {
  if (role === "admin") {
    return "admin";
  }
  return inferUserRole(email);
}

function normalizeAccountStatus(status) {
  if (status === "banned") {
    return "banned";
  }
  if (status === "suspended") {
    return "suspended";
  }
  return "active";
}

function hasFutureDate(value) {
  if (typeof value !== "string") {
    return false;
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function isUserRestricted(user) {
  const status = normalizeAccountStatus(user?.accountStatus);
  if (status === "banned") {
    return true;
  }
  if (status === "suspended" && hasFutureDate(user?.suspendedUntil)) {
    return true;
  }
  return false;
}

function getRestrictionMessage(user) {
  const status = normalizeAccountStatus(user?.accountStatus);
  if (status === "banned") {
    return "Your account is banned. Contact support for review.";
  }
  if (status === "suspended" && hasFutureDate(user?.suspendedUntil)) {
    return "Your account is suspended temporarily.";
  }
  return "";
}

function trackUserActivity(user, options = {}) {
  if (!user?.id) {
    return;
  }

  if (options.skipPersist) {
    user.lastActiveAt = new Date().toISOString();
    return;
  }

  const index = users.findIndex((item) => item.id === user.id);
  if (index < 0) {
    return;
  }
  const nextUser = {
    ...users[index],
    lastActiveAt: new Date().toISOString(),
  };
  users = [...users];
  users[index] = nextUser;
  persistUsers();
}

function resolveCrypto() {
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  return null;
}

function randomSalt(length = 16) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
}

async function hashPasswordWithSalt(password, salt) {
  const cryptoApi = resolveCrypto();
  if (!cryptoApi) {
    return `${salt}:${password}`;
  }

  const encoder = new TextEncoder();
  const buffer = encoder.encode(`${salt}:${password}`);
  const digest = await cryptoApi.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createPasswordHash(rawPassword) {
  const passwordSalt = randomSalt(20);
  const passwordHash = await hashPasswordWithSalt(rawPassword, passwordSalt);
  return { passwordHash, passwordSalt };
}

async function verifyPassword(user, rawPassword) {
  if (!user || typeof rawPassword !== "string") {
    return false;
  }

  if (typeof user.passwordHash === "string" && typeof user.passwordSalt === "string") {
    const computed = await hashPasswordWithSalt(rawPassword, user.passwordSalt);
    return computed === user.passwordHash;
  }

  if (typeof user.password === "string" && user.password === rawPassword) {
    const nextHash = await createPasswordHash(rawPassword);
    user.passwordHash = nextHash.passwordHash;
    user.passwordSalt = nextHash.passwordSalt;
    delete user.password;
    persistUsers();
    return true;
  }

  return false;
}

async function simulateNetworkDelay(ms = 420) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getCurrentTimeLabel() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${minutes} ${suffix}`;
}

function safeStorageGet(key) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage access errors and continue with in-memory data.
  }
}

export async function register(payload) {
  hydrateFromStorage();
  await simulateNetworkDelay();

  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password?.trim();
  const name = payload?.name?.trim();

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  if (users.some((item) => item.email.toLowerCase() === email)) {
    throw new Error("Email already exists. Please login.");
  }

  const nextCredentials = await createPasswordHash(password);

  const user = {
    id: createId("user"),
    name,
    email,
    passwordHash: nextCredentials.passwordHash,
    passwordSalt: nextCredentials.passwordSalt,
    interests: splitInterests(payload?.interests),
    avatar: typeof payload?.avatar === "string" && payload.avatar.trim() ? payload.avatar.trim() : DEFAULT_AVATAR_URL,
    age: toNonNegativeInteger(payload?.age) || 0,
    city: typeof payload?.city === "string" ? payload.city.trim() : "",
    bio: typeof payload?.bio === "string" ? payload.bio.trim() : "",
    intent: normalizeIntent(payload?.intent, email || name),
    verification: {
      phone: false,
      selfie: false,
      id: false,
    },
    subscriptionPlan: "starter",
    subscriptionStatus: "free",
    subscriptionRenewsAt: null,
    role: inferUserRole(email),
    accountStatus: "active",
    suspendedUntil: null,
    suspensionReason: "",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  users = [...users, user];
  persistUsers();

  ensureUserSwipeState(user.id);
  ensureUserChatState(user.id);
  ensureUserNotificationState(user.id);
  ensureUserNotificationPreferences(user.id);
  ensureUserBillingState(user.id);

  const token = createToken(user.id);
  tokenUserMap.set(token, user.id);

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function login(payload) {
  hydrateFromStorage();
  await simulateNetworkDelay();

  const email = payload?.email?.trim()?.toLowerCase();
  const password = payload?.password?.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const user = users.find((item) => item.email.toLowerCase() === email);
  const isPasswordValid = await verifyPassword(user, password);
  if (!user || !isPasswordValid) {
    throw new Error("Invalid email or password.");
  }
  if (isUserRestricted(user)) {
    throw new Error(getRestrictionMessage(user));
  }

  ensureUserSwipeState(user.id);
  ensureUserChatState(user.id);
  ensureUserNotificationState(user.id);
  ensureUserNotificationPreferences(user.id);
  ensureUserBillingState(user.id);
  trackUserActivity(user);

  const token = createToken(user.id);
  tokenUserMap.set(token, user.id);

  return {
    token,
    user: toPublicUser(user),
  };
}

export async function getCurrentUser(token) {
  hydrateFromStorage();
  await simulateNetworkDelay(240);
  const user = requireUser(token, { allowRestricted: true });
  return {
    user: toPublicUser(user),
  };
}

export async function getDiscoverFeed(token) {
  hydrateFromStorage();
  await simulateNetworkDelay(360);

  const user = resolveUserFromToken(token);
  const viewerId = user?.id ?? null;
  const follows = viewerId ? new Set(discoverState.followsByUser[viewerId] ?? []) : new Set();
  const postCatalog = buildDiscoverPostsForUser(viewerId);
  const reelCatalog = buildDiscoverReelsForUser(viewerId);
  const viewerProfile = user ? normalizeUserProfile(user) : null;

  const posts = postCatalog.map((post) => {
    const postState = ensureDiscoverPostState(post.id, post.baseLikesCount);
    const likesCount = toNonNegativeInteger(postState.likesCount);
    const likedByViewer = viewerId ? (postState?.likedBy ?? []).includes(viewerId) : false;
    const comments = Array.isArray(postState.comments) ? postState.comments.slice(-60) : [];
    const shares = Array.isArray(postState.shares) ? postState.shares : [];
    const baseCommentsCount = toNonNegativeInteger(post.comments);
    const commentsCount = baseCommentsCount + comments.length;

    return {
      id: post.id,
      authorId: post.authorId,
      sourceUserId: post.sourceUserId ?? "",
      author: post.author,
      handle: post.handle,
      time: post.time,
      caption: post.caption,
      image: post.image,
      likesCount,
      likesLabel: formatCompactNumber(likesCount),
      likes: formatCompactNumber(likesCount),
      likedByViewer,
      comments: commentsCount,
      commentsCount,
      commentsLabel: formatCompactNumber(commentsCount),
      recentComments: comments.slice(-2).map((entry) => buildCommentView(entry)),
      sharesCount: shares.length,
      sharesLabel: formatCompactNumber(shares.length),
      followingAuthor: viewerId ? follows.has(post.authorId) : false,
      profile: post.profile ? { ...post.profile } : null,
    };
  });

  const reels = reelCatalog.map((reel) => {
    const reelState = ensureDiscoverReelState(reel.id, reel);
    const comments = Array.isArray(reelState.comments) ? reelState.comments.slice(-80) : [];
    const shares = Array.isArray(reelState.shares) ? reelState.shares : [];
    const likesCount = toNonNegativeInteger(reelState.likesCount);
    const viewsCount = toNonNegativeInteger(reelState.viewsCount);

    return {
      id: reel.id,
      authorId: reel.authorId,
      sourceUserId: reel.sourceUserId ?? "",
      author: reel.author,
      handle: reel.handle,
      city: reel.city,
      caption: reel.caption,
      thumbnail: reel.thumbnail,
      durationLabel: reel.durationLabel || "00:20",
      likesCount,
      likesLabel: formatCompactNumber(likesCount),
      viewsCount,
      viewsLabel: formatCompactNumber(viewsCount),
      commentsCount: comments.length,
      commentsLabel: formatCompactNumber(comments.length),
      sharesCount: shares.length,
      sharesLabel: formatCompactNumber(shares.length),
      recentComments: comments.slice(-2).map((entry) => buildCommentView(entry)),
    };
  });

  const candidatePool = buildSwipeCandidatesForUser(viewerId).slice(0, 80);
  const recommendations = candidatePool
    .map((candidate) => {
      const scoreMeta = calculateRecommendationScore(viewerProfile, candidate);
      return {
        ...buildSearchResultItem(candidate),
        recommendationScore: scoreMeta.score,
        reasons: [
          scoreMeta.sharedInterests.length
            ? `${scoreMeta.sharedInterests.slice(0, 2).join(", ")} interests align`
            : "Complementary personality signals",
          `${candidate.distanceKm || 0} km proximity`,
          `${candidate.intent.replace("_", " ")} intent preference`,
        ],
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 6);

  const communityStories = users
    .filter((entry) => entry.id !== viewerId)
    .filter((entry) => !isUserBlocked(viewerId, entry.id))
    .slice(0, 8)
    .map((entry) => {
      const profile = normalizeUserProfile(entry);
      return {
        id: `story_user_${entry.id}`,
        name: profile.name,
        city: profile.city,
        image: profile.avatar,
      };
    });

  return {
    ...discoverFeedBase,
    stories: [...communityStories, ...(discoverFeedBase.stories ?? [])].slice(0, 14),
    posts,
    reels,
    recommendations,
    viewerName: user?.name ?? "Guest",
  };
}

export async function toggleFollowAuthor(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(220);

  const authorId = payload?.authorId;
  const visiblePosts = buildDiscoverPostsForUser(user.id);
  const visibleAuthorIds = new Set(visiblePosts.map((post) => post.authorId));
  if (!authorId || !visibleAuthorIds.has(authorId)) {
    throw new Error("Author not found.");
  }

  const current = new Set(discoverState.followsByUser[user.id] ?? []);
  const nextFollowing = !current.has(authorId);

  if (nextFollowing) {
    current.add(authorId);
  } else {
    current.delete(authorId);
  }

  discoverState.followsByUser[user.id] = Array.from(current);
  persistDiscoverState();

  const sourcePost = visiblePosts.find((post) => post.authorId === authorId);
  const sourceUserId = sourcePost?.sourceUserId ?? "";

  if (nextFollowing) {
    pushNotification(user.id, {
      type: "social",
      title: "Followed profile",
      message: `You followed ${sourcePost?.author || "a profile"}.`,
      actionLabel: "Open Discover",
      actionTab: "discover",
    });
    if (sourceUserId && sourceUserId !== user.id) {
      pushNotification(sourceUserId, {
        type: "social",
        title: "New follower",
        message: `${user.name} followed your profile.`,
        actionLabel: "Open Discover",
        actionTab: "discover",
      });
    }
  }

  return {
    authorId,
    following: nextFollowing,
  };
}

export async function togglePostLike(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(220);

  const postId = payload?.postId;
  const targetPost = buildDiscoverPostsForUser(user.id).find((post) => post.id === postId);
  if (!targetPost) {
    throw new Error("Post not found.");
  }
  const postState = ensureDiscoverPostState(postId, targetPost.baseLikesCount);

  const likedBy = new Set(postState.likedBy ?? []);
  let liked = false;

  if (likedBy.has(user.id)) {
    likedBy.delete(user.id);
    postState.likesCount = Math.max(0, toNonNegativeInteger(postState.likesCount) - 1);
  } else {
    likedBy.add(user.id);
    postState.likesCount = toNonNegativeInteger(postState.likesCount) + 1;
    liked = true;
  }

  postState.likedBy = Array.from(likedBy);
  persistDiscoverState();

  if (liked) {
    pushNotification(user.id, {
      type: "social",
      title: "Post liked",
      message: `You liked ${targetPost.author}'s update.`,
      actionLabel: "Open Discover",
      actionTab: "discover",
    });
    if (targetPost.sourceUserId && targetPost.sourceUserId !== user.id) {
      pushNotification(targetPost.sourceUserId, {
        type: "social",
        title: "New like",
        message: `${user.name} liked your post.`,
        actionLabel: "Open Discover",
        actionTab: "discover",
      });
    }
  }

  return {
    postId,
    liked,
    likesCount: postState.likesCount,
    likesLabel: formatCompactNumber(postState.likesCount),
  };
}

export async function searchDiscoverProfiles(token, payload = {}) {
  hydrateFromStorage();
  await simulateNetworkDelay(220);

  const viewer = resolveUserFromToken(token);
  const viewerId = viewer?.id ?? null;
  const filters = normalizeSearchFilters(payload);

  const candidates = buildSwipeCandidatesForUser(viewerId).map((candidate) => buildSearchResultItem(candidate));
  const filtered = candidates.filter((candidate) => {
    if (filters.query) {
      const targetText = `${candidate.name} ${candidate.city} ${candidate.bio} ${(candidate.interests ?? []).join(" ")}`.toLowerCase();
      if (!targetText.includes(filters.query)) {
        return false;
      }
    }
    if (filters.city && candidate.city.toLowerCase() !== filters.city) {
      return false;
    }
    if (filters.intent && candidate.intent !== filters.intent) {
      return false;
    }
    if (filters.interest) {
      const hasInterest = (candidate.interests ?? []).some((entry) => String(entry).toLowerCase().includes(filters.interest));
      if (!hasInterest) {
        return false;
      }
    }
    if (candidate.age < filters.minAge || candidate.age > filters.maxAge) {
      return false;
    }
    return true;
  });

  const cityOptions = Array.from(new Set(candidates.map((item) => item.city).filter(Boolean))).slice(0, 10);
  const intentOptions = Array.from(new Set(candidates.map((item) => item.intent).filter(Boolean))).slice(0, 6);
  const interestOptions = Array.from(
    new Set(
      candidates
        .flatMap((item) => item.interests ?? [])
        .filter(Boolean)
        .map((item) => String(item)),
    ),
  ).slice(0, 14);

  return {
    filters,
    total: filtered.length,
    results: filtered.slice(0, 50),
    suggestions: {
      cities: cityOptions,
      intents: intentOptions,
      interests: interestOptions,
    },
  };
}

export async function getSmartRecommendations(token) {
  hydrateFromStorage();
  await simulateNetworkDelay(220);

  const viewer = resolveUserFromToken(token);
  const viewerId = viewer?.id ?? null;
  const viewerProfile = viewer ? normalizeUserProfile(viewer) : null;

  const recommendations = buildSwipeCandidatesForUser(viewerId)
    .map((candidate) => {
      const scoreMeta = calculateRecommendationScore(viewerProfile, candidate);
      return {
        ...buildSearchResultItem(candidate),
        recommendationScore: scoreMeta.score,
        reasons: [
          scoreMeta.sharedInterests.length
            ? `${scoreMeta.sharedInterests.slice(0, 3).join(", ")} interests in common`
            : "Strong complementary vibe signal",
          `${candidate.distanceKm || 0} km away`,
          candidate.intent ? `${candidate.intent.replace("_", " ")} intent` : "Flexible intent",
        ],
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 12);

  return {
    generatedAt: new Date().toISOString(),
    recommendations,
  };
}

export async function addPostComment(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(180);

  const postId = typeof payload?.postId === "string" ? payload.postId : "";
  const text = sanitizeCommentText(payload?.text);
  if (!postId || !text) {
    throw new Error("postId and comment text are required.");
  }

  const targetPost = buildDiscoverPostsForUser(user.id).find((post) => post.id === postId);
  if (!targetPost) {
    throw new Error("Post not found.");
  }

  const postState = ensureDiscoverPostState(postId, targetPost.baseLikesCount);
  const commentEntry = {
    id: createId("comment"),
    userId: user.id,
    text,
    createdAt: new Date().toISOString(),
  };

  postState.comments = [...(Array.isArray(postState.comments) ? postState.comments : []), commentEntry].slice(-300);
  persistDiscoverState();

  const totalCommentsCount = toNonNegativeInteger(targetPost.comments) + postState.comments.length;

  if (targetPost.sourceUserId && targetPost.sourceUserId !== user.id) {
    pushNotification(targetPost.sourceUserId, {
      type: "social",
      title: "New comment",
      message: `${user.name} commented on your post.`,
      actionLabel: "Open Discover",
      actionTab: "discover",
    });
  }

  return {
    postId,
    comment: buildCommentView(commentEntry),
    commentsCount: totalCommentsCount,
    commentsLabel: formatCompactNumber(totalCommentsCount),
    recentComments: postState.comments.slice(-2).map((entry) => buildCommentView(entry)),
  };
}

export async function sharePost(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(140);

  const postId = typeof payload?.postId === "string" ? payload.postId : "";
  if (!postId) {
    throw new Error("postId is required.");
  }

  const targetPost = buildDiscoverPostsForUser(user.id).find((post) => post.id === postId);
  if (!targetPost) {
    throw new Error("Post not found.");
  }

  const postState = ensureDiscoverPostState(postId, targetPost.baseLikesCount);
  const channel = sanitizeShareChannel(payload?.channel);
  const shareEntry = {
    id: createId("share"),
    userId: user.id,
    channel,
    createdAt: new Date().toISOString(),
  };
  postState.shares = [...(Array.isArray(postState.shares) ? postState.shares : []), shareEntry].slice(-500);
  persistDiscoverState();

  return {
    postId,
    shareCount: postState.shares.length,
    shareLabel: formatCompactNumber(postState.shares.length),
    channel,
  };
}

export async function getReelsFeed(token) {
  hydrateFromStorage();
  await simulateNetworkDelay(220);
  const viewer = resolveUserFromToken(token);
  const viewerId = viewer?.id ?? null;
  const reelCatalog = buildDiscoverReelsForUser(viewerId);

  return {
    reels: reelCatalog.map((reel) => {
      const state = ensureDiscoverReelState(reel.id, reel);
      const comments = Array.isArray(state.comments) ? state.comments.slice(-80) : [];
      const shares = Array.isArray(state.shares) ? state.shares : [];
      const likesCount = toNonNegativeInteger(state.likesCount);
      const viewsCount = toNonNegativeInteger(state.viewsCount);

      return {
        id: reel.id,
        authorId: reel.authorId,
        sourceUserId: reel.sourceUserId ?? "",
        author: reel.author,
        handle: reel.handle,
        city: reel.city,
        caption: reel.caption,
        thumbnail: reel.thumbnail,
        durationLabel: reel.durationLabel || "00:20",
        likesCount,
        likesLabel: formatCompactNumber(likesCount),
        viewsCount,
        viewsLabel: formatCompactNumber(viewsCount),
        commentsCount: comments.length,
        commentsLabel: formatCompactNumber(comments.length),
        sharesCount: shares.length,
        sharesLabel: formatCompactNumber(shares.length),
        recentComments: comments.slice(-2).map((entry) => buildCommentView(entry)),
      };
    }),
  };
}

export async function addReelComment(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(180);

  const reelId = typeof payload?.reelId === "string" ? payload.reelId : "";
  const text = sanitizeCommentText(payload?.text);
  if (!reelId || !text) {
    throw new Error("reelId and comment text are required.");
  }

  const reel = buildDiscoverReelsForUser(user.id).find((entry) => entry.id === reelId);
  if (!reel) {
    throw new Error("Reel not found.");
  }

  const reelState = ensureDiscoverReelState(reelId, reel);
  const commentEntry = {
    id: createId("comment"),
    userId: user.id,
    text,
    createdAt: new Date().toISOString(),
  };
  reelState.comments = [...(Array.isArray(reelState.comments) ? reelState.comments : []), commentEntry].slice(-300);
  persistDiscoverState();

  if (reel.sourceUserId && reel.sourceUserId !== user.id) {
    pushNotification(reel.sourceUserId, {
      type: "social",
      title: "New reel comment",
      message: `${user.name} commented on your reel.`,
      actionLabel: "Open Discover",
      actionTab: "discover",
    });
  }

  return {
    reelId,
    comment: buildCommentView(commentEntry),
    commentsCount: reelState.comments.length,
    commentsLabel: formatCompactNumber(reelState.comments.length),
    recentComments: reelState.comments.slice(-2).map((entry) => buildCommentView(entry)),
  };
}

export async function shareReel(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(140);

  const reelId = typeof payload?.reelId === "string" ? payload.reelId : "";
  if (!reelId) {
    throw new Error("reelId is required.");
  }

  const reel = buildDiscoverReelsForUser(user.id).find((entry) => entry.id === reelId);
  if (!reel) {
    throw new Error("Reel not found.");
  }

  const reelState = ensureDiscoverReelState(reelId, reel);
  const channel = sanitizeShareChannel(payload?.channel);
  const shareEntry = {
    id: createId("share"),
    userId: user.id,
    channel,
    createdAt: new Date().toISOString(),
  };
  reelState.shares = [...(Array.isArray(reelState.shares) ? reelState.shares : []), shareEntry].slice(-500);
  persistDiscoverState();

  return {
    reelId,
    shareCount: reelState.shares.length,
    shareLabel: formatCompactNumber(reelState.shares.length),
    channel,
  };
}

export async function getSwipeCandidates(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(360);

  const userSwipeState = ensureUserSwipeState(user.id);
  const profiles = buildSwipeCandidatesForUser(user.id);

  return {
    profiles,
    stats: { ...userSwipeState.stats },
    history: [...userSwipeState.history].reverse(),
  };
}

export async function sendSwipeAction(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(260);

  const availableProfiles = buildSwipeCandidatesForUser(user.id);
  const profile = availableProfiles.find((item) => item.id === payload?.profileId);
  if (!profile) {
    throw new Error("Profile not found.");
  }

  const action = payload?.action;
  if (!["pass", "like", "superlike"].includes(action)) {
    throw new Error("Invalid swipe action.");
  }

  const userSwipeState = ensureUserSwipeState(user.id);
  const targetUserId = profile.sourceUserId ?? "";
  if (targetUserId && targetUserId !== user.id) {
    userSwipeState.actionsByTarget[targetUserId] = action;
  }

  let isMatch = false;
  let matchedUser = null;
  if (targetUserId && targetUserId !== user.id && action !== "pass") {
    const targetUser = users.find((item) => item.id === targetUserId) ?? null;
    const targetSwipeState = ensureUserSwipeState(targetUserId);
    const reverseAction = targetSwipeState.actionsByTarget?.[user.id];
    isMatch = reverseAction === "like" || reverseAction === "superlike";

    if (isMatch && targetUser) {
      matchedUser = targetUser;
      ensureDirectMatchThread(normalizeUserProfile(user), normalizeUserProfile(targetUser));
      pushNotification(user.id, {
        type: "match",
        title: "It's a match!",
        message: `You matched with ${targetUser.name}.`,
        actionLabel: "Open Messages",
        actionTab: "chat",
      });
      pushNotification(targetUser.id, {
        type: "match",
        title: "New match unlocked",
        message: `You matched with ${user.name}.`,
        actionLabel: "Open Messages",
        actionTab: "chat",
      });
    }
  } else if (!targetUserId) {
    const matchChance = action === "superlike" ? 0.78 : action === "like" ? 0.58 : 0.04;
    isMatch = Math.random() <= matchChance;
  }

  const nextStats = {
    ...userSwipeState.stats,
  };

  if (action === "pass") {
    nextStats.passes += 1;
  }

  if (action === "like") {
    nextStats.likes += 1;
    if (isMatch) {
      nextStats.matches += 1;
    }
  }

  if (action === "superlike") {
    nextStats.superLikes += 1;
    if (isMatch) {
      nextStats.matches += 1;
    }
  }

  const historyItem = {
    id: createId("swipe"),
    profileId: profile.id,
    profileName: profile.name,
    action,
    matched: isMatch,
    createdAt: new Date().toISOString(),
  };

  userSwipeState.stats = nextStats;
  userSwipeState.history = [...userSwipeState.history, historyItem].slice(-120);
  persistSwipeState();

  return {
    success: true,
    action,
    matched: isMatch,
    profileId: profile.id,
    matchUser: isMatch
      ? {
          id: matchedUser?.id ?? "",
          name: matchedUser?.name ?? profile.name,
        }
      : null,
    stats: { ...nextStats },
    historyItem,
  };
}

export async function getCallDashboard(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(170);
  expireStaleRingingCalls();

  const sessions = (callState.sessions ?? [])
    .filter((session) => session.callerUserId === user.id || session.calleeUserId === user.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const activeSession = sessions.find((session) => session.status === "ringing" || session.status === "accepted") || null;

  return {
    activeSession: activeSession ? buildCallSessionView(activeSession, user.id) : null,
    recentSessions: sessions.slice(0, 30).map((session) => buildCallSessionView(session, user.id)),
    contacts: getCallContactsForUser(user.id),
  };
}

export async function startCallSession(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(160);
  expireStaleRingingCalls();

  const peerUserId = typeof payload?.peerUserId === "string" ? payload.peerUserId : "";
  const callType = payload?.type === "video" ? "video" : "voice";
  if (!peerUserId) {
    throw new Error("peerUserId is required.");
  }
  if (peerUserId === user.id) {
    throw new Error("Cannot call your own account.");
  }

  const peerUser = users.find((entry) => entry.id === peerUserId);
  if (!peerUser) {
    throw new Error("Peer user not found.");
  }
  if (isUserBlocked(user.id, peerUserId) || isPairUnmatched(user.id, peerUserId)) {
    throw new Error("Call unavailable for this user.");
  }

  ensureDirectMatchThread(normalizeUserProfile(user), normalizeUserProfile(peerUser));
  const pairKey = buildPairKey(user.id, peerUserId);
  const existingSession = (callState.sessions ?? []).find((session) => {
    const isSamePair = buildPairKey(session.callerUserId, session.calleeUserId) === pairKey;
    return isSamePair && (session.status === "ringing" || session.status === "accepted");
  });

  if (existingSession) {
    return {
      session: buildCallSessionView(existingSession, user.id),
      reused: true,
    };
  }

  const nowIso = new Date().toISOString();
  const session = {
    id: createId("call"),
    callerUserId: user.id,
    calleeUserId: peerUserId,
    type: callType,
    status: "ringing",
    createdAt: nowIso,
    updatedAt: nowIso,
    answeredAt: "",
    endedAt: "",
    endedByUserId: "",
    declineReason: "",
  };

  callState.sessions = [session, ...(Array.isArray(callState.sessions) ? callState.sessions : [])].slice(0, 400);
  persistCallState();

  pushNotification(peerUserId, {
    type: "message",
    title: callType === "video" ? "Incoming video call" : "Incoming voice call",
    message: `${user.name} is calling you now.`,
    actionLabel: "Open Calls",
    actionTab: "calls",
  });

  return {
    session: buildCallSessionView(session, user.id),
    reused: false,
  };
}

export async function respondCallSession(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(140);
  expireStaleRingingCalls();

  const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : "";
  const action = typeof payload?.action === "string" ? payload.action.trim().toLowerCase() : "";
  if (!sessionId || !action) {
    throw new Error("sessionId and action are required.");
  }
  if (!["accept", "decline", "end", "cancel"].includes(action)) {
    throw new Error("Invalid call action.");
  }

  const index = (callState.sessions ?? []).findIndex((session) => session.id === sessionId);
  if (index < 0) {
    throw new Error("Call session not found.");
  }
  const session = callState.sessions[index];
  if (session.callerUserId !== user.id && session.calleeUserId !== user.id) {
    throw new Error("Call session not found.");
  }

  const nowIso = new Date().toISOString();
  let nextSession = { ...session };

  if (action === "accept") {
    if (session.calleeUserId !== user.id || session.status !== "ringing") {
      throw new Error("Call cannot be accepted now.");
    }
    nextSession = {
      ...session,
      status: "accepted",
      answeredAt: nowIso,
      updatedAt: nowIso,
    };
  }

  if (action === "decline") {
    if (session.status !== "ringing") {
      throw new Error("Call cannot be declined now.");
    }
    nextSession = {
      ...session,
      status: "declined",
      updatedAt: nowIso,
      endedAt: nowIso,
      endedByUserId: user.id,
      declineReason: "declined",
    };
  }

  if (action === "cancel") {
    if (session.status !== "ringing" || session.callerUserId !== user.id) {
      throw new Error("Call cannot be cancelled now.");
    }
    nextSession = {
      ...session,
      status: "cancelled",
      updatedAt: nowIso,
      endedAt: nowIso,
      endedByUserId: user.id,
      declineReason: "cancelled",
    };
  }

  if (action === "end") {
    if (session.status !== "accepted" && session.status !== "ringing") {
      throw new Error("Call is already closed.");
    }
    nextSession = {
      ...session,
      status: "ended",
      updatedAt: nowIso,
      endedAt: nowIso,
      endedByUserId: user.id,
      declineReason: session.status === "ringing" ? "missed" : session.declineReason,
    };
  }

  callState.sessions[index] = nextSession;
  persistCallState();

  const peerUserId = user.id === nextSession.callerUserId ? nextSession.calleeUserId : nextSession.callerUserId;
  if (peerUserId) {
    const peerLabel = user.name || "A match";
    if (action === "accept") {
      pushNotification(peerUserId, {
        type: "message",
        title: "Call accepted",
        message: `${peerLabel} accepted your call.`,
        actionLabel: "Open Calls",
        actionTab: "calls",
      });
    }
    if (action === "decline" || action === "cancel" || action === "end") {
      pushNotification(peerUserId, {
        type: "message",
        title: "Call ended",
        message: `${peerLabel} ended the call.`,
        actionLabel: "Open Calls",
        actionTab: "calls",
      });
    }
  }

  return {
    session: buildCallSessionView(nextSession, user.id),
  };
}

export async function getChatThreads(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(340);

  const userChatState = ensureUserChatState(user.id);
  const visibleThreads = userChatState.threads.filter((thread) => {
    if (thread.kind !== "direct" || !thread.peerUserId) {
      return true;
    }
    return !isUserBlocked(user.id, thread.peerUserId) && !isPairUnmatched(user.id, thread.peerUserId);
  });

  return visibleThreads.map((thread) => {
    const messages = userChatState.messages[thread.id] ?? [];
    const latestMessage = messages[messages.length - 1];
    const unread = messages.filter((message) => message.from === "them" && message.deliveryStatus !== "read").length;

    return {
      ...thread,
      preview: latestMessage?.text ?? "Start chatting",
      time: latestMessage?.sentAt ?? "Now",
      unread,
    };
  });
}

export async function getChatMessages(token, threadId) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(280);

  const userChatState = ensureUserChatState(user.id);
  const thread = userChatState.threads.find((item) => item.id === threadId);
  if (!thread || !userChatState.messages[threadId]) {
    throw new Error("Thread not found.");
  }

  if (thread.kind === "direct" && thread.peerUserId) {
    if (isUserBlocked(user.id, thread.peerUserId) || isPairUnmatched(user.id, thread.peerUserId)) {
      throw new Error("Conversation unavailable.");
    }
  }

  return {
    threadId,
    messages: userChatState.messages[threadId].map((message) => normalizeMessage(message)).filter(Boolean),
  };
}

export async function sendMessage(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(190);

  const userChatState = ensureUserChatState(user.id);
  const threadId = payload?.threadId;
  const text = payload?.text?.trim();
  const thread = userChatState.threads.find((item) => item.id === threadId);
  const replyToId = typeof payload?.replyToId === "string" ? payload.replyToId : "";

  if (!threadId || !thread || !userChatState.messages[threadId]) {
    throw new Error("Thread not found.");
  }

  if (!text) {
    throw new Error("Message cannot be empty.");
  }

  if (thread.kind === "direct" && thread.peerUserId) {
    if (isUserBlocked(user.id, thread.peerUserId) || isPairUnmatched(user.id, thread.peerUserId)) {
      throw new Error("Conversation unavailable.");
    }
  }

  const repliedMessage = replyToId
    ? (userChatState.messages[threadId] ?? []).find((message) => message.id === replyToId) ?? null
    : null;

  const messageId = createId("msg");

  const message = {
    id: messageId,
    from: "me",
    text,
    sentAt: getCurrentTimeLabel(),
    deliveryStatus: "sent",
    reactions: {},
    replyTo: repliedMessage ? { id: repliedMessage.id, text: repliedMessage.text.slice(0, 120) } : null,
  };

  userChatState.messages[threadId] = [...userChatState.messages[threadId], message];

  if (thread.kind === "direct" && thread.peerUserId && thread.peerThreadId) {
    const peerUserState = ensureUserChatState(thread.peerUserId);
    const peerThread = peerUserState.threads.find((item) => item.id === thread.peerThreadId);

    if (peerThread) {
      if (!Array.isArray(peerUserState.messages[thread.peerThreadId])) {
        peerUserState.messages[thread.peerThreadId] = [];
      }
      peerUserState.messages[thread.peerThreadId] = [
        ...peerUserState.messages[thread.peerThreadId],
        {
          id: messageId,
          from: "them",
          text,
          sentAt: message.sentAt,
          deliveryStatus: "delivered",
          reactions: {},
          replyTo: message.replyTo,
        },
      ];
      message.deliveryStatus = "delivered";
      pushNotification(thread.peerUserId, {
        type: "message",
        title: "New message",
        message: `${user.name}: ${text.slice(0, 64)}`,
        actionLabel: "Open Messages",
        actionTab: "chat",
      });
    }
  }

  persistChatState();

  return { message: normalizeMessage(message) };
}

export async function updateProfile(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(260);

  const index = users.findIndex((item) => item.id === user.id);
  if (index < 0) {
    throw new Error("User not found.");
  }

  const updated = {
    ...users[index],
    name: typeof payload?.name === "string" && payload.name.trim() ? payload.name.trim() : users[index].name,
    city: typeof payload?.city === "string" ? payload.city.trim() : users[index].city,
    bio: typeof payload?.bio === "string" ? payload.bio.trim() : users[index].bio,
    avatar:
      typeof payload?.avatar === "string" && payload.avatar.trim() ? payload.avatar.trim() : users[index].avatar,
    intent:
      typeof payload?.intent === "string"
        ? normalizeIntent(payload.intent, users[index].id || users[index].email || users[index].name)
        : users[index].intent,
    age: toNonNegativeInteger(payload?.age) || users[index].age,
    interests: payload?.interests ? splitInterests(payload.interests) : users[index].interests,
  };

  users[index] = updated;
  persistUsers();

  return { user: toPublicUser(updated) };
}

export async function completeVerification(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(220);

  const method = typeof payload?.method === "string" ? payload.method.trim().toLowerCase() : "";
  if (!["phone", "selfie", "id"].includes(method)) {
    throw new Error("Verification method not supported.");
  }

  const index = users.findIndex((item) => item.id === user.id);
  if (index < 0) {
    throw new Error("User not found.");
  }

  const verification = normalizeVerificationState(users[index].verification);
  verification[method] = true;
  users[index] = {
    ...users[index],
    verification,
  };
  persistUsers();

  return {
    method,
    user: toPublicUser(users[index]),
  };
}

export async function sendTypingSignal(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(80);

  const threadId = typeof payload?.threadId === "string" ? payload.threadId : "";
  if (!threadId) {
    throw new Error("threadId is required.");
  }
  ensureUserChatState(user.id);

  return {
    success: true,
    threadId,
    isTyping: Boolean(payload?.isTyping),
  };
}

export async function markThreadRead(token, threadId) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(120);

  const userChatState = ensureUserChatState(user.id);
  const thread = userChatState.threads.find((item) => item.id === threadId);
  if (!thread || !Array.isArray(userChatState.messages[threadId])) {
    throw new Error("Thread not found.");
  }

  const updatedMessageIds = [];
  userChatState.messages[threadId] = userChatState.messages[threadId].map((message) => {
    const normalized = normalizeMessage(message);
    if (!normalized || normalized.from !== "them" || normalized.deliveryStatus === "read") {
      return normalized || message;
    }
    updatedMessageIds.push(normalized.id);
    return {
      ...normalized,
      deliveryStatus: "read",
    };
  });

  if (updatedMessageIds.length && thread.kind === "direct" && thread.peerUserId && thread.peerThreadId) {
    const peerChatState = ensureUserChatState(thread.peerUserId);
    if (Array.isArray(peerChatState.messages[thread.peerThreadId])) {
      peerChatState.messages[thread.peerThreadId] = peerChatState.messages[thread.peerThreadId].map((message) => {
        const normalized = normalizeMessage(message);
        if (!normalized || normalized.from !== "me" || !updatedMessageIds.includes(normalized.id)) {
          return normalized || message;
        }
        return {
          ...normalized,
          deliveryStatus: "read",
        };
      });
    }
  }

  persistChatState();

  return {
    threadId,
    updatedMessageIds,
    peerUserId: thread.peerUserId || "",
    peerThreadId: thread.peerThreadId || "",
  };
}

export async function toggleMessageReaction(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(120);

  const threadId = payload?.threadId;
  const messageId = payload?.messageId;
  const emoji = typeof payload?.emoji === "string" ? payload.emoji.slice(0, 4) : "";

  if (!threadId || !messageId || !emoji) {
    throw new Error("threadId, messageId, and emoji are required.");
  }

  const userChatState = ensureUserChatState(user.id);
  const thread = userChatState.threads.find((item) => item.id === threadId);
  if (!thread || !Array.isArray(userChatState.messages[threadId])) {
    throw new Error("Thread not found.");
  }

  let updatedMessage = null;
  userChatState.messages[threadId] = userChatState.messages[threadId].map((message) => {
    const normalized = normalizeMessage(message);
    if (!normalized || normalized.id !== messageId) {
      return normalized || message;
    }
    const reactions = { ...(normalized.reactions || {}) };
    reactions[emoji] = reactions[emoji] ? 0 : 1;
    if (reactions[emoji] === 0) {
      delete reactions[emoji];
    }
    updatedMessage = {
      ...normalized,
      reactions,
    };
    return updatedMessage;
  });

  if (!updatedMessage) {
    throw new Error("Message not found.");
  }

  if (thread.kind === "direct" && thread.peerUserId && thread.peerThreadId) {
    const peerChatState = ensureUserChatState(thread.peerUserId);
    if (Array.isArray(peerChatState.messages[thread.peerThreadId])) {
      peerChatState.messages[thread.peerThreadId] = peerChatState.messages[thread.peerThreadId].map((message) => {
        const normalized = normalizeMessage(message);
        if (!normalized || normalized.id !== messageId) {
          return normalized || message;
        }
        return {
          ...normalized,
          reactions: { ...updatedMessage.reactions },
        };
      });
    }
  }

  persistChatState();

  return {
    threadId,
    message: updatedMessage,
  };
}

export async function deleteMessage(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(130);

  const threadId = payload?.threadId;
  const messageId = payload?.messageId;
  if (!threadId || !messageId) {
    throw new Error("threadId and messageId are required.");
  }

  const userChatState = ensureUserChatState(user.id);
  const thread = userChatState.threads.find((item) => item.id === threadId);
  if (!thread || !Array.isArray(userChatState.messages[threadId])) {
    throw new Error("Thread not found.");
  }

  const beforeCount = userChatState.messages[threadId].length;
  userChatState.messages[threadId] = userChatState.messages[threadId].filter((item) => item.id !== messageId);
  const removed = beforeCount !== userChatState.messages[threadId].length;

  if (!removed) {
    throw new Error("Message not found.");
  }

  if (thread.kind === "direct" && thread.peerUserId && thread.peerThreadId) {
    const peerChatState = ensureUserChatState(thread.peerUserId);
    if (Array.isArray(peerChatState.messages[thread.peerThreadId])) {
      peerChatState.messages[thread.peerThreadId] = peerChatState.messages[thread.peerThreadId].filter(
        (item) => item.id !== messageId,
      );
    }
  }

  persistChatState();

  return {
    threadId,
    messageId,
  };
}

export async function reportMessage(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(160);

  const threadId = typeof payload?.threadId === "string" ? payload.threadId : "";
  const messageId = typeof payload?.messageId === "string" ? payload.messageId : "";
  const reason = typeof payload?.reason === "string" && payload.reason.trim() ? payload.reason.trim() : "Not provided";

  if (!threadId || !messageId) {
    throw new Error("threadId and messageId are required.");
  }

  safetyState.reports.push({
    id: createId("report"),
    kind: "message",
    reporterUserId: user.id,
    targetUserId: "",
    threadId,
    messageId,
    reason,
    createdAt: new Date().toISOString(),
    status: "open",
    actionTaken: "",
    reviewedByUserId: "",
    reviewedAt: "",
    resolutionNote: "",
  });
  safetyState.reports = safetyState.reports.slice(-500);
  persistSafetyState();

  users
    .filter((item) => normalizeUserRole(item.role, item.email) === "admin")
    .forEach((adminUser) => {
      pushNotification(adminUser.id, {
        type: "safety",
        title: "New moderation report",
        message: "A message report was submitted and needs review.",
        actionLabel: "Open Moderation",
        actionTab: "moderation",
      });
    });

  return {
    success: true,
    threadId,
    messageId,
  };
}

export async function reportUser(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(160);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  const reason = typeof payload?.reason === "string" && payload.reason.trim() ? payload.reason.trim() : "Not provided";
  if (!targetUserId) {
    throw new Error("targetUserId is required.");
  }

  safetyState.reports.push({
    id: createId("report"),
    kind: "user",
    reporterUserId: user.id,
    targetUserId,
    threadId: "",
    messageId: "",
    reason,
    createdAt: new Date().toISOString(),
    status: "open",
    actionTaken: "",
    reviewedByUserId: "",
    reviewedAt: "",
    resolutionNote: "",
  });
  safetyState.reports = safetyState.reports.slice(-500);
  persistSafetyState();

  users
    .filter((item) => normalizeUserRole(item.role, item.email) === "admin")
    .forEach((adminUser) => {
      pushNotification(adminUser.id, {
        type: "safety",
        title: "New moderation report",
        message: "A user report was submitted and needs review.",
        actionLabel: "Open Moderation",
        actionTab: "moderation",
      });
    });

  return {
    success: true,
    targetUserId,
  };
}

export async function getBlockedUsers(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(170);

  const blockedIds = Array.isArray(safetyState.blockedByUser[user.id]) ? safetyState.blockedByUser[user.id] : [];
  const blockedUsers = blockedIds.map((blockedUserId) => {
    const blockedUser = users.find((item) => item.id === blockedUserId);
    if (!blockedUser) {
      return {
        id: blockedUserId,
        name: "Unknown user",
        avatar: DEFAULT_AVATAR_URL,
        city: "",
      };
    }

    const profile = normalizeUserProfile(blockedUser);
    return {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      city: profile.city,
    };
  });

  return {
    blockedUsers,
  };
}

export async function blockUser(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(190);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  if (!targetUserId || targetUserId === user.id) {
    throw new Error("Invalid target user.");
  }

  const current = new Set(safetyState.blockedByUser[user.id] ?? []);
  current.add(targetUserId);
  safetyState.blockedByUser[user.id] = Array.from(current);
  persistSafetyState();

  removeDirectThreadPair(user.id, targetUserId);
  const blockedUser = users.find((item) => item.id === targetUserId);
  pushNotification(user.id, {
    type: "safety",
    title: "User blocked",
    message: `${blockedUser?.name || "Profile"} has been blocked.`,
    actionLabel: "Open Account",
    actionTab: "auth",
  });

  return {
    success: true,
    targetUserId,
    blocked: true,
  };
}

export async function unblockUser(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(190);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  if (!targetUserId || targetUserId === user.id) {
    throw new Error("Invalid target user.");
  }

  const current = new Set(safetyState.blockedByUser[user.id] ?? []);
  current.delete(targetUserId);
  safetyState.blockedByUser[user.id] = Array.from(current);
  persistSafetyState();

  return {
    success: true,
    targetUserId,
    blocked: false,
  };
}

export async function unmatchUser(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(190);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  if (!targetUserId || targetUserId === user.id) {
    throw new Error("Invalid target user.");
  }

  const pairKey = buildPairKey(user.id, targetUserId);
  safetyState.unmatchedPairs[pairKey] = true;
  persistSafetyState();

  removeDirectThreadPair(user.id, targetUserId);
  const unmatchedUser = users.find((item) => item.id === targetUserId);
  pushNotification(user.id, {
    type: "safety",
    title: "Match removed",
    message: `You unmatched ${unmatchedUser?.name || "this profile"}.`,
    actionLabel: "Open Messages",
    actionTab: "chat",
  });

  return {
    success: true,
    targetUserId,
    unmatched: true,
  };
}

export async function getNotifications(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(180);

  const preferences = ensureUserNotificationPreferences(user.id);
  const list = ensureUserNotificationState(user.id);
  const notifications = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = notifications.filter((item) => !item.read).length;
  const queuedEmailCount = (notificationState.emailLog ?? []).filter(
    (entry) => entry.userId === user.id && entry.status === "queued",
  ).length;

  return {
    notifications,
    unreadCount,
    preferences,
    queuedEmailCount,
  };
}

export async function markNotificationRead(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(120);

  const notificationId = typeof payload?.notificationId === "string" ? payload.notificationId : "";
  if (!notificationId) {
    throw new Error("notificationId is required.");
  }

  const current = ensureUserNotificationState(user.id);
  let found = false;
  notificationState.byUser[user.id] = current.map((item) => {
    if (item.id !== notificationId) {
      return item;
    }
    found = true;
    return {
      ...item,
      read: true,
    };
  });

  if (!found) {
    throw new Error("Notification not found.");
  }

  persistNotificationState();
  const unreadCount = notificationState.byUser[user.id].filter((item) => !item.read).length;
  return {
    success: true,
    unreadCount,
  };
}

export async function markAllNotificationsRead(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(120);

  const current = ensureUserNotificationState(user.id);
  notificationState.byUser[user.id] = current.map((item) => ({
    ...item,
    read: true,
  }));
  persistNotificationState();

  return {
    success: true,
    unreadCount: 0,
  };
}

export async function getNotificationPreferences(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(120);

  return {
    preferences: ensureUserNotificationPreferences(user.id),
  };
}

export async function updateNotificationPreferences(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(160);

  const current = ensureUserNotificationPreferences(user.id);
  let nextPreferences = { ...current };

  if (payload?.preferences && typeof payload.preferences === "object") {
    nextPreferences = normalizeNotificationPreferences(payload.preferences);
  } else {
    const channel = typeof payload?.channel === "string" ? payload.channel : "";
    const type = typeof payload?.type === "string" ? payload.type : "";
    const enabled = Boolean(payload?.enabled);
    if (!NOTIFICATION_CHANNELS.includes(channel)) {
      throw new Error("Valid notification channel is required.");
    }
    if (type !== "all" && !NOTIFICATION_TYPES.includes(type)) {
      throw new Error("Valid notification type is required.");
    }

    const targetKey =
      channel === "inApp" ? "inAppByType" : channel === "browser" ? "browserByType" : "emailByType";
    const baseMap = { ...nextPreferences[targetKey] };
    const targetTypes = type === "all" ? NOTIFICATION_TYPES : [type];
    targetTypes.forEach((entryType) => {
      baseMap[entryType] = enabled;
    });
    nextPreferences = {
      ...nextPreferences,
      [targetKey]: baseMap,
    };
  }

  notificationState.preferencesByUser[user.id] = normalizeNotificationPreferences(nextPreferences);
  persistNotificationState();

  return {
    success: true,
    preferences: notificationState.preferencesByUser[user.id],
  };
}

export async function getSubscription(token) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(200);
  const snapshot = buildSubscriptionSnapshot(user);
  const userBilling = ensureUserBillingState(user.id);
  const activeCheckoutSession = userBilling.sessions.find(
    (item) => item.status === "pending" && new Date(item.expiresAt).getTime() > Date.now(),
  );

  return {
    ...snapshot,
    checkoutSession: activeCheckoutSession
      ? {
          ...activeCheckoutSession,
          amountLabel: formatCurrencyAmount(activeCheckoutSession.amount, activeCheckoutSession.currency),
          planName: getPlanById(activeCheckoutSession.planId).name,
        }
      : null,
  };
}

export async function createSubscriptionCheckout(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(220);

  const targetPlanId = normalizeSubscriptionPlan(payload?.planId);
  if (targetPlanId === "starter") {
    throw new Error("Starter plan does not require payment.");
  }

  const targetPlan = getPlanById(targetPlanId);
  const userBilling = ensureUserBillingState(user.id);
  const requestedAmount = Number(payload?.amount);
  const amount = Number.isFinite(requestedAmount) && requestedAmount > 0
    ? Math.round(requestedAmount)
    : Math.max(0, Math.round(targetPlan.monthlyPrice * 100));
  const currency =
    typeof payload?.currency === "string" && payload.currency.trim()
      ? payload.currency.trim().toUpperCase()
      : "USD";
  const provider =
    typeof payload?.provider === "string" && payload.provider.trim() ? payload.provider.trim() : "Razorpay Sandbox";

  const session = {
    id: createId("checkout"),
    planId: targetPlanId,
    amount,
    currency,
    status: "pending",
    provider,
    orderRef:
      typeof payload?.orderRef === "string" && payload.orderRef.trim()
        ? payload.orderRef.trim()
        : `ORD-${createId("ord").slice(-8).toUpperCase()}`,
    gatewayOrderId:
      typeof payload?.gatewayOrderId === "string" && payload.gatewayOrderId.trim()
        ? payload.gatewayOrderId.trim()
        : "",
    keyId: typeof payload?.keyId === "string" ? payload.keyId.trim() : "",
    description: typeof payload?.description === "string" ? payload.description.trim() : `${targetPlan.name} plan`,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
  };

  userBilling.sessions = [session, ...(userBilling.sessions ?? [])].slice(0, 100);
  persistBillingState();

  pushNotification(user.id, {
    type: "billing",
    title: "Checkout started",
    message: `${targetPlan.name} checkout is ready.`,
    actionLabel: "Open Premium",
    actionTab: "premium",
  });

  return {
    session: {
      ...session,
      amountLabel: formatCurrencyAmount(session.amount, session.currency),
      planName: targetPlan.name,
    },
  };
}

export async function confirmSubscriptionCheckout(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(260);

  const sessionId = typeof payload?.sessionId === "string" ? payload.sessionId : "";
  if (!sessionId) {
    throw new Error("sessionId is required.");
  }

  const userBilling = ensureUserBillingState(user.id);
  const sessionIndex = userBilling.sessions.findIndex((item) => item.id === sessionId);
  if (sessionIndex < 0) {
    throw new Error("Checkout session not found.");
  }

  const session = userBilling.sessions[sessionIndex];
  const gatewayPaymentId = typeof payload?.paymentId === "string" ? payload.paymentId.trim() : "";
  const gatewayOrderId = typeof payload?.orderId === "string" ? payload.orderId.trim() : "";
  if (session.status !== "pending") {
    throw new Error("Checkout session is no longer pending.");
  }
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    userBilling.sessions[sessionIndex] = {
      ...session,
      status: "expired",
    };
    persistBillingState();
    throw new Error("Checkout session expired. Please start again.");
  }

  userBilling.sessions[sessionIndex] = {
    ...session,
    status: "completed",
    gatewayOrderId: gatewayOrderId || session.gatewayOrderId || "",
  };

  const applied = applySubscriptionPlan(user.id, session.planId);
  const planMeta = getPlanById(session.planId);
  const paymentRecord = {
    id: createId("txn"),
    planId: session.planId,
    planName: planMeta.name,
    amount: session.amount,
    currency: session.currency,
    status: "paid",
    provider: session.provider,
    paymentRef: gatewayPaymentId || `PAY-${createId("pay").slice(-8).toUpperCase()}`,
    paidAt: new Date().toISOString(),
  };
  userBilling.history = [paymentRecord, ...(userBilling.history ?? [])].slice(0, 200);
  persistBillingState();

  pushNotification(user.id, {
    type: "billing",
    title: "Payment successful",
    message: `${planMeta.name} plan is now active.`,
    actionLabel: "Open Premium",
    actionTab: "premium",
  });

  return {
    success: true,
    user: toPublicUser(applied.user),
    ...buildSubscriptionSnapshot(applied.user),
    payment: paymentRecord,
    checkoutSession: null,
  };
}

export async function updateSubscription(token, payload) {
  hydrateFromStorage();
  const user = requireUser(token);
  await simulateNetworkDelay(260);

  const nextPlanId = normalizeSubscriptionPlan(payload?.planId);
  if (nextPlanId !== "starter") {
    throw new Error("Paid plans require checkout.");
  }

  const applied = applySubscriptionPlan(user.id, nextPlanId);
  pushNotification(user.id, {
    type: "billing",
    title: "Plan changed",
    message: "Your account is now on Starter plan.",
    actionLabel: "Open Premium",
    actionTab: "premium",
  });

  return {
    success: true,
    user: toPublicUser(applied.user),
    ...buildSubscriptionSnapshot(applied.user),
    checkoutSession: null,
  };
}

function appendModerationAudit(entry) {
  const nextEntry = {
    id: createId("audit"),
    actorUserId: typeof entry?.actorUserId === "string" ? entry.actorUserId : "",
    targetUserId: typeof entry?.targetUserId === "string" ? entry.targetUserId : "",
    reportId: typeof entry?.reportId === "string" ? entry.reportId : "",
    action: typeof entry?.action === "string" ? entry.action : "review",
    note: typeof entry?.note === "string" ? entry.note : "",
    createdAt: new Date().toISOString(),
  };
  safetyState.moderationAudit = [nextEntry, ...(safetyState.moderationAudit ?? [])].slice(0, 2000);
}

function buildModerationReportView(report) {
  const reporter = users.find((item) => item.id === report.reporterUserId);
  const target = users.find((item) => item.id === report.targetUserId);
  return {
    ...report,
    reporterName: reporter?.name || "Unknown",
    targetUserName: target?.name || "Unknown",
    targetUserEmail: target?.email || "",
  };
}

function buildModerationUserView(user) {
  const publicUser = toPublicUser(user);
  const profile = normalizeUserProfile(publicUser);
  const preview = buildUserProfilePreview(profile);
  return {
    id: publicUser.id,
    name: publicUser.name,
    email: publicUser.email,
    role: publicUser.role,
    accountStatus: publicUser.accountStatus,
    suspendedUntil: publicUser.suspendedUntil,
    suspensionReason: publicUser.suspensionReason,
    lastActiveAt: publicUser.lastActiveAt,
    createdAt: publicUser.createdAt,
    subscriptionPlan: publicUser.subscriptionPlan,
    subscriptionStatus: publicUser.subscriptionStatus,
    subscriptionRenewsAt: publicUser.subscriptionRenewsAt,
    subscriptionPlanMeta: publicUser.subscriptionPlanMeta,
    profileCompletionScore: publicUser.profileCompletionScore,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    avatar: profile.avatar,
    intent: profile.intent,
    interests: profile.interests,
    verification: profile.verification,
    occupation: preview.occupation,
    education: preview.education,
    relationshipGoal: preview.relationshipGoal,
    lastActiveLabel: preview.lastActiveLabel,
    handle: buildUserHandle(profile),
  };
}

function applyUserModeration(targetUserId, action, reason, suspendHours = 24) {
  const userIndex = users.findIndex((item) => item.id === targetUserId);
  if (userIndex < 0) {
    return null;
  }

  const current = users[userIndex];
  const nextUser = { ...current };
  if (action === "ban") {
    nextUser.accountStatus = "banned";
    nextUser.suspendedUntil = null;
    nextUser.suspensionReason = reason || "Policy violation";
  } else if (action === "suspend") {
    nextUser.accountStatus = "suspended";
    nextUser.suspendedUntil = new Date(Date.now() + Math.max(1, suspendHours) * 3600_000).toISOString();
    nextUser.suspensionReason = reason || "Policy violation";
  } else if (action === "activate") {
    nextUser.accountStatus = "active";
    nextUser.suspendedUntil = null;
    nextUser.suspensionReason = "";
  }

  users = [...users];
  users[userIndex] = nextUser;
  persistUsers();
  return nextUser;
}

export async function getModerationUsers(token, payload = {}) {
  hydrateFromStorage();
  requireAdmin(token);
  await simulateNetworkDelay(160);

  const statusFilter = typeof payload?.status === "string" ? payload.status : "all";
  const normalizedStatus = ["all", "active", "suspended", "banned"].includes(statusFilter) ? statusFilter : "all";
  const searchQuery = typeof payload?.query === "string" ? payload.query.trim().toLowerCase() : "";

  const mappedUsers = users.map((entry) => buildModerationUserView(entry));
  const filteredUsers = mappedUsers
    .filter((entry) => (normalizedStatus === "all" ? true : entry.accountStatus === normalizedStatus))
    .filter((entry) => {
      if (!searchQuery) {
        return true;
      }
      return (
        (entry.name || "").toLowerCase().includes(searchQuery) ||
        (entry.email || "").toLowerCase().includes(searchQuery)
      );
    })
    .sort((a, b) => new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime());

  const summary = {
    total: mappedUsers.length,
    active: mappedUsers.filter((entry) => entry.accountStatus === "active").length,
    suspended: mappedUsers.filter((entry) => entry.accountStatus === "suspended").length,
    banned: mappedUsers.filter((entry) => entry.accountStatus === "banned").length,
  };

  return {
    users: filteredUsers,
    summary,
  };
}

export async function getModerationReports(token, payload = {}) {
  hydrateFromStorage();
  requireAdmin(token);
  await simulateNetworkDelay(180);

  const statusFilter = typeof payload?.status === "string" ? payload.status : "all";
  const reports = [...(safetyState.reports ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((report) => (statusFilter === "all" ? true : report.status === statusFilter))
    .map((report) => buildModerationReportView(report));

  const summary = {
    total: reports.length,
    open: reports.filter((report) => report.status === "open").length,
    underReview: reports.filter((report) => report.status === "under_review").length,
    resolved: reports.filter((report) => report.status === "resolved").length,
    dismissed: reports.filter((report) => report.status === "dismissed").length,
  };

  return {
    reports,
    summary,
  };
}

export async function resolveModerationReport(token, payload) {
  hydrateFromStorage();
  const adminUser = requireAdmin(token);
  await simulateNetworkDelay(220);

  const reportId = typeof payload?.reportId === "string" ? payload.reportId : "";
  const action = typeof payload?.action === "string" ? payload.action : "";
  const note = typeof payload?.note === "string" ? payload.note.trim() : "";
  const suspendHours = toNonNegativeInteger(payload?.suspendHours) || 24;
  if (!reportId || !action) {
    throw new Error("reportId and action are required.");
  }
  if (!["dismiss", "review", "warn", "suspend", "ban"].includes(action)) {
    throw new Error("Invalid moderation action.");
  }

  const reportIndex = safetyState.reports.findIndex((item) => item.id === reportId);
  if (reportIndex < 0) {
    throw new Error("Report not found.");
  }
  const report = safetyState.reports[reportIndex];
  const nextReport = {
    ...report,
    status: action === "dismiss" ? "dismissed" : action === "review" ? "under_review" : "resolved",
    actionTaken: action,
    reviewedByUserId: adminUser.id,
    reviewedAt: new Date().toISOString(),
    resolutionNote: note,
  };

  const targetUserId = typeof payload?.targetUserId === "string" && payload.targetUserId
    ? payload.targetUserId
    : report.targetUserId;
  let moderatedUser = null;

  if (["warn", "suspend", "ban"].includes(action) && targetUserId) {
    if (action === "warn") {
      moderatedUser = users.find((item) => item.id === targetUserId) ?? null;
    } else {
      moderatedUser = applyUserModeration(targetUserId, action, note || report.reason, suspendHours);
    }

    if (moderatedUser) {
      pushNotification(moderatedUser.id, {
        type: "safety",
        title:
          action === "warn"
            ? "Account warning"
            : action === "suspend"
              ? "Account suspended"
              : "Account banned",
        message:
          action === "warn"
            ? "Our moderation team issued a warning on your activity."
            : action === "suspend"
              ? "Your account has been suspended temporarily."
              : "Your account has been banned by moderation team.",
        actionLabel: "Open Account",
        actionTab: "auth",
      });
    }
  }

  safetyState.reports[reportIndex] = nextReport;
  appendModerationAudit({
    actorUserId: adminUser.id,
    targetUserId: targetUserId || "",
    reportId,
    action,
    note,
  });
  persistSafetyState();

  return {
    success: true,
    report: buildModerationReportView(nextReport),
    moderatedUser: moderatedUser ? toPublicUser(moderatedUser) : null,
  };
}

export async function getModerationAudit(token) {
  hydrateFromStorage();
  requireAdmin(token);
  await simulateNetworkDelay(160);

  const audit = [...(safetyState.moderationAudit ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry) => {
      const actor = users.find((item) => item.id === entry.actorUserId);
      const target = users.find((item) => item.id === entry.targetUserId);
      return {
        ...entry,
        actorName: actor?.name || "Unknown",
        targetName: target?.name || "Unknown",
      };
    });

  return {
    audit,
  };
}

export async function updateUserModerationStatus(token, payload) {
  hydrateFromStorage();
  const adminUser = requireAdmin(token);
  await simulateNetworkDelay(180);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  const action = typeof payload?.action === "string" ? payload.action : "";
  const reason = typeof payload?.reason === "string" ? payload.reason.trim() : "";
  if (!targetUserId || !action) {
    throw new Error("targetUserId and action are required.");
  }

  if (!["activate", "suspend", "ban"].includes(action)) {
    throw new Error("Invalid user moderation action.");
  }

  const moderatedUser = applyUserModeration(targetUserId, action, reason);
  if (!moderatedUser) {
    throw new Error("Target user not found.");
  }

  appendModerationAudit({
    actorUserId: adminUser.id,
    targetUserId,
    reportId: "",
    action,
    note: reason,
  });
  persistSafetyState();

  return {
    success: true,
    user: toPublicUser(moderatedUser),
  };
}

export async function deleteModerationUser(token, payload) {
  hydrateFromStorage();
  const adminUser = requireAdmin(token);
  await simulateNetworkDelay(180);

  const targetUserId = typeof payload?.targetUserId === "string" ? payload.targetUserId : "";
  const reason = typeof payload?.reason === "string" ? payload.reason.trim() : "";
  if (!targetUserId) {
    throw new Error("targetUserId is required.");
  }

  if (adminUser.id === targetUserId) {
    throw new Error("You cannot delete your own admin account.");
  }

  const targetUser = users.find((item) => item.id === targetUserId);
  if (!targetUser) {
    throw new Error("Target user not found.");
  }

  if (targetUser.role === "admin") {
    throw new Error("Admin account cannot be deleted.");
  }

  users = users.filter((item) => item.id !== targetUserId);
  persistUsers();

  safetyState.reports = (safetyState.reports ?? []).filter(
    (report) => report.targetUserId !== targetUserId && report.reporterUserId !== targetUserId,
  );
  appendModerationAudit({
    actorUserId: adminUser.id,
    targetUserId,
    reportId: "",
    action: "delete_user",
    note: reason || "Deleted by admin",
  });
  persistSafetyState();

  return {
    success: true,
    deletedUserId: targetUserId,
  };
}

export async function getAnalyticsDashboard(token) {
  hydrateFromStorage();
  requireAdmin(token);
  await simulateNetworkDelay(200);

  const totalUsers = users.length;
  const dailyActiveUsers = users.filter((user) => {
    const timestamp = new Date(user.lastActiveAt).getTime();
    return Number.isFinite(timestamp) && timestamp >= Date.now() - 24 * 3600_000;
  }).length;
  const weeklyActiveUsers = users.filter((user) => {
    const timestamp = new Date(user.lastActiveAt).getTime();
    return Number.isFinite(timestamp) && timestamp >= Date.now() - 7 * 24 * 3600_000;
  }).length;

  const swipeRows = Object.values(swipeState.byUser ?? {});
  const totalLikes = swipeRows.reduce((sum, row) => {
    const history = Array.isArray(row?.history) ? row.history : [];
    return (
      sum +
      history.filter((item) => item?.action === "like" || item?.action === "superlike").length
    );
  }, 0);

  const totalMatches = Object.keys(chatState.directPairs ?? {}).length;
  const matchConversionRate = totalLikes > 0 ? Number(((totalMatches * 2 * 100) / totalLikes).toFixed(2)) : 0;

  const directPairRows = Object.entries(chatState.directPairs ?? {});
  let chatStarted = 0;
  let chatResponded = 0;
  directPairRows.forEach(([, mapping]) => {
    const participants = Object.entries(mapping || {});
    if (participants.length < 2) {
      return;
    }
    const activityByUser = participants.map(([userId, threadId]) => {
      const userMessages = chatState.byUser?.[userId]?.messages?.[threadId];
      const messageList = Array.isArray(userMessages) ? userMessages : [];
      return messageList.some((message) => message.from === "me");
    });
    const hasAnyActivity = activityByUser.some(Boolean);
    if (hasAnyActivity) {
      chatStarted += 1;
    }
    const hasBothActivity = activityByUser.every(Boolean);
    if (hasBothActivity) {
      chatResponded += 1;
    }
  });
  const chatResponseRate = chatStarted > 0 ? Number(((chatResponded * 100) / chatStarted).toFixed(2)) : 0;

  const paidUsers = users.filter((user) => normalizeSubscriptionPlan(user.subscriptionPlan) !== "starter").length;
  const paidConversionRate = totalUsers > 0 ? Number(((paidUsers * 100) / totalUsers).toFixed(2)) : 0;

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalUsers,
      dailyActiveUsers,
      weeklyActiveUsers,
      matchConversionRate,
      chatResponseRate,
      paidConversionRate,
      totalLikes,
      totalMatches,
      paidUsers,
      reportsOpen: (safetyState.reports ?? []).filter((item) => item.status === "open").length,
    },
    trends: {
      dau7d: Array.from({ length: 7 }).map((_, index) => ({
        day: `D-${6 - index}`,
        value: Math.max(1, Math.round(dailyActiveUsers * (0.72 + index * 0.04))),
      })),
      paidConversion7d: Array.from({ length: 7 }).map((_, index) => ({
        day: `D-${6 - index}`,
        value: Number(Math.max(0.1, paidConversionRate - 1.2 + index * 0.3).toFixed(2)),
      })),
    },
  };
}
