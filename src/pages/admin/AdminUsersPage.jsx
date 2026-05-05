import { useState } from "react";
import Icon from "../../components/Icon";
import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime, statusTone } from "./utils";

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

const userActionIcons = {
  refresh: "M4.5 4.5v5h5M19.5 19.5v-5h-5M19 9a7 7 0 0 0-12-2M5 15a7 7 0 0 0 12 2",
  view: "M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7zm10 3.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4z",
  edit: "M4 20h4l10-10a2.8 2.8 0 1 0-4-4L4 16v4z",
  activate: "M5 13l4 4L19 7",
  suspend: "M10 6v12M14 6v12",
  ban: "M6 6l12 12M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  delete: "M6 7h12M9 7V5h6v2m-7 4v6m4-6v6m4-10-1 12H9a2 2 0 0 1-2-2V7h10v10a2 2 0 0 1-2 2z",
  save: "M5 13l4 4L19 7",
  close: "M6 6l12 12M18 6L6 18",
  verified: "M5 13l4 4L19 7",
};

function resolveDefaultReason(action) {
  if (action === "activate") {
    return "Reactivated by admin";
  }
  if (action === "suspend") {
    return "Suspended for policy review";
  }
  return "Banned for severe policy violation";
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

function AdminUsersPage() {
  const {
    users,
    usersSummary,
    userStatusFilter,
    setUserStatusFilter,
    userSearchQuery,
    setUserSearchQuery,
    actionLoading,
    usersLoading,
    error,
    updateUserStatus,
    deleteUser,
    refreshUsers,
  } = useAdminOutlet();

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editAction, setEditAction] = useState("suspend");
  const [editReason, setEditReason] = useState("");
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

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

  const openDeleteUser = (user) => {
    setDeleteTargetUser(user);
    setDeleteReason("");
  };

  const closeDeleteUser = () => {
    setDeleteTargetUser(null);
    setDeleteReason("");
  };

  const submitEditAction = async () => {
    if (!editUser) {
      return;
    }
    const selectedReason = editReason.trim() || resolveDefaultReason(editAction);
    const result = await updateUserStatus({
      targetUserId: editUser.id,
      action: editAction,
      reason: selectedReason,
    });
    if (result?.ok) {
      closeEditUser();
    }
  };

  const submitDeleteUser = async () => {
    if (!deleteTargetUser) {
      return;
    }

    const selectedReason = deleteReason.trim() || "Deleted by admin";
    const result = await deleteUser({
      targetUserId: deleteTargetUser.id,
      reason: selectedReason,
    });

    if (result?.ok) {
      closeDeleteUser();
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Total</p>
          <p className="mt-2 font-heading text-3xl text-white">{usersSummary?.total || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Active</p>
          <p className="mt-2 font-heading text-3xl text-aqua">{usersSummary?.active || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Suspended</p>
          <p className="mt-2 font-heading text-3xl text-amber-200">{usersSummary?.suspended || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Banned</p>
          <p className="mt-2 font-heading text-3xl text-red-200">{usersSummary?.banned || 0}</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        {error ? (
          <p className="mb-3 rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={userSearchQuery}
            onChange={(event) => setUserSearchQuery(event.target.value)}
            placeholder="Search by user name or email"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-aqua/35 focus:outline-none"
          />
          <select
            value={userStatusFilter}
            onChange={(event) => setUserStatusFilter(event.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white focus:border-aqua/35 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <button
            onClick={() => refreshUsers({ query: userSearchQuery, status: userStatusFilter })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <Icon path={userActionIcons.refresh} className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {usersLoading ? (
          <p className="surface-soft mt-4 rounded-xl px-3 py-3 text-sm text-slate-300">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="surface-soft mt-4 rounded-xl px-3 py-3 text-sm text-slate-300">No users found for this filter.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {users.map((item) => (
              <article key={item.id} className="surface-soft rounded-2xl p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(item.accountStatus)}`}>
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
                      Joined: {formatDateTime(item.createdAt)} / Last active: {formatDateTime(item.lastActiveAt)}
                    </p>
                    {item.suspendedUntil && <p className="mt-1 text-[11px] text-amber-200">Until: {formatDateTime(item.suspendedUntil)}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setViewUser(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
                    >
                      <Icon path={userActionIcons.view} className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => openEditUser(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
                    >
                      <Icon path={userActionIcons.edit} className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteUser(item)}
                      disabled={actionLoading || item.role === "admin"}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/15 disabled:opacity-60"
                    >
                      <Icon path={userActionIcons.delete} className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    {resolveVisibleActions(item.accountStatus).map((actionKey) => {
                      if (actionKey === "activate") {
                        const activateAction = resolveActivateAction(item.accountStatus);
                        return (
                          <button
                            key={`${item.id}_activate`}
                            onClick={() =>
                              updateUserStatus({
                                targetUserId: item.id,
                                action: "activate",
                                reason: activateAction.reason,
                              })
                            }
                            disabled={actionLoading || item.role === "admin"}
                            className="inline-flex items-center gap-1 rounded-lg border border-aqua/35 bg-aqua/15 px-3 py-1.5 text-xs font-semibold text-aqua disabled:opacity-60"
                          >
                            <Icon path={userActionIcons.activate} className="h-3.5 w-3.5" />
                            {activateAction.label}
                          </button>
                        );
                      }

                      if (actionKey === "suspend") {
                        return (
                          <button
                            key={`${item.id}_suspend`}
                            onClick={() =>
                              updateUserStatus({
                                targetUserId: item.id,
                                action: "suspend",
                                reason: "Suspended for policy review",
                              })
                            }
                            disabled={actionLoading || item.role === "admin"}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200 disabled:opacity-60"
                          >
                            <Icon path={userActionIcons.suspend} className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`${item.id}_ban`}
                          onClick={() =>
                            updateUserStatus({
                              targetUserId: item.id,
                              action: "ban",
                              reason: "Banned for severe policy violation",
                            })
                          }
                          disabled={actionLoading || item.role === "admin"}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-100 disabled:opacity-60"
                        >
                          <Icon path={userActionIcons.ban} className="h-3.5 w-3.5" />
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
                <Icon path={userActionIcons.close} className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(viewUser.accountStatus)}`}>
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
                <DetailRow label="Joined" value={formatDateTime(viewUser.createdAt)} />
                <DetailRow label="Last Active" value={formatDateTime(viewUser.lastActiveAt)} />
                <DetailRow label="Status Note" value={viewUser.suspensionReason || "NA"} />
                <DetailRow label="Suspended Until" value={formatDateTime(viewUser.suspendedUntil)} />
                <DetailRow
                  label="Subscription"
                  value={`${viewUser.subscriptionStatus || "free"}${viewUser.subscriptionRenewsAt ? ` / renews ${formatDateTime(viewUser.subscriptionRenewsAt)}` : ""}`}
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
                    <Icon path={userActionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.phone ? "text-aqua" : "text-slate-500"}`} />
                    Phone {viewUser.verification?.phone ? "verified" : "not verified"}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Icon path={userActionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.selfie ? "text-aqua" : "text-slate-500"}`} />
                    Selfie {viewUser.verification?.selfie ? "verified" : "not verified"}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Icon path={userActionIcons.verified} className={`h-3.5 w-3.5 ${viewUser.verification?.id ? "text-aqua" : "text-slate-500"}`} />
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
                <Icon path={userActionIcons.close} className="h-3.5 w-3.5" />
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
                <Icon path={userActionIcons.close} className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={submitEditAction}
                disabled={actionLoading || editUser.role === "admin"}
                className="inline-flex items-center gap-1 rounded-lg border border-aqua/35 bg-aqua/20 px-3 py-2 text-xs font-semibold text-aqua disabled:opacity-60"
              >
                <Icon path={userActionIcons.save} className="h-3.5 w-3.5" />
                Save Action
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={closeDeleteUser}>
          <section
            className="glass w-full max-w-2xl rounded-3xl border border-red-500/35 p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-2xl text-white">Delete User</p>
                <p className="mt-1 text-sm text-slate-300">
                  {deleteTargetUser.name} ({deleteTargetUser.email})
                </p>
                <p className="mt-1 text-xs text-red-200">This action will permanently remove the user account.</p>
              </div>
              <button
                onClick={closeDeleteUser}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                <Icon path={userActionIcons.close} className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs text-slate-300">Reason (optional)</label>
              <textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                rows={3}
                placeholder="Why are you deleting this account?"
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-red-400/60 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={closeDeleteUser}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                <Icon path={userActionIcons.close} className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={submitDeleteUser}
                disabled={actionLoading || deleteTargetUser.role === "admin"}
                className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 disabled:opacity-60"
              >
                <Icon path={userActionIcons.delete} className="h-3.5 w-3.5" />
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
