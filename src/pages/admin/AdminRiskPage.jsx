import { useMemo } from "react";
import { useAdminOutlet } from "./useAdminOutlet";

function AdminRiskPage() {
  const { users, reports, reportSummary } = useAdminOutlet();

  const riskSummary = useMemo(() => {
    const suspended = users.filter((user) => user.accountStatus === "suspended").length;
    const banned = users.filter((user) => user.accountStatus === "banned").length;
    const warningSignals = reports.filter((report) => report.status === "open" || report.status === "under_review").length;
    return { suspended, banned, warningSignals };
  }, [reports, users]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Risk signals</p>
          <p className="mt-2 font-heading text-3xl text-coral">{riskSummary.warningSignals}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Suspended users</p>
          <p className="mt-2 font-heading text-3xl text-amber-200">{riskSummary.suspended}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Banned users</p>
          <p className="mt-2 font-heading text-3xl text-red-200">{riskSummary.banned}</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Fraud and Risk Console</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-sm font-semibold text-white">Device anomaly model</p>
            <p className="mt-1 text-xs text-slate-300">Flagging suspicious multi-account behavior with confidence scoring.</p>
            <p className="mt-1 text-xs text-aqua">Status: Active</p>
          </article>
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-sm font-semibold text-white">Behavioral abuse model</p>
            <p className="mt-1 text-xs text-slate-300">Captures harassment, spam loops, and manipulation attempts.</p>
            <p className="mt-1 text-xs text-aqua">Status: Active</p>
          </article>
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-sm font-semibold text-white">Content toxicity scorer</p>
            <p className="mt-1 text-xs text-slate-300">Prioritizes urgent moderation for harmful conversations.</p>
            <p className="mt-1 text-xs text-amber-200">Status: Monitoring</p>
          </article>
          <article className="surface-soft rounded-2xl p-3">
            <p className="text-sm font-semibold text-white">Open moderation risk</p>
            <p className="mt-1 text-xs text-slate-300">
              Current open cases in queue: <span className="font-semibold text-white">{reportSummary?.open || 0}</span>
            </p>
            <p className="mt-1 text-xs text-coral">Status: Needs continuous review</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default AdminRiskPage;
