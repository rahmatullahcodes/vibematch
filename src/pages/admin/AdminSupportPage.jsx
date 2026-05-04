import { useState } from "react";
import { formatDateTime } from "./utils";

const seedTickets = [
  {
    id: "tkt_101",
    user: "anaya@spark.app",
    issue: "Unable to verify phone number",
    priority: "high",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "tkt_102",
    user: "riya@spark.app",
    issue: "Premium renewal payment failed",
    priority: "medium",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
  {
    id: "tkt_103",
    user: "dev@spark.app",
    issue: "Chat history not syncing",
    priority: "low",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

function AdminSupportPage() {
  const [tickets, setTickets] = useState(seedTickets);

  const markResolved = (ticketId) => {
    setTickets((previous) =>
      previous.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: "resolved" } : ticket)),
    );
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Support Ticket Queue</h2>
        <p className="mt-1 text-sm text-slate-300">Manage user issues for account, billing, and communication flows.</p>
        <div className="mt-4 space-y-2">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="surface-soft rounded-xl p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{ticket.issue}</p>
                  <p className="text-xs text-slate-300">{ticket.user}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Priority: {ticket.priority} / Status: {ticket.status} / {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
                {ticket.status !== "resolved" && (
                  <button
                    onClick={() => markResolved(ticket.id)}
                    className="rounded-lg border border-aqua/35 bg-aqua/15 px-3 py-1.5 text-xs font-semibold text-aqua"
                  >
                    Mark Resolved
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

export default AdminSupportPage;
