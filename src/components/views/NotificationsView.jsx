function formatTimeAgo(value) {
  if (!value) {
    return "Just now";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "Just now";
  }

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    return "Just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeTone(type) {
  if (type === "match") {
    return "border-coral/35 bg-coral/10 text-coral";
  }
  if (type === "message") {
    return "border-aqua/35 bg-aqua/10 text-aqua";
  }
  if (type === "billing") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-200";
  }
  if (type === "safety") {
    return "border-red-400/35 bg-red-500/10 text-red-200";
  }
  return "border-white/20 bg-white/10 text-slate-200";
}

function channelLabel(channel) {
  if (channel === "inApp") {
    return "In-App";
  }
  if (channel === "browser") {
    return "Browser Push";
  }
  return "Email";
}

const preferenceTypes = ["match", "message", "billing", "safety", "social", "system"];
const channels = ["inApp", "browser", "email"];

function NotificationsView({
  notifications,
  unreadCount,
  queuedEmailCount,
  preferences,
  browserPermission,
  loading,
  readAllLoading,
  preferencesLoading,
  actionLoading,
  error,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
  onOpenTab,
  onUpdatePreference,
  onRequestBrowserPermission,
  isAuthenticated,
  onLoginRequest,
}) {
  if (!isAuthenticated) {
    return (
      <section className="glass animate-rise rounded-3xl p-6 text-center">
        <h2 className="font-heading text-2xl text-white">Notifications</h2>
        <p className="mt-2 text-sm text-slate-300">Login to access match, message, and safety alerts.</p>
        <button
          onClick={onLoginRequest}
          className="mt-4 rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white"
        >
          Login to Continue
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass animate-rise rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-white sm:text-3xl">Notification Center</h2>
            <p className="mt-1 text-sm text-slate-300">Track likes, matches, messages, billing, and safety updates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-coral/40 bg-coral/20 px-3 py-1 text-xs font-semibold text-white">
              {unreadCount} unread
            </span>
            <span className="rounded-full border border-aqua/30 bg-aqua/15 px-3 py-1 text-xs font-semibold text-aqua">
              {queuedEmailCount} email queued
            </span>
            <button
              onClick={onRefresh}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
            >
              Refresh
            </button>
            <button
              onClick={onMarkAllRead}
              disabled={readAllLoading || unreadCount === 0}
              className="rounded-xl border border-aqua/35 bg-aqua/20 px-3 py-2 text-xs font-semibold text-aqua disabled:opacity-60"
            >
              {readAllLoading ? "Updating..." : "Mark all read"}
            </button>
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-xl text-white">Alert Preferences</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200">
              Browser: {browserPermission}
            </span>
            <button
              onClick={onRequestBrowserPermission}
              className="rounded-lg border border-aqua/35 bg-aqua/20 px-3 py-1.5 text-xs font-semibold text-aqua"
            >
              Enable Browser Push
            </button>
          </div>
        </div>

        {preferencesLoading ? (
          <p className="surface-soft rounded-2xl px-4 py-3 text-sm text-slate-300">Loading preferences...</p>
        ) : (
          <div className="space-y-3">
            {preferenceTypes.map((type) => (
              <div key={type} className="surface-soft rounded-2xl p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize text-white">{type}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {channels.map((channel) => {
                    const key = `pref:${channel}:${type}`;
                    const enabled = Boolean(
                      channel === "inApp"
                        ? preferences?.inAppByType?.[type]
                        : channel === "browser"
                          ? preferences?.browserByType?.[type]
                          : preferences?.emailByType?.[type],
                    );
                    return (
                      <button
                        key={channel}
                        onClick={() => onUpdatePreference(channel, type, !enabled)}
                        disabled={Boolean(actionLoading?.[key])}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          enabled
                            ? "border-aqua/35 bg-aqua/20 text-aqua"
                            : "border-white/20 bg-white/10 text-slate-300"
                        } disabled:opacity-60`}
                      >
                        {actionLoading?.[key] ? "..." : `${channelLabel(channel)}: ${enabled ? "ON" : "OFF"}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass animate-rise rounded-3xl p-4 sm:p-5">
        {loading ? (
          <p className="surface-soft rounded-2xl px-4 py-6 text-sm text-slate-300">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="surface-soft rounded-2xl px-4 py-6 text-sm text-slate-300">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isRead = Boolean(notification.read);
              const readKey = `read:${notification.id}`;
              return (
                <article
                  key={notification.id}
                  className={`rounded-2xl border px-4 py-4 ${isRead ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${typeTone(notification.type)}`}>
                          {notification.type || "system"}
                        </span>
                        {!isRead && <span className="h-2 w-2 rounded-full bg-coral" />}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatTimeAgo(notification.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {notification.actionTab && (
                        <button
                          onClick={() => onOpenTab(notification.actionTab)}
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100"
                        >
                          {notification.actionLabel || "Open"}
                        </button>
                      )}
                      {!isRead && (
                        <button
                          onClick={() => onMarkRead(notification.id)}
                          disabled={Boolean(actionLoading?.[readKey])}
                          className="rounded-lg border border-aqua/35 bg-aqua/20 px-3 py-1.5 text-xs font-semibold text-aqua disabled:opacity-60"
                        >
                          {actionLoading?.[readKey] ? "..." : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {error && <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    </div>
  );
}

export default NotificationsView;
