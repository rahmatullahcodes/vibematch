import { useState } from "react";
import { useAdminOutlet } from "./useAdminOutlet";

const templateRows = [
  { id: "match_alert", title: "New match alert", channel: "Push + In-App", enabled: true },
  { id: "safety_notice", title: "Safety warning", channel: "Email + In-App", enabled: true },
  { id: "payment_receipt", title: "Payment receipt", channel: "Email", enabled: true },
  { id: "promo_offer", title: "Promotional offer", channel: "Push + Email", enabled: false },
];

function AdminNotificationsPage() {
  const { reportSummary } = useAdminOutlet();
  const [templates, setTemplates] = useState(templateRows);

  const toggleTemplate = (templateId) => {
    setTemplates((previous) =>
      previous.map((item) => (item.id === templateId ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Pending safety alerts</p>
          <p className="mt-2 font-heading text-3xl text-coral">{reportSummary?.open || 0}</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Notification queue</p>
          <p className="mt-2 font-heading text-3xl text-white">Healthy</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Email delivery rate</p>
          <p className="mt-2 font-heading text-3xl text-aqua">98.6%</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Notification Templates</h2>
        <p className="mt-1 text-sm text-slate-300">Enable or disable key communication templates by channel type.</p>
        <div className="mt-4 space-y-2">
          {templates.map((item) => (
            <article key={item.id} className="surface-soft rounded-xl p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300">{item.channel}</p>
                </div>
                <button
                  onClick={() => toggleTemplate(item.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    item.enabled ? "bg-aqua/20 text-aqua" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {item.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminNotificationsPage;
