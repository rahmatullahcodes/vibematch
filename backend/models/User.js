import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 160,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    role: {
      type: String,
      default: "user",
    },
    accountStatus: {
      type: String,
      default: "active",
      enum: ["active", "suspended", "banned"],
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    age: {
      type: Number,
      default: null,
    },
    city: {
      type: String,
      default: "",
    },
    intent: {
      type: String,
      default: "dating",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    interests: {
      type: [String],
      default: [],
    },
    verification: {
      phone: { type: Boolean, default: false },
      selfie: { type: Boolean, default: false },
      id: { type: Boolean, default: false },
    },
    subscriptionStatus: {
      type: String,
      default: "free",
    },
    subscriptionPlan: {
      type: String,
      default: "starter",
    },
    subscriptionRenewsAt: {
      type: Date,
      default: null,
    },
    profileCompletionScore: {
      type: Number,
      default: 0,
    },
    relationshipGoal: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    handle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
