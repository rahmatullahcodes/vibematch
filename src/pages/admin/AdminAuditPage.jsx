import { useAdminOutlet } from "./useAdminOutlet";
import { formatDateTime } from "./utils";

function AdminAuditPage() {
  const { audit, refreshAudit, auditLoading } = useAdminOutlet();

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl text-white">Moderation Audit Trail</h2>
          <button
            onClick={() => refreshAudit()}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Refresh Audit
          </button>
        </div>

        {auditLoading ? (
          <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">Loading audit entries...</p>
        ) : audit.length === 0 ? (
          <p className="surface-soft rounded-xl px-3 py-3 text-sm text-slate-300">No moderation actions yet.</p>
        ) : (
          <div className="space-y-2">
            {audit.slice(0, 120).map((entry) => (
              <article key={entry.id} className="surface-soft rounded-xl p-3 text-xs text-slate-200">
                <p>
                  {entry.actorName} performed <span className="font-semibold text-white">{entry.action}</span> on{" "}
                  <span className="font-semibold text-white">{entry.targetName || "Unknown target"}</span>
                </p>
                {entry.note && <p className="mt-1 text-slate-300">Note: {entry.note}</p>}
                <p className="mt-1 text-slate-400">{formatDateTime(entry.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminAuditPage;
