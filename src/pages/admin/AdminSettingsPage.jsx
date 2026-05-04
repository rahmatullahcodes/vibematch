import { useState } from "react";

function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newSignups: true,
    reelUploads: true,
    strictModeration: true,
    region: "India",
    supportEmail: "hello@sparksocial.app",
  });
  const [notice, setNotice] = useState("");

  const updateFlag = (key) => {
    setSettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setNotice("Platform settings saved successfully.");
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Platform Settings</h2>
        <p className="mt-1 text-sm text-slate-300">Global controls for onboarding, moderation strictness, and operations.</p>

        <form onSubmit={saveSettings} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
              Maintenance mode
              <input type="checkbox" checked={settings.maintenanceMode} onChange={() => updateFlag("maintenanceMode")} />
            </label>
            <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
              Allow new signups
              <input type="checkbox" checked={settings.newSignups} onChange={() => updateFlag("newSignups")} />
            </label>
            <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
              Reel uploads
              <input type="checkbox" checked={settings.reelUploads} onChange={() => updateFlag("reelUploads")} />
            </label>
            <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
              Strict moderation
              <input type="checkbox" checked={settings.strictModeration} onChange={() => updateFlag("strictModeration")} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={settings.region}
              onChange={(event) => setSettings((previous) => ({ ...previous, region: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-aqua/35 focus:outline-none"
              placeholder="Default region"
            />
            <input
              value={settings.supportEmail}
              onChange={(event) => setSettings((previous) => ({ ...previous, supportEmail: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-aqua/35 focus:outline-none"
              placeholder="Support email"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Save Settings
          </button>
        </form>

        {notice && <p className="mt-3 rounded-xl border border-aqua/35 bg-aqua/10 px-3 py-2 text-sm text-aqua">{notice}</p>}
      </section>
    </div>
  );
}

export default AdminSettingsPage;
