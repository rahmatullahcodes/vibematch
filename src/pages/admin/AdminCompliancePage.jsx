import { useState } from "react";
import { formatDateTime } from "./utils";

const requestsSeed = [
  {
    id: "req_1",
    type: "Data export",
    user: "member1@spark.app",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
  },
  {
    id: "req_2",
    type: "Account deletion",
    user: "member2@spark.app",
    status: "in_review",
    createdAt: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
  },
];

function AdminCompliancePage() {
  const [requests, setRequests] = useState(requestsSeed);

  const markComplete = (requestId) => {
    setRequests((previous) =>
      previous.map((item) => (item.id === requestId ? { ...item, status: "completed" } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Compliance and Data Requests</h2>
        <p className="mt-1 text-sm text-slate-300">Manage export, deletion, and legal data processing requests.</p>

        <div className="mt-4 space-y-2">
          {requests.map((item) => (
            <article key={item.id} className="surface-soft rounded-xl p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.type}</p>
                  <p className="text-xs text-slate-300">{item.user}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.status.toUpperCase()} / {formatDateTime(item.createdAt)}
                  </p>
                </div>
                {item.status !== "completed" && (
                  <button
                    onClick={() => markComplete(item.id)}
                    className="rounded-lg border border-aqua/35 bg-aqua/15 px-3 py-1.5 text-xs font-semibold text-aqua"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminCompliancePage;
