import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { API_BASE_URL } from "../config/env";
import { useAuth } from "../hooks/useAuth";

function AdminLoginPage() {
  const { user, loading, booting, error, isAuthenticated, login, logout } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");
  const healthUrl = `${API_BASE_URL.replace(/\/+$/, "")}/health`;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLocalError("");
      return;
    }
    if (user.role !== "admin") {
      setLocalError("This account is not authorized for admin console.");
    } else {
      setLocalError("");
    }
  }, [isAuthenticated, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    await login({
      email: form.email,
      password: form.password,
    });
  };

  if (booting) {
    return (
      <div className="mesh-bg bg-slateDeep font-body text-slate-100">
        <div className="grid min-h-screen place-items-center px-4">
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-200">
            <span className="pulse-dot" />
            Checking admin session...
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mesh-bg min-h-screen overflow-x-hidden bg-slateDeep font-body text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="glass-strong animate-rise rounded-3xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Spark Admin</p>
            <h1 className="mt-3 font-heading text-4xl leading-tight text-white sm:text-5xl">Secure Admin Login</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
              Access moderation console, reports queue, and analytics dashboard from a dedicated admin portal.
            </p>

            <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Demo Admin Credentials</p>
              <p className="mt-1">Email: demo@spark.app</p>
              <p>Password: demo1234</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Back to Home
              </Link>
              <Link
                to="/app?tab=dashboard"
                className="rounded-xl border border-aqua/35 bg-aqua/15 px-4 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/25"
              >
                Open User App
              </Link>
            </div>
          </section>

          <section className="glass animate-rise rounded-3xl p-6 [animation-delay:120ms] sm:p-8">
            {isAuthenticated && user?.role !== "admin" ? (
              <div className="space-y-4">
                <p className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {localError}
                </p>
                <button
                  onClick={logout}
                  className="w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  Logout and Retry
                </button>
                <Link
                  to="/app?tab=dashboard"
                  className="block w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Continue to User Workspace
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Admin Credentials</p>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Admin email"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-coral/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-coral to-ember px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Login to Admin"}
                </button>
              </form>
            )}

            {(error || localError) && !isAuthenticated && (
              <div className="mt-4 space-y-2">
                <p className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error || localError}
                </p>
                <p className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-300">
                  API: {API_BASE_URL}
                </p>
                <a
                  href={healthUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[11px] text-aqua transition hover:bg-white/10"
                >
                  Health: {healthUrl}
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
