import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime } from "./utils";

const checks = [
  { name: "API gateway", status: "Operational", latency: "86ms" },
  { name: "WebSocket channel", status: "Operational", latency: "42ms" },
  { name: "Notification worker", status: "Operational", latency: "110ms" },
  { name: "Billing callbacks", status: "Operational", latency: "132ms" },
];

function AdminSystemPage() {
  const { analytics, refreshAnalytics } = useAdminOutlet();

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl text-white">System Health Dashboard</h2>
          <button
            onClick={() => refreshAnalytics()}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Refresh Metrics
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <article key={check.name} className="surface-soft rounded-2xl p-3">
              <p className="text-sm font-semibold text-white">{check.name}</p>
              <p className="mt-1 text-xs text-aqua">{check.status}</p>
              <p className="text-xs text-slate-300">Latency: {check.latency}</p>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">Analytics generated at: {formatDateTime(analytics?.generatedAt)}</p>
      </section>
    </div>
  );
}

export default AdminSystemPage;
