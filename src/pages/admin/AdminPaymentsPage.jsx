import { useMemo } from "react";
import { useAdminOutlet } from "./useAdminOutlet";

function AdminPaymentsPage() {
  const { analytics, users } = useAdminOutlet();
  const metrics = analytics?.metrics || {};

  const paidUsers = useMemo(
    () => users.filter((user) => ["plus", "premium"].includes((user.subscriptionPlan || "").toLowerCase())).slice(0, 12),
    [users],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Paid Users</p>
          <p className="mt-2 font-heading text-3xl text-white">{metrics.paidUsers || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Paid Conversion</p>
          <p className="mt-2 font-heading text-3xl text-aqua">{metrics.paidConversionRate || 0}%</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Matches</p>
          <p className="mt-2 font-heading text-3xl text-coral">{metrics.totalMatches || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Chat Response</p>
          <p className="mt-2 font-heading text-3xl text-white">{metrics.chatResponseRate || 0}%</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Subscription Revenue Operations</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Refund queue</p>
            <p className="mt-1 text-sm font-semibold text-white">0 pending</p>
          </article>
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Failed renewals (24h)</p>
            <p className="mt-1 text-sm font-semibold text-white">2 retries scheduled</p>
          </article>
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-xs text-slate-400">Fraud checks</p>
            <p className="mt-1 text-sm font-semibold text-aqua">Healthy</p>
          </article>
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-heading text-lg text-white">Paid User Snapshot</h3>
        {paidUsers.length === 0 ? (
          <p className="surface-soft mt-3 rounded-xl px-3 py-3 text-sm text-slate-300">No paid users found in current filter.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {paidUsers.map((user) => (
              <article key={user.id} className="surface-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-300">{user.email}</p>
                <p className="mt-1 text-[11px] text-slate-400">Plan: {(user.subscriptionPlan || "starter").toUpperCase()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPaymentsPage;
