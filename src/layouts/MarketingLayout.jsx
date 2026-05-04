import { Link, NavLink, Outlet } from "react-router-dom";
import { legalLinks, siteLinks } from "../content/siteContent";

function navLinkClass({ isActive }) {
  return `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
  }`;
}

function MarketingLayout() {
  return (
    <div className="mesh-bg min-h-screen bg-slateDeep font-body text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-4 pb-10 pt-4 sm:pt-5 lg:px-8">
        <header className="glass-strong sticky top-3 z-30 mb-6 rounded-2xl px-4 py-3 md:top-4 md:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-coral to-ember font-heading text-lg font-bold text-white">
                S
              </span>
              <span>
                <span className="block font-heading text-xl font-semibold leading-none text-white">Spark Social</span>
                <span className="mt-1 block text-xs text-slate-300">Dating and social ecosystem</span>
              </span>
            </Link>

            <nav className="scrollbar-hidden flex w-full gap-1 overflow-x-auto whitespace-nowrap pb-1 xl:w-auto xl:justify-center xl:pb-0">
              {siteLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:justify-end">
              <Link
                to="/admin/login"
                className="rounded-xl border border-aqua/35 bg-aqua/15 px-3 py-2 text-center text-[11px] font-semibold text-aqua transition hover:bg-aqua/25 md:px-4 md:text-sm"
              >
                Admin Login
              </Link>
              <Link
                to="/app?tab=auth"
                className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-center text-xs font-semibold text-white shadow-glow transition hover:brightness-110 md:text-sm"
              >
                Login / Sign Up
              </Link>
              <Link
                to="/app"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/20 md:text-sm"
              >
                Open App
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="glass mt-8 overflow-hidden rounded-3xl">
          <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-coral to-ember font-heading text-lg font-bold text-white">
                  S
                </span>
                <div>
                  <p className="font-heading text-xl text-white">Spark Social</p>
                  <p className="text-xs text-slate-300">Intentional Dating Platform</p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Discover meaningful people, build trust through authentic profiles, and move from match to real
                conversations faster.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-aqua/35 bg-aqua/15 px-3 py-1 text-[11px] font-semibold text-aqua">
                  Verified Profiles
                </span>
                <span className="rounded-full border border-coral/35 bg-coral/15 px-3 py-1 text-[11px] font-semibold text-coral">
                  Safe Messaging
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                  Smart Matching
                </span>
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Explore</p>
              <div className="mt-3 grid gap-2">
                {siteLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="rounded-lg px-2 py-1 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Legal</p>
              <div className="mt-3 grid gap-2">
                {legalLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="rounded-lg px-2 py-1 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Support</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p className="surface-soft rounded-xl px-3 py-2">hello@sparksocial.app</p>
                <p className="surface-soft rounded-xl px-3 py-2">Mon-Sat / 9 AM - 8 PM</p>
                <Link
                  to="/contact"
                  className="inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Contact Team
                </Link>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 bg-black/15 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>Copyright {new Date().getFullYear()} Spark Social. All rights reserved.</p>
            <p>Built for safe, authentic, and meaningful relationships.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MarketingLayout;
