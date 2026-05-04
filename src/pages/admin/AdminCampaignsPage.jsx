import { useState } from "react";
import { formatDateTime } from "./utils";

const initialCampaigns = [
  {
    id: "cmp_1",
    title: "Weekend Match Boost",
    audience: "All active users",
    status: "scheduled",
    startsAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
  },
  {
    id: "cmp_2",
    title: "Premium Upgrade Offer",
    audience: "Starter plan users",
    status: "live",
    startsAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [form, setForm] = useState({
    title: "",
    audience: "",
  });

  const createCampaign = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    setCampaigns((previous) => [
      {
        id: `cmp_${Date.now()}`,
        title: form.title.trim(),
        audience: form.audience.trim() || "Custom segment",
        status: "draft",
        startsAt: new Date().toISOString(),
      },
      ...previous,
    ]);
    setForm({ title: "", audience: "" });
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Campaign Builder</h2>
        <p className="mt-1 text-sm text-slate-300">Create announcements, promo nudges, and growth campaigns.</p>

        <form onSubmit={createCampaign} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={form.title}
            onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
            placeholder="Campaign title"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-aqua/35 focus:outline-none"
          />
          <input
            value={form.audience}
            onChange={(event) => setForm((previous) => ({ ...previous, audience: event.target.value }))}
            placeholder="Audience segment"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-aqua/35 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Create
          </button>
        </form>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-heading text-lg text-white">Campaign Queue</h3>
        <div className="mt-3 space-y-2">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="surface-soft rounded-xl p-3">
              <p className="text-sm font-semibold text-white">{campaign.title}</p>
              <p className="text-xs text-slate-300">{campaign.audience}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {campaign.status.toUpperCase()} / {formatDateTime(campaign.startsAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminCampaignsPage;
