import { Link } from "react-router-dom";
import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime } from "./utils";

const quickModules = [
  { to: "/admin/users", title: "Users Management", desc: "Suspend, activate, and verify accounts quickly." },
  { to: "/admin/reports", title: "Reports Queue", desc: "Resolve reports with warn, suspend, and ban actions." },
  { to: "/admin/payments", title: "Payments Console", desc: "Track paid conversions and subscription operations." },
  { to: "/admin/system", title: "System Health", desc: "Monitor uptime, latency, and operational checks." },
];

function AdminOverviewPage() {
  const { analytics, reportSummary, usersSummary, reports, audit, reportsLoading, auditLoading } = useAdminOutlet();
  const metrics = analytics?.metrics || {};

  const stats = [
    { label: "Total Users", value: metrics.totalUsers || 0, tone: "text-white" },
    { label: "Daily Active Users", value: metrics.dailyActiveUsers || 0, tone: "text-aqua" },
    { label: "Open Reports", value: reportSummary?.open || 0, tone: "text-coral" },
    { label: "Suspended", value: usersSummary?.suspended || 0, tone: "text-amber-200" },
    { label: "Banned", value: usersSummary?.banned || 0, tone: "text-red-200" },
    { label: "Paid Conversion", value: `${metrics.paidConversionRate || 0}%`, tone: "text-white" },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
            <p className={`mt-2 font-heading text-3xl ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-2xl text-white">Quick Modules</h2>
          <p className="text-xs text-slate-300">Open any control page in one click</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {quickModules.map((item) => (
            <Link key={item.to} to={item.to} className="surface-soft rounded-2xl p-4 transition hover:bg-white/10">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-300">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-lg text-white">Latest Reports</h3>
            <Link to="/admin/reports" className="text-xs font-semibold text-coral transition hover:text-amber-300">
              Open Queue
            </Link>
          </div>
          {reportsLoading ? (
            <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">No active reports.</p>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 6).map((report) => (
                <div key={report.id} className="surface-soft rounded-xl px-3 py-3">
                  <p className="text-sm font-semibold text-white">
                    {report.reporterName} / {report.targetUserName}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{report.reason}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(report.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-lg text-white">Recent Admin Actions</h3>
            <Link to="/admin/audit" className="text-xs font-semibold text-coral transition hover:text-amber-300">
              Full Audit
            </Link>
          </div>
          {auditLoading ? (
            <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">Loading admin actions...</p>
          ) : audit.length === 0 ? (
            <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">No audit entries yet.</p>
          ) : (
            <div className="space-y-2">
              {audit.slice(0, 6).map((entry) => (
                <div key={entry.id} className="surface-soft rounded-xl px-3 py-3 text-xs text-slate-200">
                  <p>
                    {entry.actorName} / <span className="font-semibold">{entry.action}</span> / {entry.targetName}
                  </p>
                  <p className="text-slate-400">{formatDateTime(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default AdminOverviewPage;
