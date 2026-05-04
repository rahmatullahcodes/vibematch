import { useState } from "react";
import Icon from "../Icon";

function formatDate(value) {
  if (!value) {
    return "NA";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NA";
  }
  return date.toLocaleString();
}

function badgeTone(status) {
  if (status === "open") {
    return "border-coral/35 bg-coral/15 text-coral";
  }
  if (status === "under_review") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-200";
  }
  if (status === "resolved") {
    return "border-aqua/35 bg-aqua/15 text-aqua";
  }
  return "border-white/20 bg-white/10 text-slate-300";
}

function userStatusTone(status) {
  if (status === "active") {
    return "border-aqua/35 bg-aqua/15 text-aqua";
  }
  if (status === "suspended") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-200";
  }
  if (status === "banned") {
    return "border-red-500/35 bg-red-500/15 text-red-100";
  }
  return "border-white/20 bg-white/10 text-slate-300";
}

function resolveActivateAction(status) {
  if (status === "banned") {
    return { label: "Unban", reason: "Unbanned by admin" };
  }
  if (status === "suspended") {
    return { label: "Unsuspend", reason: "Unsuspended by admin" };
  }
  return { label: "Active", reason: "Already active" };
}

function resolveVisibleActions(status) {
  if (status === "banned") {
    return ["activate"];
  }
  if (status === "suspended") {
    return ["activate", "ban"];
  }
  return ["suspend", "ban"];
}

const actionIcons = {
  refresh: "M4.5 4.5v5h5M19.5 19.5v-5h-5M19 9a7 7 0 0 0-12-2M5 15a7 7 0 0 0 12 2",
  view: "M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7zm10 3.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4z",
  edit: "M4 20h4l10-10a2.8 2.8 0 1 0-4-4L4 16v4z",
  activate: "M5 13l4 4L19 7",
  suspend: "M10 6v12M14 6v12",
  ban: "M6 6l12 12M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  review: "M12 17v.01M12 13a2.5 2.5 0 1 0-2-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  warn: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  dismiss: "M6 6l12 12M18 6L6 18",
  save: "M5 13l4 4L19 7",
  close: "M6 6l12 12M18 6L6 18",
  verified: "M5 13l4 4L19 7",
};

function resolveDefaultReason(action) {
  if (action === "activate") {
    return "Reactivated by admin";
  }
  if (action === "suspend") {
    return "Suspended by admin moderation";
  }
  return "Banned by admin moderation";
}

function formatIntent(intent) {
  if (intent === "long_term") {
    return "Long-term";
  }
  if (intent === "friendship") {
    return "Friendship";
  }
  if (intent === "casual") {
    return "Casual";
  }
  return "Dating";
}

function DetailRow({ label, value, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-3 border-b border-white/10 py-1.5 text-xs ${className}`}>
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right text-slate-100">{value || "NA"}</span>
    </div>
  );
}

function AdminModerationView({
  isAuthenticated,
  isAdmin,
  loading,
  actionLoading,
  error,
  reports,
  reportSummary,
  users,
  usersSummary,
  userStatusFilter,
  userSearchQuery,
  audit,
  analytics,
  statusFilter,
  onStatusFilterChange,
  onUserStatusFilterChange,
  onUserSearchChange,
  onRefresh,
  onRefreshUsers,
  onResolveReport,
  onUpdateUserStatus,
  onOpenAccount,
  onLoginRequest,
}) {
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editAction, setEditAction] = useState("suspend");
  const [editReason, setEditReason] = useState("");

  if (!isAuthenticated) {
    return (
      <section className="glass animate-rise rounded-3xl p-6 text-center">
        <h2 className="font-heading text-2xl text-white">Moderation Console</h2>
        <p className="mt-2 text-sm text-slate-300">Admin login is required to manage reports and analytics.</p>
        <button
          onClick={onLoginRequest}
          className="mt-4 rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white"
        >
          Admin Login
        </button>
        <p className="mt-3 text-xs text-slate-400">Use `demo@spark.app` / `demo1234` for demo admin access.</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="glass animate-rise rounded-3xl p-6 text-center">
        <h2 className="font-heading text-2xl text-white">Moderation Console</h2>
        <p className="mt-2 text-sm text-slate-300">Only admin accounts can access this section.</p>
        <button
          onClick={onOpenAccount}
          className="mt-4 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          Open Account
        </button>
      </section>
    );
  }

  const metrics = analytics?.metrics || {};
  const trend = Array.isArray(analytics?.trends?.dau7d) ? analytics.trends.dau7d : [];

  const openEditUser = (user) => {
    const defaultAction = user.accountStatus === "active" ? "suspend" : "activate";
    setEditUser(user);
    setEditAction(defaultAction);
    setEditReason("");
  };

  const closeEditUser = () => {
    setEditUser(null);
    setEditReason("");
  };

  const submitEditAction = async () => {
    if (!editUser) {
      return;
    }
    const selectedReason = editReason.trim() || resolveDefaultReason(editAction);
    const result = await onUpdateUserStatus({
      targetUserId: editUser.id,
      action: editAction,
      reason: selectedReason,
    });
    if (result?.ok) {
      closeEditUser();
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-white sm:text-3xl">Admin Moderation Panel</h2>
            <p className="mt-1 text-sm text-slate-300">Reports queue, user actions, and trust analytics in one place.</p>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
          >
            <Icon path={actionIcons.refresh} className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">DAU</p>
            <p className="mt-1 text-xl font-semibold text-white">{metrics.dailyActiveUsers || 0}</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Match Conversion</p>
            <p className="mt-1 text-xl font-semibold text-white">{metrics.matchConversionRate || 0}%</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Chat Response</p>
            <p className="mt-1 text-xl font-semibold text-white">{metrics.chatResponseRate || 0}%</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Paid Conversion</p>
            <p className="mt-1 text-xl font-semibold text-white">{metrics.paidConversionRate || 0}%</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Open Reports</p>
            <p className="mt-1 text-xl font-semibold text-white">{reportSummary?.open || 0}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-300">DAU Trend (7d)</p>
          <div className="mt-2 flex items-end gap-2">
            {trend.map((item) => (
              <div key={item.day} className="flex-1 text-center">
                <div
                  className="mx-auto w-full rounded-t bg-gradient-to-t from-coral to-aqua"
                  style={{ height: `${Math.max(10, Math.min(72, Number(item.value) || 10))}px` }}
                />
                <p className="mt-1 text-[10px] text-slate-400">{item.day}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="admin-user-controls" className="glass rounded-3xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg text-white">User Controls</h3>
            <p className="mt-1 text-xs text-slate-300">Suspend, ban, or reactivate accounts instantly.</p>
          </div>
          <button
            onClick={onRefreshUsers}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100"
          >
            <Icon path={actionIcons.refresh} className="h-4 w-4" />
            Refresh Users
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Total Users</p>
            <p className="mt-1 text-xl font-semibold text-white">{usersSummary?.total || 0}</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Active</p>
            <p className="mt-1 text-xl font-semibold text-aqua">{usersSummary?.active || 0}</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Suspended</p>
            <p className="mt-1 text-xl font-semibold text-amber-200">{usersSummary?.suspended || 0}</p>
          </div>
          <div className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Banned</p>
            <p className="mt-1 text-xl font-semibold text-red-200">{usersSummary?.banned || 0}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <input
            value={userSearchQuery}
            onChange={(event) => onUserSearchChange(event.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-aqua/35 focus:outline-none"
          />
          <select
            value={userStatusFilter}
            onChange={(event) => onUserStatusFilterChange(event.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-aqua/35 focus:outline-none"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {users.length === 0 ? (
          <p className="surface-soft mt-3 rounded-2xl px-4 py-4 text-sm text-slate-300">No users found.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {users.slice(0, 30).map((item) => (
              <article key={item.id} className="surface-soft rounded-2xl p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${userStatusTone(item.accountStatus)}`}>
                        {item.accountStatus}
                      </span>
                      {item.role === "admin" && (
                        <span className="rounded-full border border-coral/35 bg-coral/15 px-2 py-0.5 text-[11px] font-semibold text-coral">
                          admin
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{item.email}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Last active: {formatDate(item.lastActiveAt)} / Joined: {formatDate(item.createdAt)}
                    </p>
                    {item.suspendedUntil && (
                      <p className="mt-1 text-[11px] text-amber-200">Suspended until: {formatDate(item.suspendedUntil)}</p>
                    )}
                    {item.suspensionReason && (
                      <p className="mt-1 text-[11px] text-slate-300">Reason: {item.suspensionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setViewUser(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200"
                    >
                      <Icon path={actionIcons.view} className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => openEditUser(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200"
                    >
                      <Icon path={actionIcons.edit} className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {resolveVisibleActions(item.accountStatus).map((actionKey) => {
                      if (actionKey === "activate") {
                        const activateAction = resolveActivateAction(item.accountStatus);
                        return (
                          <button
                            key={`${item.id}_activate`}
                            onClick={() =>
                              onUpdateUserStatus({
                                targetUserId: item.id,
                                action: "activate",
                                reason: activateAction.reason,
                              })
                            }
                            disabled={actionLoading || item.role === "admin"}
                            className="inline-flex items-center gap-1 rounded-lg border border-aqua/35 bg-aqua/15 px-2 py-1 text-[11px] text-aqua disabled:opacity-60"
                          >
                            <Icon path={actionIcons.activate} className="h-3.5 w-3.5" />
                            {activateAction.label}
                          </button>
                        );
                      }

                      if (actionKey === "suspend") {
                        return (
                          <button
                            key={`${item.id}_suspend`}
                            onClick={() =>
                              onUpdateUserStatus({
                                targetUserId: item.id,
                                action: "suspend",
                                reason: "Suspended by admin moderation",
                              })
                            }
                            disabled={actionLoading || item.role === "admin"}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-300/10 px-2 py-1 text-[11px] text-amber-200 disabled:opacity-60"
                          >
                            <Icon path={actionIcons.suspend} className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`${item.id}_ban`}
                          onClick={() =>
                            onUpdateUserStatus({
                              targetUserId: item.id,
                              action: "ban",
                              reason: "Banned by admin moderation",
                            })
                          }
                          disabled={actionLoading || item.role === "admin"}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/15 px-2 py-1 text-[11px] text-red-100 disabled:opacity-60"
                        >
                          <Icon path={actionIcons.ban} className="h-3.5 w-3.5" />
                          Ban
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setViewUser(null)}>
          <section
            className="glass max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/20 p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={viewUser.avatar} alt={viewUser.name} className="h-14 w-14 rounded-full border border-white/20 object-cover" />
                <div>
                  <p className="font-heading text-2xl text-white">{viewUser.name}</p>
                  <p className="text-sm text-slate-300">{viewUser.email}</p>
                  <p className="text-xs text-slate-400">{viewUser.handle || viewUser.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                <Icon path={actionIcons.close} className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${userStatusTone(viewUser.accountStatus)}`}>
                {viewUser.accountStatus}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">Role: {viewUser.role}</span>
              <span className="rounded-full border border-aqua/30 bg-aqua/10 px-2.5 py-1 text-xs font-semibold text-aqua">
                Profile {viewUser.profileCompletionScore || 0}%
              </span>
              <span className="rounded-full border border-coral/30 bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
                {viewUser.subscriptionPlanMeta?.name || viewUser.subscriptionPlan || "Starter"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="surface-soft rounded-2xl p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Profile</p>
                <DetailRow label="Age" value={String(viewUser.age || "NA")} />
                <DetailRow label="City" value={viewUser.city} />
                <DetailRow label="Intent" value={formatIntent(viewUser.intent)} />
                <DetailRow label="Goal" value={viewUser.relationshipGoal} />
                <DetailRow label="Occupation" value={viewUser.occupation} />
                <DetailRow label="Education" value={viewUser.education} className="border-b-0" />
              </div>

              <div className="surface-soft rounded-2xl p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Account</p>
                <DetailRow label="User ID" value={viewUser.id} className="[&>span:last-child]:break-all" />
                <DetailRow label="Joined" value={formatDate(viewUser.createdAt)} />
                <DetailRow label="Last Active" value={formatDate(viewUser.lastActiveAt)} />
                <DetailRow label="Status Note" value={viewUser.suspensionReason || "NA"} />
                <DetailRow label="Suspended Until" value={formatDate(viewUser.suspendedUntil)} />
                <DetailRow
                  label="Subscription"
                  value={`${viewUser.subscriptionStatus || "free"}${viewUser.subscriptionRenewsAt ? ` / renews ${formatDate(viewUser.subscriptionRenewsAt)}` : ""}`}
                  className="border-b-0"
                />
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="surface-soft rounded-2xl p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Interests</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Array.isArray(viewUser.interests) && viewUser.interests.length > 0 ? viewUser.interests : ["No interests"]).map((interest) => (
                    <span key={`${viewUser.id}_${interest}`} className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-200">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="surface-soft rounded-2xl p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Verification</p>
                <div className="mt-2 space-y-2 text-xs text-slate-200">
                  <p className="inline-flex items-center gap-1.5">
                    <Icon path={actionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.phone ? "text-aqua" : "text-slate-500"}`} />
                    Phone {viewUser.verification?.phone ? "verified" : "not verified"}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Icon path={actionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.selfie ? "text-aqua" : "text-slate-500"}`} />
                    Selfie {viewUser.verification?.selfie ? "verified" : "not verified"}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Icon path={actionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.id ? "text-aqua" : "text-slate-500"}`} />
                    ID {viewUser.verification?.id ? "verified" : "not verified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-soft mt-3 rounded-2xl p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Bio</p>
              <p className="mt-2 text-sm text-slate-100">{viewUser.bio || "No bio available."}</p>
            </div>
          </section>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={closeEditUser}>
          <section
            className="glass w-full max-w-2xl rounded-3xl border border-aqua/35 p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-2xl text-white">Edit User Action</p>
                <p className="mt-1 text-sm text-slate-300">
                  {editUser.name} ({editUser.email})
                </p>
                <p className="mt-1 text-xs text-slate-400">Current status: {editUser.accountStatus}</p>
              </div>
              <button
                onClick={closeEditUser}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                <Icon path={actionIcons.close} className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs text-slate-300">Action</label>
              <select
                value={editAction}
                onChange={(event) => setEditAction(event.target.value)}
                className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm text-white focus:border-aqua/35 focus:outline-none"
              >
                <option value="activate">Activate / Restore</option>
                <option value="suspend">Suspend</option>
                <option value="ban">Ban</option>
              </select>
            </div>

            <div className="mt-3 grid gap-2">
              <label className="text-xs text-slate-300">Reason (optional)</label>
              <textarea
                value={editReason}
                onChange={(event) => setEditReason(event.target.value)}
                rows={3}
                placeholder="Why are you applying this action?"
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-aqua/35 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={closeEditUser}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                <Icon path={actionIcons.close} className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={submitEditAction}
                disabled={actionLoading || editUser.role === "admin"}
                className="inline-flex items-center gap-1 rounded-lg border border-aqua/35 bg-aqua/20 px-3 py-2 text-xs font-semibold text-aqua disabled:opacity-60"
              >
                <Icon path={actionIcons.save} className="h-3.5 w-3.5" />
                Save Action
              </button>
            </div>
          </section>
        </div>
      )}

      <section id="admin-reports" className="glass rounded-3xl p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-lg text-white">Reports Queue</h3>
          <div className="flex flex-wrap gap-2">
            {["all", "open", "under_review", "resolved", "dismissed"].map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                  statusFilter === status
                    ? "border-aqua/35 bg-aqua/20 text-aqua"
                    : "border-white/20 bg-white/10 text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">No reports found.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article key={report.id} className="surface-soft rounded-2xl p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeTone(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                        {report.kind}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">
                      Reporter: {report.reporterName} / Target: {report.targetUserName}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">{report.reason}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(report.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onResolveReport({ reportId: report.id, action: "review" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200 disabled:opacity-60"
                    >
                      <Icon path={actionIcons.review} className="h-3.5 w-3.5" />
                      Review
                    </button>
                    <button
                      onClick={() => onResolveReport({ reportId: report.id, action: "warn", note: "Policy warning" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-300/10 px-2 py-1 text-[11px] text-amber-200 disabled:opacity-60"
                    >
                      <Icon path={actionIcons.warn} className="h-3.5 w-3.5" />
                      Warn
                    </button>
                    <button
                      onClick={() =>
                        onResolveReport({
                          reportId: report.id,
                          action: "suspend",
                          note: "Suspended by moderation",
                          suspendHours: 24,
                        })
                      }
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-400/35 bg-red-500/10 px-2 py-1 text-[11px] text-red-100 disabled:opacity-60"
                    >
                      <Icon path={actionIcons.suspend} className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                    <button
                      onClick={() => onResolveReport({ reportId: report.id, action: "ban", note: "Severe violation" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-600/20 px-2 py-1 text-[11px] text-red-100 disabled:opacity-60"
                    >
                      <Icon path={actionIcons.ban} className="h-3.5 w-3.5" />
                      Ban
                    </button>
                    <button
                      onClick={() => onResolveReport({ reportId: report.id, action: "dismiss", note: "No violation found" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-300 disabled:opacity-60"
                    >
                      <Icon path={actionIcons.dismiss} className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="admin-audit" className="glass rounded-3xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-lg text-white">Moderation Audit Trail</h3>
        </div>
        {audit.length === 0 ? (
          <p className="surface-soft rounded-2xl px-4 py-4 text-sm text-slate-300">No moderation actions yet.</p>
        ) : (
          <div className="space-y-2">
            {audit.slice(0, 20).map((entry) => (
              <div key={entry.id} className="surface-soft rounded-xl px-3 py-2 text-xs text-slate-200">
                <p>
                  {entry.actorName} performed <span className="font-semibold">{entry.action}</span> on {entry.targetName}
                </p>
                <p className="text-slate-400">{formatDate(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    </div>
  );
}

export default AdminModerationView;
