import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import AdminModerationView from "../components/views/AdminModerationView";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { useAuth } from "../hooks/useAuth";

const adminNavItems = [
  { id: "admin-overview", label: "Overview", shortLabel: "Overview" },
  { id: "admin-control-center", label: "Control Center", shortLabel: "Control" },
  { id: "admin-user-controls", label: "User Controls", shortLabel: "Users" },
  { id: "admin-reports", label: "Reports", shortLabel: "Reports" },
  { id: "admin-audit", label: "Audit Trail", shortLabel: "Audit" },
];

function AdminDashboardPage() {
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
    actionLoading,
    error,
    refreshReports,
    refreshUsers,
    refreshAudit,
    refreshAnalytics,
    resolveReport,
    updateUserStatus,
  } = useAdminPanel(token, isAuthenticated, isAdmin, true);

  const metrics = analytics?.metrics || {};
  const overviewCards = useMemo(
    () => [
      { label: "Daily Active Users", value: metrics.dailyActiveUsers || 0, tone: "text-aqua" },
      { label: "Open Reports", value: reportSummary?.open || 0, tone: "text-coral" },
      { label: "Suspended Users", value: usersSummary?.suspended || 0, tone: "text-amber-200" },
      { label: "Banned Users", value: usersSummary?.banned || 0, tone: "text-red-200" },
      { label: "Match Conversion", value: `${metrics.matchConversionRate || 0}%`, tone: "text-white" },
      { label: "Chat Response", value: `${metrics.chatResponseRate || 0}%`, tone: "text-white" },
    ],
    [
      metrics.chatResponseRate,
      metrics.dailyActiveUsers,
      metrics.matchConversionRate,
      reportSummary?.open,
      usersSummary?.banned,
      usersSummary?.suspended,
    ],
  );

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            <p className="mt-3 text-sm text-slate-300">This account is not authorized to open Spark admin dashboard.</p>
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

      <div className="relative mx-auto flex w-full max-w-[1460px] gap-4 px-3 pb-28 pt-4 sm:px-4 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-16">
        <aside className="glass-strong hidden w-[290px] shrink-0 animate-rise flex-col justify-between rounded-3xl p-5 lg:flex">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-coral to-ember text-lg font-bold shadow-glow">
                A
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold leading-none">Admin Console</p>
                <p className="mt-1 text-xs text-slate-300">Spark moderation + analytics</p>
              </div>
            </div>

            <div className="surface-soft mb-5 rounded-xl px-3 py-3 text-xs text-slate-200">
              <p>Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {adminNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-slate-300 transition hover:border-white/10 hover:bg-white/8 hover:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-aqua/80" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
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
          <header id="admin-overview" className="glass-strong mb-6 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Spark Admin Panel</p>
                <h1 className="mt-2 font-heading text-3xl text-white sm:text-4xl">Moderation Dashboard</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Reports, trust actions, user controls, and analytics in one professional command center.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  to="/app?tab=dashboard"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Open User App
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl bg-gradient-to-r from-coral to-ember px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  Logout Admin
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <article key={card.label} className="surface-soft rounded-2xl p-3">
                  <p className="text-xs text-slate-400">{card.label}</p>
                  <p className={`mt-1 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
                </article>
              ))}
            </div>
          </header>

          <div id="admin-control-center">
            <AdminModerationView
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              loading={loading}
              actionLoading={actionLoading}
              error={error || authError}
              reports={reports}
              reportSummary={reportSummary}
              users={users}
              usersSummary={usersSummary}
              userStatusFilter={userStatusFilter}
              userSearchQuery={userSearchQuery}
              audit={audit}
              analytics={analytics}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onUserStatusFilterChange={setUserStatusFilter}
              onUserSearchChange={setUserSearchQuery}
              onRefresh={async () => {
                await Promise.all([
                  refreshReports(),
                  refreshUsers({ background: true, query: userSearchQuery, status: userStatusFilter }),
                  refreshAudit({ background: true }),
                  refreshAnalytics({ background: true }),
                ]);
              }}
              onRefreshUsers={() => refreshUsers({ query: userSearchQuery, status: userStatusFilter })}
              onResolveReport={resolveReport}
              onUpdateUserStatus={updateUserStatus}
              onOpenAccount={() => {}}
              onLoginRequest={() => {}}
            />
          </div>
        </main>
      </div>

      <nav className="glass fixed inset-x-2 bottom-2 z-20 mx-auto overflow-x-auto rounded-2xl px-2 py-2 scrollbar-hidden sm:inset-x-4 sm:bottom-4 sm:px-3 lg:hidden">
        <div className="flex min-w-max items-center gap-2">
          {adminNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="min-w-[84px] rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span className="block leading-tight">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AdminDashboardPage;
