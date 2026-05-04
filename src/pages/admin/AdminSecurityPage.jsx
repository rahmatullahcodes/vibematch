import { useState } from "react";

function AdminSecurityPage() {
  const [policies, setPolicies] = useState({
    force2fa: true,
    singleSession: false,
    geoLock: false,
    strictPassword: true,
  });

  const togglePolicy = (key) => {
    setPolicies((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">2FA coverage</p>
          <p className="mt-2 font-heading text-3xl text-aqua">100%</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Active admin sessions</p>
          <p className="mt-2 font-heading text-3xl text-white">3</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Failed login attempts (24h)</p>
          <p className="mt-2 font-heading text-3xl text-coral">4</p>
        </article>
        <article className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400">Security status</p>
          <p className="mt-2 font-heading text-3xl text-aqua">Healthy</p>
        </article>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="font-heading text-xl text-white">Admin Security Policies</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
            Force 2FA for admins
            <input type="checkbox" checked={policies.force2fa} onChange={() => togglePolicy("force2fa")} />
          </label>
          <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
            Single session mode
            <input type="checkbox" checked={policies.singleSession} onChange={() => togglePolicy("singleSession")} />
          </label>
          <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
            Geo-location lock
            <input type="checkbox" checked={policies.geoLock} onChange={() => togglePolicy("geoLock")} />
          </label>
          <label className="surface-soft flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white">
            Strict password policy
            <input type="checkbox" checked={policies.strictPassword} onChange={() => togglePolicy("strictPassword")} />
          </label>
        </div>
      </section>
    </div>
  );
}

export default AdminSecurityPage;
