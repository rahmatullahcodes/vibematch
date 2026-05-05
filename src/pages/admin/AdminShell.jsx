import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminPanel } from "../../hooks/useAdminPanel";
import { useAuth } from "../../hooks/useAuth";
import { adminNavItems } from "./adminNav";

function navClass({ isActive }) {
  return `group flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
    isActive
      ? "border-white/20 bg-white/12 text-white shadow-lg shadow-black/20"
      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white"
  }`;
}

function mobileNavClass({ isActive }) {
  return `min-w-[84px] rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
    isActive ? "bg-coral text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
  }`;
}

function AdminShell() {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user, token, booting, error: authError, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    reports,
    reportSummary,
    users,
    usersSummary,
    userStatusFilter,
    setUserStatusFilter,
    userSearchQuery,
    setUserSearchQuery,
    audit,
    analytics,
    statusFilter,
    setStatusFilter,
    loading,
    reportsLoading,
    usersLoading,
    auditLoading,
    analyticsLoading,
    actionLoading,
    error,
    refreshReports,
    refreshUsers,
    refreshAudit,
    refreshAnalytics,
    resolveReport,
    updateUserStatus,
  } = useAdminPanel(token, isAuthenticated, isAdmin, true);

  const currentNav = useMemo(() => {
    const sorted = [...adminNavItems].sort((first, second) => second.path.length - first.path.length);
    return (
      sorted.find(
        (item) =>
          location.pathname === item.path ||
          (item.path !== "/admin" && location.pathname.startsWith(`${item.path}/`)),
      ) || adminNavItems[0]
    );
  }, [location.pathname]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshReports(),
      refreshUsers({ background: true, query: userSearchQuery, status: userStatusFilter }),
      refreshAudit({ background: true }),
      refreshAnalytics({ background: true }),
    ]);
  }, [refreshAnalytics, refreshAudit, refreshReports, refreshUsers, userSearchQuery, userStatusFilter]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin,
      logout,
      authError,
      reports,
      reportSummary,
      users,
      usersSummary,
      userStatusFilter,
      setUserStatusFilter,
      userSearchQuery,
      setUserSearchQuery,
      audit,
      analytics,
      statusFilter,
      setStatusFilter,
      loading,
      reportsLoading,
      usersLoading,
      auditLoading,
      analyticsLoading,
      actionLoading,
      error,
      refreshReports,
      refreshUsers,
      refreshAudit,
      refreshAnalytics,
      refreshAll,
      resolveReport,
      updateUserStatus,
    }),
    [
      actionLoading,
      analytics,
      audit,
      authError,
      error,
      isAdmin,
      isAuthenticated,
      loading,
      reportsLoading,
      usersLoading,
      auditLoading,
      analyticsLoading,
      logout,
      refreshAll,
      refreshAnalytics,
      refreshAudit,
      refreshReports,
      refreshUsers,
      reportSummary,
      reports,
      resolveReport,
      setStatusFilter,
      setUserSearchQuery,
      setUserStatusFilter,
      statusFilter,
      token,
      updateUserStatus,
      user,
      userSearchQuery,
      userStatusFilter,
      users,
      usersSummary,
    ],
  );

  if (booting) {
    return (
      <div className="mesh-bg bg-slateDeep font-body text-slate-100">
        <div className="grid min-h-screen place-items-center px-4">
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-200">
            <span className="pulse-dot" />
            Opening admin console...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="mesh-bg min-h-screen bg-slateDeep font-body text-slate-100">
        <div className="mx-auto grid min-h-screen w-full max-w-xl place-items-center px-4 py-10">
          <section className="glass-strong w-full rounded-3xl p-6 text-center">
            <h1 className="font-heading text-3xl text-white">Admin Access Required</h1>
            <p className="mt-3 text-sm text-slate-300">This account is not authorized for Spark admin workspace.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                onClick={logout}
                className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
              <Link
                to="/app?tab=dashboard"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                User Workspace
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen overflow-x-hidden bg-slateDeep font-body text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1480px] gap-4 px-3 pb-28 pt-4 sm:px-4 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-16">
        <aside className="glass-strong hidden w-[300px] shrink-0 animate-rise flex-col justify-between rounded-3xl p-5 lg:flex">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-coral to-ember text-lg font-bold shadow-glow">
                A
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold leading-none">Admin Panel</p>
                <p className="mt-1 text-xs text-slate-300">Control + governance center</p>
              </div>
            </div>

            <div className="surface-soft mb-5 rounded-xl px-3 py-3 text-xs text-slate-200">
              <p>Logged in as</p>
              <p className="mt-1 text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
            </div>

            <nav className="space-y-1.5">
              {adminNavItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.path === "/admin"} className={navClass}>
                  <span className="h-2 w-2 rounded-full bg-aqua/80" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-2">
            <Link
              to="/app?tab=dashboard"
              className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open User App
            </Link>
            <button
              onClick={logout}
              className="w-full rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              Logout Admin
            </button>
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <header className="glass-strong mb-6 animate-rise rounded-3xl p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Spark Admin Workspace</p>
                <h1 className="mt-1 font-heading text-2xl font-semibold text-white md:text-3xl">{currentNav.label}</h1>
                <p className="mt-1 text-sm text-slate-300">Professional moderation, analytics, payments, and platform operations.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen((previous) => !previous)}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 lg:hidden"
                  aria-expanded={isMobileNavOpen}
                  aria-label="Toggle admin navigation"
                >
                  {isMobileNavOpen ? "Close Menu" : "Open Menu"}
                </button>
                <button
                  onClick={refreshAll}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Refresh All
                </button>
                <Link
                  to="/admin/login"
                  className="rounded-xl border border-aqua/30 bg-aqua/15 px-3 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/25"
                >
                  Admin Auth
                </Link>
              </div>
            </div>
          </header>

          <Outlet context={contextValue} />
        </main>
      </div>

      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          role="presentation"
        >
          <aside
            className="glass-strong absolute inset-x-3 top-3 max-h-[82vh] overflow-y-auto rounded-3xl p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-lg text-white">Admin Menu</p>
                <p className="text-xs text-slate-300">{user?.name || "Admin"}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <nav className="space-y-2">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={navClass}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span className="h-2 w-2 rounded-full bg-aqua/80" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link
                to="/app?tab=dashboard"
                onClick={() => setIsMobileNavOpen(false)}
                className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Open User App
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileNavOpen(false);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                Logout Admin
              </button>
            </div>
          </aside>
        </div>
      )}

      <nav className="glass fixed inset-x-2 bottom-2 z-20 mx-auto overflow-x-auto rounded-2xl px-2 py-2 scrollbar-hidden sm:inset-x-4 sm:bottom-4 sm:px-3 lg:hidden">
        <div className="flex min-w-max items-center gap-2">
          {adminNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === "/admin"} className={mobileNavClass}>
              <span className="block leading-tight">{item.shortLabel}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AdminShell;
