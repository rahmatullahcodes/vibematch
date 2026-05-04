import { useEffect, useState } from "react";

function formatIntent(intent) {
  if (typeof intent !== "string" || !intent.trim()) {
    return "Not set";
  }
  return intent.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function SwipeView({
  currentProfile,
  stats,
  loading,
  actionLoading,
  error,
  lastAction,
  lastMatchName,
  onAction,
  onLoginRequest,
  onOpenChat,
  isAuthenticated,
  filters,
  updateFilters,
  resetFilters,
  filterOptions,
  filteredCount,
  totalCount,
  isCurrentProfileMatched,
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setIsProfileModalOpen(false);
  }, [currentProfile?.id]);

  const handleQuickMatch = async () => {
    if (!isAuthenticated || actionLoading) {
      return;
    }
    await onAction("like");
    setIsProfileModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <section className="glass animate-rise rounded-3xl p-5 sm:p-6 [animation-delay:80ms]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl text-white sm:text-3xl md:text-4xl">Swipe Studio</h2>
            <p className="mt-1 text-sm text-slate-300">High-intent profile cards with instant compatibility highlights.</p>
          </div>

          {!isAuthenticated ? (
            <button
              onClick={onLoginRequest}
              className="rounded-full border border-coral/40 bg-coral/20 px-4 py-2 text-xs font-semibold text-white"
            >
              Login required for actions
            </button>
          ) : (
            <span className="rounded-full border border-aqua/30 bg-aqua/15 px-4 py-2 text-xs font-semibold text-aqua">
              Real-time swipe mode / {filteredCount} of {totalCount} profiles
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="glass animate-rise overflow-hidden rounded-3xl [animation-delay:140ms]">
          {loading ? (
            <div className="grid h-[380px] place-items-center text-sm text-slate-300 sm:h-[460px] lg:h-[560px]">
              Loading profile recommendations...
            </div>
          ) : currentProfile ? (
            <>
              <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
                <img src={currentProfile.image} alt={currentProfile.name} className="h-full w-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-3xl text-white md:text-5xl">
                        {currentProfile.name}, {currentProfile.age}
                      </h3>
                      <p className="mt-1 text-sm text-slate-200">
                        {currentProfile.city} / {currentProfile.distanceKm} km away
                      </p>
                      <p className="mt-1 text-xs text-slate-300">{currentProfile.details?.lastActiveLabel || "Active recently"}</p>
                    </div>
                    <span className="rounded-full border border-aqua/30 bg-aqua/20 px-3 py-1 text-xs font-semibold text-aqua">
                      {currentProfile.compatibility}% match
                    </span>
                  </div>

                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-200">{currentProfile.bio}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentProfile.interests.map((item) => (
                      <span key={item} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white">
                        {item}
                      </span>
                    ))}
                    <span className="rounded-full border border-coral/40 bg-coral/20 px-3 py-1 text-xs font-semibold text-coral">
                      Intent: {formatIntent(currentProfile.intent)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-white/10 px-4 py-5 sm:grid-cols-3 sm:px-5">
                <button
                  onClick={() => onAction("pass")}
                  disabled={actionLoading || !isAuthenticated}
                  className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-60"
                >
                  Pass
                </button>
                <button
                  onClick={() => onAction("superlike")}
                  disabled={actionLoading || !isAuthenticated}
                  className="rounded-2xl border border-aqua/40 bg-aqua/20 px-5 py-3 text-sm font-semibold text-aqua transition hover:bg-aqua/30 disabled:opacity-60"
                >
                  Super Like
                </button>
                <button
                  onClick={() => onAction("like")}
                  disabled={actionLoading || !isAuthenticated}
                  className="rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  Like
                </button>
              </div>
            </>
          ) : (
            <div className="grid h-[380px] place-items-center px-5 text-center text-sm text-slate-300 sm:h-[460px] lg:h-[560px]">
              No profiles match your current filters. Adjust filters to discover more people.
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <section className="glass animate-rise rounded-3xl p-5 [animation-delay:180ms]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg text-white">Discovery Filters</h3>
              <button
                onClick={resetFilters}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200"
              >
                Reset
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={filters.minAge}
                  onChange={(event) => updateFilters({ minAge: Number(event.target.value) || 18 })}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-coral/70 focus:outline-none"
                  placeholder="Min age"
                />
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={filters.maxAge}
                  onChange={(event) => updateFilters({ maxAge: Number(event.target.value) || 99 })}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-coral/70 focus:outline-none"
                  placeholder="Max age"
                />
              </div>

              <select
                value={filters.city}
                onChange={(event) => updateFilters({ city: event.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-coral/70 focus:outline-none"
              >
                <option value="all" className="bg-slate-900">
                  All cities
                </option>
                {filterOptions.cities.map((city) => (
                  <option key={city} value={city} className="bg-slate-900">
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={filters.intent}
                onChange={(event) => updateFilters({ intent: event.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-coral/70 focus:outline-none"
              >
                <option value="all" className="bg-slate-900">
                  All intents
                </option>
                {filterOptions.intents.map((intent) => (
                  <option key={intent} value={intent} className="bg-slate-900">
                    {formatIntent(intent)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={filters.interest}
                onChange={(event) => updateFilters({ interest: event.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                placeholder="Interest keyword (music, travel...)"
              />

              <select
                value={filters.sortBy || "compatibility"}
                onChange={(event) => updateFilters({ sortBy: event.target.value })}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-coral/70 focus:outline-none"
              >
                <option value="compatibility" className="bg-slate-900">
                  Sort: Best match
                </option>
                <option value="last_active" className="bg-slate-900">
                  Sort: Last active
                </option>
                <option value="distance" className="bg-slate-900">
                  Sort: Nearest first
                </option>
              </select>

              <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-100">
                <input
                  type="checkbox"
                  checked={Boolean(filters.verifiedOnly)}
                  onChange={(event) => updateFilters({ verifiedOnly: event.target.checked })}
                  className="h-4 w-4 accent-coral"
                />
                Verified profiles only
              </label>
            </div>
          </section>

          {currentProfile?.compatibilityBreakdown && (
            <section className="glass animate-rise rounded-3xl p-5 [animation-delay:200ms]">
              <h3 className="font-heading text-lg text-white">Compatibility Breakdown</h3>
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <p className="surface-soft rounded-xl px-3 py-2">
                  Interests: {currentProfile.compatibilityBreakdown.interestScore}%
                </p>
                <p className="surface-soft rounded-xl px-3 py-2">
                  Communication: {currentProfile.compatibilityBreakdown.communicationScore}%
                </p>
                <p className="surface-soft rounded-xl px-3 py-2">
                  Lifestyle: {currentProfile.compatibilityBreakdown.lifestyleScore}%
                </p>
                <p className="surface-soft rounded-xl px-3 py-2">
                  Intent: {currentProfile.compatibilityBreakdown.intentScore}%
                </p>
                <div className="surface-soft rounded-xl px-3 py-3">
                  {currentProfile.compatibilityBreakdown.reasons.map((reason) => (
                    <p key={reason} className="mb-1 last:mb-0">
                      - {reason}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="glass animate-rise rounded-3xl p-5 [animation-delay:220ms]">
            <h3 className="font-heading text-lg text-white">Performance Snapshot</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="surface-soft rounded-xl p-3">
                <p className="font-heading text-2xl text-coral">{stats.likes}</p>
                <p className="text-xs text-slate-300">Likes</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="font-heading text-2xl text-aqua">{stats.matches}</p>
                <p className="text-xs text-slate-300">Matches</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="font-heading text-2xl text-amber-300">{stats.superLikes}</p>
                <p className="text-xs text-slate-300">Super likes</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="font-heading text-2xl text-slate-100">{stats.passes}</p>
                <p className="text-xs text-slate-300">Passes</p>
              </div>
            </div>
          </section>

          <section className="glass animate-rise rounded-3xl p-5 [animation-delay:240ms]">
            <h3 className="font-heading text-lg text-white">Live Feedback</h3>
            <div className="mt-3 surface-soft rounded-xl px-3 py-3 text-sm text-slate-200">
              {lastAction ? `Last action recorded: ${lastAction}` : "No swipe action submitted yet."}
            </div>
            {!isCurrentProfileMatched && (
              <p className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300">
                Advanced profile details unlock after mutual match.
              </p>
            )}
            {lastMatchName && (
              <div className="mt-3 rounded-xl border border-aqua/35 bg-aqua/15 px-3 py-3 text-sm text-aqua">
                <p>Match unlocked with {lastMatchName}</p>
                <button
                  onClick={onOpenChat}
                  className="mt-3 rounded-lg border border-aqua/45 bg-aqua/25 px-3 py-1.5 text-xs font-semibold text-aqua transition hover:bg-aqua/35"
                >
                  Open Chat
                </button>
              </div>
            )}
          </section>
        </aside>
      </section>

      {error && (
        <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>
      )}

      {isProfileModalOpen && currentProfile && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-slate-950/75 px-3 py-6">
          <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentProfile.image}
                  alt={currentProfile.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-heading text-2xl text-white">
                    {currentProfile.name}, {currentProfile.age}
                  </p>
                  <p className="text-xs text-slate-300">{currentProfile.city}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Intent: {formatIntent(currentProfile.intent)}
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Distance: {currentProfile.distanceKm} km
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Compatibility: {currentProfile.compatibility}%
              </p>
              <p className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                Verification:{" "}
                {currentProfile.verification?.phone || currentProfile.verification?.selfie || currentProfile.verification?.id
                  ? "Verified profile"
                  : "Not verified"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(currentProfile.interests ?? []).map((item) => (
                <span key={item} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-slate-100">
                  {item}
                </span>
              ))}
            </div>

            {isCurrentProfileMatched ? (
              <div className="mt-5 rounded-2xl border border-aqua/30 bg-aqua/10 p-4 text-sm text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aqua">Unlocked Details</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Occupation: {currentProfile.details?.occupation || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Education: {currentProfile.details?.education || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Goal: {currentProfile.details?.relationshipGoal || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Lifestyle: {currentProfile.details?.lifestyle || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Style: {currentProfile.details?.communicationStyle || "Not shared"}
                  </p>
                  <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs">
                    Last Active: {currentProfile.details?.lastActiveLabel || "Recently"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Advanced details are locked.</p>
                <p className="mt-1 text-xs text-slate-300">
                  Mutual match ke baad occupation, communication style, and lifestyle preferences unlock ho jayenge.
                </p>
                <button
                  type="button"
                  onClick={handleQuickMatch}
                  disabled={!isAuthenticated || actionLoading}
                  className="mt-3 rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {actionLoading ? "Processing..." : "Like to Continue"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SwipeView;
