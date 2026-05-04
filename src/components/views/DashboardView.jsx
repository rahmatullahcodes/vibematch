function formatDate(value) {
  if (!value) {
    return "NA";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NA";
  }
  return date.toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });
}

function DashboardView({
  isAuthenticated,
  isAdmin,
  user,
  unreadCount,
  swipeStats,
  threads,
  activeCallSession,
  currentPlanMeta,
  reportSummary,
  onOpenTab,
  onLoginRequest,
}) {
  if (!isAuthenticated) {
    return (
      <section className="glass animate-rise rounded-3xl p-6 text-center">
        <h2 className="font-heading text-2xl text-white">Workspace Dashboard</h2>
        <p className="mt-2 text-sm text-slate-300">Login to view your personal dashboard, insights, and quick controls.</p>
        <button
          onClick={onLoginRequest}
          className="mt-4 rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white"
        >
          Login to Continue
        </button>
      </section>
    );
  }

  const activeThreads = Array.isArray(threads) ? threads.length : 0;
  const openReports = reportSummary?.open ?? 0;
  const callLabel = activeCallSession
    ? `${activeCallSession.type === "video" ? "Video" : "Voice"} / ${activeCallSession.status}`
    : "No active calls";

  const cards = [
    { label: "Unread Alerts", value: unreadCount ?? 0, tone: "text-coral" },
    { label: "Matches", value: swipeStats?.matches ?? 0, tone: "text-aqua" },
    { label: "Likes Sent", value: swipeStats?.likes ?? 0, tone: "text-amber-300" },
    { label: "Active Chats", value: activeThreads, tone: "text-white" },
  ];

  return (
    <div className="space-y-6">
      <section className="glass-strong animate-rise rounded-3xl p-5 sm:p-6 [animation-delay:80ms]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Overview</p>
            <h2 className="mt-1 font-heading text-2xl text-white sm:text-3xl">Welcome back, {user?.name || "Member"}</h2>
            <p className="mt-2 text-sm text-slate-300">
              Plan: <span className="font-semibold text-white">{currentPlanMeta?.name || "Starter"}</span> / Call status:{" "}
              <span className="font-semibold text-white">{callLabel}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onOpenTab("discover")}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Open Discover
            </button>
            <button
              onClick={() => onOpenTab("chat")}
              className="rounded-xl border border-aqua/35 bg-aqua/20 px-4 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/30"
            >
              Open Messages
            </button>
            <button
              onClick={() => onOpenTab("premium")}
              className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Manage Plan
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <article key={card.label} className="glass animate-rise rounded-2xl p-4" style={{ animationDelay: `${100 + index * 45}ms` }}>
            <p className="text-xs uppercase tracking-[0.1em] text-slate-300">{card.label}</p>
            <p className={`mt-2 font-heading text-3xl ${card.tone}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <article className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white">Quick Actions</h3>
            <span className="text-xs text-slate-300">One-click navigation</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => onOpenTab("swipe")}
              className="surface-soft rounded-2xl p-3 text-left transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">Swipe Studio</p>
              <p className="mt-1 text-xs text-slate-300">Discover and match with new profiles.</p>
            </button>
            <button
              onClick={() => onOpenTab("calls")}
              className="surface-soft rounded-2xl p-3 text-left transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">Call Lounge</p>
              <p className="mt-1 text-xs text-slate-300">Start voice/video introductions quickly.</p>
            </button>
            <button
              onClick={() => onOpenTab("notifications")}
              className="surface-soft rounded-2xl p-3 text-left transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">Alerts Center</p>
              <p className="mt-1 text-xs text-slate-300">Track matches, messages, and system updates.</p>
            </button>
            <button
              onClick={() => onOpenTab("auth")}
              className="surface-soft rounded-2xl p-3 text-left transition hover:bg-white/10"
            >
              <p className="text-sm font-semibold text-white">Account Settings</p>
              <p className="mt-1 text-xs text-slate-300">Edit profile, privacy, and verification.</p>
            </button>
            {isAdmin && (
              <button
                onClick={() => onOpenTab("moderation")}
                className="rounded-2xl border border-coral/35 bg-coral/15 p-3 text-left transition hover:bg-coral/20 sm:col-span-2"
              >
                <p className="text-sm font-semibold text-white">Admin Moderation Panel</p>
                <p className="mt-1 text-xs text-slate-100">
                  Open reports right now: <span className="font-semibold">{openReports}</span>
                </p>
              </button>
            )}
          </div>
        </article>

        <aside className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-xl text-white">Recent Conversations</h3>
            <button onClick={() => onOpenTab("chat")} className="text-xs font-semibold text-coral transition hover:text-amber-300">
              Open Inbox
            </button>
          </div>

          {activeThreads === 0 ? (
            <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">No active chats yet.</p>
          ) : (
            <div className="space-y-2">
              {threads.slice(0, 5).map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onOpenTab("chat")}
                  className="surface-soft w-full rounded-2xl px-3 py-3 text-left transition hover:bg-white/10"
                >
                  <p className="truncate text-sm font-semibold text-white">{thread.name}</p>
                  <p className="truncate text-xs text-slate-300">{thread.preview}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDate(thread.updatedAt || thread.time)}</p>
                </button>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default DashboardView;

