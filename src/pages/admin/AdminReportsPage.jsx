import Icon from "../../components/Icon";
import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime, statusTone } from "./utils";

const reportActionIcons = {
  refresh: "M4.5 4.5v5h5M19.5 19.5v-5h-5M19 9a7 7 0 0 0-12-2M5 15a7 7 0 0 0 12 2",
  review: "M12 17v.01M12 13a2.5 2.5 0 1 0-2-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  warn: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  suspend: "M10 6v12M14 6v12",
  ban: "M6 6l12 12M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  dismiss: "M6 6l12 12M18 6L6 18",
};

function AdminReportsPage() {
  const {
    reports,
    reportSummary,
    statusFilter,
    setStatusFilter,
    reportsLoading,
    actionLoading,
    resolveReport,
    refreshReports,
  } = useAdminOutlet();

  const statuses = ["all", "open", "under_review", "resolved", "dismissed"];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Total</p>
          <p className="mt-2 font-heading text-3xl text-white">{reportSummary?.total || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Open</p>
          <p className="mt-2 font-heading text-3xl text-coral">{reportSummary?.open || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Under Review</p>
          <p className="mt-2 font-heading text-3xl text-amber-200">{reportSummary?.underReview || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Resolved</p>
          <p className="mt-2 font-heading text-3xl text-aqua">{reportSummary?.resolved || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Dismissed</p>
          <p className="mt-2 font-heading text-3xl text-slate-200">{reportSummary?.dismissed || 0}</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl text-white">Reports Queue</h2>
          <button
            onClick={() => refreshReports()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <Icon path={reportActionIcons.refresh} className="h-4 w-4" />
            Refresh Reports
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold ${
                statusFilter === status ? "border-aqua/35 bg-aqua/20 text-aqua" : "border-white/20 bg-white/10 text-slate-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {reportsLoading ? (
          <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">Loading report queue...</p>
        ) : reports.length === 0 ? (
          <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">No reports found in this state.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article key={report.id} className="surface-soft rounded-2xl p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone(report.status)}`}>
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
                    <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(report.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => resolveReport({ reportId: report.id, action: "review" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-200 disabled:opacity-60"
                    >
                      <Icon path={reportActionIcons.review} className="h-3.5 w-3.5" />
                      Review
                    </button>
                    <button
                      onClick={() => resolveReport({ reportId: report.id, action: "warn", note: "Policy warning issued" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-300/10 px-2 py-1 text-[11px] text-amber-200 disabled:opacity-60"
                    >
                      <Icon path={reportActionIcons.warn} className="h-3.5 w-3.5" />
                      Warn
                    </button>
                    <button
                      onClick={() =>
                        resolveReport({
                          reportId: report.id,
                          action: "suspend",
                          note: "Suspended for policy violation",
                          suspendHours: 24,
                        })
                      }
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-400/35 bg-red-500/10 px-2 py-1 text-[11px] text-red-100 disabled:opacity-60"
                    >
                      <Icon path={reportActionIcons.suspend} className="h-3.5 w-3.5" />
                      Suspend
                    </button>
                    <button
                      onClick={() => resolveReport({ reportId: report.id, action: "ban", note: "Severe violation" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-600/20 px-2 py-1 text-[11px] text-red-100 disabled:opacity-60"
                    >
                      <Icon path={reportActionIcons.ban} className="h-3.5 w-3.5" />
                      Ban
                    </button>
                    <button
                      onClick={() => resolveReport({ reportId: report.id, action: "dismiss", note: "No violation found" })}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-slate-300 disabled:opacity-60"
                    >
                      <Icon path={reportActionIcons.dismiss} className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminReportsPage;
