import { useEffect, useMemo, useState } from "react";

const DEFAULT_PROFILE_FORM = {
  name: "",
  email: "",
  password: "",
  interests: "",
  age: "",
  city: "",
  bio: "",
  avatar: "",
  intent: "dating",
};

const intentOptions = [
  { value: "dating", label: "Dating" },
  { value: "long_term", label: "Long-term" },
  { value: "friendship", label: "Friendship" },
  { value: "casual", label: "Casual" },
];

function evaluateAvatarUrlQuality(url) {
  if (!url || !url.trim()) {
    return [];
  }

  const warnings = [];
  if (!/^https?:\/\//i.test(url.trim())) {
    warnings.push("Image URL should start with http:// or https://");
  }
  if (/w=1\d\d|w=2\d\d/i.test(url) || /q=1\d/i.test(url)) {
    warnings.push("Detected low-resolution image URL parameters.");
  }
  if (!/\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(url) && !/images\.unsplash\.com/i.test(url)) {
    warnings.push("Use a direct image URL (jpg/png/webp) for best quality.");
  }
  return warnings;
}

function AuthView({
  user,
  loading,
  error,
  onLogin,
  onRegister,
  onLogout,
  onUpdateProfile,
  onCompleteVerification,
  blockedUsers = [],
  blockedLoading = false,
  onRefreshBlockedUsers,
  onUnblockUser,
  defaultMode = "signup",
  isAdminLogin = false,
}) {
  const [mode, setMode] = useState(defaultMode === "login" ? "login" : "signup");
  const [signupStep, setSignupStep] = useState(1);
  const [otpSentCode, setOtpSentCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_PROFILE_FORM);
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_FORM);
  const [localNotice, setLocalNotice] = useState("");
  const [unblockLoadingById, setUnblockLoadingById] = useState({});

  const currentAvatarWarnings = useMemo(
    () => evaluateAvatarUrlQuality(mode === "signup" ? formData.avatar : profileForm.avatar),
    [formData.avatar, mode, profileForm.avatar],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
      age: user.age || "",
      city: user.city || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      intent: user.intent || "dating",
    });
  }, [user]);

  useEffect(() => {
    if (!user || !onRefreshBlockedUsers) {
      return;
    }
    onRefreshBlockedUsers({ background: true });
  }, [onRefreshBlockedUsers, user?.id]);

  useEffect(() => {
    if (user) {
      return;
    }
    if (defaultMode === "login") {
      setMode("login");
      setSignupStep(1);
      setOtpSentCode("");
      setOtpInput("");
      setOtpVerified(false);
      return;
    }
    setMode("signup");
  }, [defaultMode, user]);

  const verification = user?.verification ?? { phone: false, selfie: false, id: false };
  const isFullyVerified = verification.phone && verification.selfie && verification.id;
  const profileCompletionScore = user?.profileCompletionScore ?? 0;

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const sendOtpCode = () => {
    if (!formData.email.trim() || !formData.name.trim()) {
      setLocalNotice("Enter name and email before requesting OTP.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpSentCode(code);
    setOtpInput("");
    setOtpVerified(false);
    setLocalNotice("OTP sent. Use demo code below to continue.");
  };

  const verifyOtpCode = () => {
    if (!otpSentCode) {
      setLocalNotice("Generate OTP first.");
      return;
    }
    if (otpInput.trim() !== otpSentCode) {
      setLocalNotice("Invalid OTP. Please try again.");
      return;
    }
    setOtpVerified(true);
    setLocalNotice("OTP verified. Continue to profile setup.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "signup") {
      if (signupStep === 1) {
        if (!otpVerified) {
          setLocalNotice("Please verify OTP before continuing.");
          return;
        }
        setSignupStep(2);
        setLocalNotice("");
        return;
      }

      await onRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        interests: formData.interests,
        age: Number(formData.age) || 0,
        city: formData.city,
        bio: formData.bio,
        avatar: formData.avatar,
        intent: formData.intent,
        otpVerified: true,
      });
      return;
    }

    await onLogin({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!onUpdateProfile) {
      return;
    }
    const response = await onUpdateProfile({
      name: profileForm.name,
      interests: profileForm.interests,
      age: Number(profileForm.age) || 0,
      city: profileForm.city,
      bio: profileForm.bio,
      avatar: profileForm.avatar,
      intent: profileForm.intent,
    });
    if (response?.ok) {
      setLocalNotice("Profile updated successfully.");
    }
  };

  const handleVerification = async (method) => {
    if (!onCompleteVerification) {
      return;
    }
    const response = await onCompleteVerification(method);
    if (response?.ok) {
      setLocalNotice(`${method.toUpperCase()} verification completed.`);
    }
  };

  const handleUnblockUser = async (targetUserId) => {
    if (!targetUserId || !onUnblockUser) {
      return;
    }

    setUnblockLoadingById((previous) => ({
      ...previous,
      [targetUserId]: true,
    }));

    const response = await onUnblockUser(targetUserId);
    if (response?.ok) {
      setLocalNotice("User unblocked successfully.");
      if (onRefreshBlockedUsers) {
        await onRefreshBlockedUsers({ background: true });
      }
    }

    setUnblockLoadingById((previous) => {
      const next = { ...previous };
      delete next[targetUserId];
      return next;
    });
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <article className="glass animate-rise rounded-3xl p-5 sm:p-6 md:p-7 [animation-delay:80ms]">
        {user ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex rounded-full border border-aqua/40 bg-aqua/20 px-3 py-1 text-xs font-semibold text-aqua">
                Logged in successfully
              </p>
              {isFullyVerified && (
                <p className="inline-flex rounded-full border border-coral/40 bg-coral/20 px-3 py-1 text-xs font-semibold text-coral">
                  Premium Verified
                </p>
              )}
            </div>

            <h2 className="mt-4 font-heading text-3xl leading-tight text-white sm:text-4xl">Welcome back, {user.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Your account is active. Complete profile and verification steps to unlock better match quality.
            </p>

            <div className="mt-5 rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Profile Completion</p>
                <p className="text-sm font-semibold text-white">{profileCompletionScore}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-coral to-aqua transition-all duration-500"
                  style={{ width: `${profileCompletionScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-300">
                Complete city, bio, interests, and verification to reach premium visibility.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => handleVerification("phone")}
                disabled={loading || verification.phone}
                className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                  verification.phone
                    ? "border-aqua/40 bg-aqua/20 text-aqua"
                    : "border-white/20 bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                {verification.phone ? "Phone Verified" : "Verify Phone"}
              </button>
              <button
                onClick={() => handleVerification("selfie")}
                disabled={loading || verification.selfie}
                className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                  verification.selfie
                    ? "border-aqua/40 bg-aqua/20 text-aqua"
                    : "border-white/20 bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                {verification.selfie ? "Selfie Verified" : "Verify Selfie"}
              </button>
              <button
                onClick={() => handleVerification("id")}
                disabled={loading || verification.id}
                className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                  verification.id
                    ? "border-aqua/40 bg-aqua/20 text-aqua"
                    : "border-white/20 bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                {verification.id ? "ID Verified" : "Verify ID"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Privacy & Safety</p>
                <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200">
                  {blockedUsers.length} blocked
                </p>
              </div>

              {blockedLoading ? (
                <p className="mt-3 text-sm text-slate-300">Loading blocked users...</p>
              ) : blockedUsers.length === 0 ? (
                <p className="mt-3 text-sm text-slate-300">No blocked users right now.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {blockedUsers.map((blockedUser) => (
                    <div
                      key={blockedUser.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={blockedUser.avatar}
                          alt={blockedUser.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{blockedUser.name}</p>
                          <p className="truncate text-xs text-slate-400">{blockedUser.city || "Location hidden"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblockUser(blockedUser.id)}
                        disabled={loading || Boolean(unblockLoadingById[blockedUser.id])}
                        className="shrink-0 rounded-xl border border-aqua/35 bg-aqua/15 px-3 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/25 disabled:opacity-60"
                      >
                        {unblockLoadingById[blockedUser.id] ? "Unblocking..." : "Unblock"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Profile Manager</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
                <input
                  name="city"
                  type="text"
                  value={profileForm.city}
                  onChange={handleProfileChange}
                  placeholder="City"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="age"
                  type="number"
                  min="18"
                  max="99"
                  value={profileForm.age}
                  onChange={handleProfileChange}
                  placeholder="Age"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
                <select
                  name="intent"
                  value={profileForm.intent}
                  onChange={handleProfileChange}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-coral/70 focus:outline-none"
                >
                  {intentOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                name="avatar"
                type="url"
                value={profileForm.avatar}
                onChange={handleProfileChange}
                placeholder="Profile image URL"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />

              {currentAvatarWarnings.length > 0 && (
                <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  {currentAvatarWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}

              <input
                name="interests"
                type="text"
                value={profileForm.interests}
                onChange={handleProfileChange}
                placeholder="Interests (music, gym, travel)"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />
              <textarea
                name="bio"
                rows={3}
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Short bio"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100">
              Smart onboarding
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-white sm:text-4xl">
              {isAdminLogin ? "Admin access login" : "Create your profile and start meaningful matches."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
              {isAdminLogin
                ? "Use an authorized admin account to open moderation controls and analytics."
                : "Complete OTP verification, set your intent, and improve profile quality for higher-quality conversations."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="surface-soft rounded-2xl p-4 text-center">
                <p className="font-heading text-3xl text-coral">OTP</p>
                <p className="mt-1 text-xs text-slate-300">Verified signup</p>
              </div>
              <div className="surface-soft rounded-2xl p-4 text-center">
                <p className="font-heading text-3xl text-aqua">Score</p>
                <p className="mt-1 text-xs text-slate-300">Profile quality index</p>
              </div>
              <div className="surface-soft rounded-2xl p-4 text-center">
                <p className="font-heading text-3xl text-amber-300">Trust</p>
                <p className="mt-1 text-xs text-slate-300">Verification badges</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">{isAdminLogin ? "Admin demo login" : "Demo login"}</p>
              <p className="mt-1">Email: demo@spark.app</p>
              <p>Password: demo1234</p>
              {isAdminLogin && <p className="mt-1 text-xs text-aqua">Tip: any email like admin@domain.com gets admin role.</p>}
            </div>
          </>
        )}
      </article>

      <article className="glass animate-rise rounded-3xl p-5 sm:p-6 [animation-delay:140ms]">
        {!user ? (
          <>
            <div className="mb-5 flex rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => {
                  setMode("signup");
                  setSignupStep(1);
                }}
                className={`w-1/2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-coral text-white" : "text-slate-300"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode("login")}
                className={`w-1/2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "login" ? "bg-coral text-white" : "text-slate-300"
                }`}
              >
                Login
              </button>
            </div>

            {mode === "signup" && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                <p className="font-semibold text-white">Onboarding Step {signupStep} of 2</p>
                <p className="mt-1">
                  {signupStep === 1
                    ? "Account details + OTP verification"
                    : "Profile setup with intent and quality details"}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <>
                  {signupStep === 1 && (
                    <>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleSignupChange}
                        placeholder="Full name"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleSignupChange}
                        placeholder="Email address"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleSignupChange}
                        placeholder="Password"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(event) => setOtpInput(event.target.value)}
                          placeholder="Enter OTP code"
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={verifyOtpCode}
                          className="rounded-2xl border border-aqua/40 bg-aqua/20 px-4 py-3 text-sm font-semibold text-aqua transition hover:bg-aqua/30"
                        >
                          Verify OTP
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={sendOtpCode}
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        Send OTP
                      </button>

                      {otpSentCode && (
                        <p className="rounded-xl border border-aqua/30 bg-aqua/15 px-3 py-2 text-xs text-aqua">
                          Demo OTP: {otpSentCode}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={!otpVerified}
                        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                      >
                        Continue to Profile Setup
                      </button>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          name="age"
                          type="number"
                          min="18"
                          max="99"
                          value={formData.age}
                          onChange={handleSignupChange}
                          placeholder="Age (18+)"
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                        />
                        <input
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleSignupChange}
                          placeholder="City"
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                        />
                      </div>

                      <select
                        name="intent"
                        value={formData.intent}
                        onChange={handleSignupChange}
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-coral/70 focus:outline-none"
                      >
                        {intentOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-900">
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <input
                        name="interests"
                        type="text"
                        value={formData.interests}
                        onChange={handleSignupChange}
                        placeholder="Interests (music, gym, travel)"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      <input
                        name="avatar"
                        type="url"
                        value={formData.avatar}
                        onChange={handleSignupChange}
                        placeholder="Profile image URL (optional)"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      {currentAvatarWarnings.length > 0 && (
                        <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                          {currentAvatarWarnings.map((warning) => (
                            <p key={warning}>{warning}</p>
                          ))}
                        </div>
                      )}

                      <textarea
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleSignupChange}
                        placeholder="Short bio (what connection are you looking for?)"
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                      />

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                        >
                          {loading ? "Please wait..." : "Create Premium Profile"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {mode === "login" && (
                <>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleSignupChange}
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                  />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleSignupChange}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? "Please wait..." : "Login to Spark"}
                  </button>
                </>
              )}
            </form>
          </>
        ) : (
          <div className="grid h-full place-items-center rounded-2xl border border-aqua/30 bg-aqua/10 p-4 text-center text-sm text-aqua">
            Account authenticated. Your premium-ready session is secure and active.
          </div>
        )}

        {(error || localNotice) && (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              error
                ? "border border-red-400/35 bg-red-500/10 text-red-100"
                : "border border-aqua/30 bg-aqua/10 text-aqua"
            }`}
          >
            {error || localNotice}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-slate-300">
          By continuing, you agree to Terms, Privacy, and Community Guidelines.
        </p>
      </article>
    </section>
  );
}

export default AuthView;
