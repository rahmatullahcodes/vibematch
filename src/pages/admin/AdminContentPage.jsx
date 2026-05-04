import { useMemo } from "react";
import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime } from "./utils";

const contentPolicyChecks = [
  { name: "Adult or explicit media", status: "Enabled", latency: "Auto / <2 sec" },
  { name: "Harassment and hate speech", status: "Enabled", latency: "Auto / <2 sec" },
  { name: "Spam links and phishing", status: "Enabled", latency: "Auto / <1 sec" },
  { name: "Impersonation signals", status: "Review", latency: "Manual queue" },
];

function AdminContentPage() {
  const { reports, refreshReports } = useAdminOutlet();

  const contentReports = useMemo(
    () => reports.filter((report) => ["message", "post", "comment", "reel"].includes((report.kind || "").toLowerCase())),
    [reports],
  );

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl text-white">Content Moderation</h2>
          <button
            onClick={() => refreshReports()}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Refresh Content Flags
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {contentPolicyChecks.map((rule) => (
            <article key={rule.name} className="surface-soft rounded-2xl p-3">
              <p className="text-sm font-semibold text-white">{rule.name}</p>
              <p className="mt-1 text-xs text-slate-300">Status: {rule.status}</p>
              <p className="text-xs text-slate-400">Processing: {rule.latency}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-heading text-lg text-white">Flagged Content Queue</h3>
        {contentReports.length === 0 ? (
          <p className="surface-soft mt-3 rounded-xl px-3 py-3 text-sm text-slate-300">No content reports in queue.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {contentReports.slice(0, 40).map((report) => (
              <article key={report.id} className="surface-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-white">
                  {report.kind} / {report.targetUserName}
                </p>
                <p className="mt-1 text-xs text-slate-300">{report.reason}</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(report.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminContentPage;
