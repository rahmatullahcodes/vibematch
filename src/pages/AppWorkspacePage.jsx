import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import AuthView from "../components/views/AuthView";
import AdminModerationView from "../components/views/AdminModerationView";
import CallsView from "../components/views/CallsView";
import ChatView from "../components/views/ChatView";
import DashboardView from "../components/views/DashboardView";
import DiscoverView from "../components/views/DiscoverView";
import NotificationsView from "../components/views/NotificationsView";
import PremiumView from "../components/views/PremiumView";
import SwipeView from "../components/views/SwipeView";
import { useAdminPanel } from "../hooks/useAdminPanel";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useCalls } from "../hooks/useCalls";
import { useDiscover } from "../hooks/useDiscover";
import { useNotifications } from "../hooks/useNotifications";
import { useSubscription } from "../hooks/useSubscription";
import { useSwipe } from "../hooks/useSwipe";

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Dash",
    adminOnly: false,
    icon: "M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z",
  },
  {
    key: "discover",
    label: "Discover",
    shortLabel: "Home",
    adminOnly: false,
    icon: "M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V11z",
  },
  {
    key: "swipe",
    label: "Swipe",
    shortLabel: "Swipe",
    adminOnly: false,
    icon: "M8 12l2 2 4-4m-2 11s-7.5-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2 4.5-9.5 9-9.5 9z",
  },
  {
    key: "chat",
    label: "Messages",
    shortLabel: "Inbox",
    adminOnly: false,
    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  },
  {
    key: "calls",
    label: "Calls",
    shortLabel: "Calls",
    adminOnly: false,
    icon: "M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.08 4.18 2 2 0 014 2h3a2 2 0 012 1.72c.12.89.32 1.75.59 2.57a2 2 0 01-.45 2.11L8.1 9.91a16 16 0 006 6l1.51-1.04a2 2 0 012.11-.45c.82.27 1.68.47 2.57.59A2 2 0 0122 16.92z",
  },
  {
    key: "notifications",
    label: "Alerts",
    shortLabel: "Alerts",
    adminOnly: false,
    icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m3 0v1a2 2 0 11-4 0v-1h4z",
  },
  {
    key: "premium",
    label: "Premium",
    shortLabel: "Pro",
    adminOnly: false,
    icon: "M4 7l3 7h10l3-7-5 3-3-4-3 4-5-3zM6 18h12",
  },
  {
    key: "moderation",
    label: "Moderation",
    shortLabel: "Admin",
    adminOnly: true,
    icon: "M12 3l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V7l8-4zm0 5a2 2 0 100 4 2 2 0 000-4zm0 5.5c-1.9 0-3.7.8-4.9 2.1h9.8A6.5 6.5 0 0012 13.5z",
  },
  {
    key: "auth",
    label: "Account",
    shortLabel: "Account",
    adminOnly: false,
    icon: "M12 12a5 5 0 100-10 5 5 0 000 10zm-8 9a8 8 0 0116 0",
  },
];

const viewMeta = {
  dashboard: {
    title: "Workspace Dashboard",
    subtitle: "Your growth, conversations, and account controls in one command center",
  },
  discover: {
    title: "Discover Feed",
    subtitle: "Find stories, posts, and curated people around you",
  },
  swipe: {
    title: "Swipe Studio",
    subtitle: "Fast profile decisions with live compatibility signals",
  },
  chat: {
    title: "Message Hub",
    subtitle: "Plan dates and keep conversations flowing",
  },
  calls: {
    title: "Call Lounge",
    subtitle: "Voice and video introductions with matched contacts",
  },
  notifications: {
    title: "Notification Center",
    subtitle: "Real-time alerts for matches, messages, billing, and safety",
  },
  premium: {
    title: "Premium Control",
    subtitle: "Manage plans, visibility tools, and upgrade insights",
  },
  moderation: {
    title: "Moderation + Analytics",
    subtitle: "Reports queue, trust actions, and performance metrics",
  },
  auth: {
    title: "Account Center",
    subtitle: "Login, signup, and profile access management",
  },
};

const workspaceFooterLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

function AppWorkspacePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedMode = searchParams.get("mode");
  const [activeView, setActiveView] = useState("discover");

  const {
    user,
    token,
    loading: authLoading,
    booting,
    error: authError,
    isAuthenticated,
    login,
    register,
    logout,
    syncUser,
    updateProfile,
    completeVerification,
  } = useAuth();
  const isAdmin = user?.role === "admin";
  const availableNavItems = useMemo(
    () => navItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin],
  );
  const resolvedRequestedView = useMemo(() => {
    if (!requestedTab) {
      return "discover";
    }
    const isKnownTab = navItems.some((item) => item.key === requestedTab);
    if (!isKnownTab) {
      return "discover";
    }

    if (requestedTab === "moderation") {
      return "moderation";
    }

    return availableNavItems.some((item) => item.key === requestedTab) ? requestedTab : "discover";
  }, [availableNavItems, requestedTab]);

  const {
    feed,
    loading: discoverLoading,
    error: discoverError,
    interactionLoading: discoverInteractionLoading,
    searchState: discoverSearchState,
    searchLoading: discoverSearchLoading,
    refreshFeed,
    toggleFollowAuthor,
    togglePostLike,
    addPostComment,
    sharePost,
    addReelComment,
    shareReel,
    runSearch,
    refreshRecommendations,
    refreshReels,
  } = useDiscover(token);

  const {
    currentProfile,
    stats,
    loading: swipeLoading,
    actionLoading,
    error: swipeError,
    lastAction,
    lastMatchName,
    sendAction,
    filters,
    updateFilters,
    resetFilters,
    filterOptions,
    filteredCount,
    totalCount,
    isCurrentProfileMatched,
  } = useSwipe(token, isAuthenticated);

  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    activeThread,
    messages,
    threadsLoading,
    blockedUsers,
    blockedLoading,
    messagesLoading,
    sendLoading,
    isPeerTyping,
    error: chatError,
    loadThreads,
    loadBlockedUsers,
    sendMessage,
    sendTyping,
    markThreadRead,
    toggleMessageReaction,
    deleteMessage,
    reportMessage,
    reportUser,
    blockUser,
    unblockUser,
    unmatchUser,
  } = useChat(token, isAuthenticated, activeView === "chat");

  const {
    activeSession: activeCallSession,
    contacts: callContacts,
    recentSessions: recentCalls,
    hasIncomingCall,
    localStream: localCallStream,
    remoteStream: remoteCallStream,
    micMuted: isCallMicMuted,
    cameraOff: isCallCameraOff,
    mediaReady: isCallMediaReady,
    loading: callsLoading,
    actionLoading: callsActionLoading,
    error: callsError,
    loadDashboard: refreshCalls,
    startCall,
    respondToCall,
    toggleMic: toggleCallMic,
    toggleCamera: toggleCallCamera,
  } = useCalls(token, isAuthenticated, activeView === "calls");

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    readAllLoading,
    actionLoading: notificationActionLoading,
    error: notificationsError,
    refreshNotifications,
    markRead,
    markAllRead,
    queuedEmailCount,
    preferences: notificationPreferences,
    browserPermission,
    preferencesLoading: notificationPreferencesLoading,
    updatePreference,
    requestBrowserPermission,
  } = useNotifications(token, isAuthenticated, activeView === "notifications");

  const {
    reports: moderationReports,
    reportSummary,
    users: moderationUsers,
    usersSummary: moderationUsersSummary,
    userStatusFilter: moderationUserStatusFilter,
    setUserStatusFilter: setModerationUserStatusFilter,
    userSearchQuery: moderationUserSearchQuery,
    setUserSearchQuery: setModerationUserSearchQuery,
    audit: moderationAudit,
    analytics,
    statusFilter: moderationStatusFilter,
    setStatusFilter: setModerationStatusFilter,
    loading: moderationLoading,
    actionLoading: moderationActionLoading,
    error: moderationError,
    refreshReports: refreshModerationReports,
    refreshUsers: refreshModerationUsers,
    refreshAudit: refreshModerationAudit,
    refreshAnalytics,
    resolveReport: resolveModerationReport,
    updateUserStatus: updateModerationUserStatus,
  } = useAdminPanel(token, isAuthenticated, isAdmin, activeView === "moderation" || activeView === "dashboard");

  const {
    subscription,
    currentPlanMeta,
    loading: subscriptionLoading,
    actionLoading: subscriptionActionLoading,
    checkoutLoading: subscriptionCheckoutLoading,
    confirmLoading: subscriptionConfirmLoading,
    error: subscriptionError,
    refreshSubscription,
    changePlan,
    confirmCheckout,
    closeCheckout,
  } = useSubscription(token, isAuthenticated, user, syncUser);

  useEffect(() => {
    setActiveView((previous) => {
      if (requestedTab && resolvedRequestedView !== previous) {
        return resolvedRequestedView;
      }
      if (!availableNavItems.some((item) => item.key === previous)) {
        return resolvedRequestedView;
      }
      return previous;
    });
  }, [availableNavItems, requestedTab, resolvedRequestedView]);

  const handleSwipeAction = useCallback(
    async (action) => {
      const response = await sendAction(action);
      if (response?.matched) {
        await loadThreads();
      }
      return response;
    },
    [loadThreads, sendAction],
  );

  const activeMeta = useMemo(() => viewMeta[activeView] ?? viewMeta.discover, [activeView]);
  const authDefaultMode = useMemo(
    () => (requestedMode === "admin" || requestedMode === "login" ? "login" : "signup"),
    [requestedMode],
  );
  const userInitial = useMemo(() => {
    const firstLetter = user?.name?.trim()?.charAt(0)?.toUpperCase();
    return firstLetter || "G";
  }, [user?.name]);

  const openAuthView = useCallback(
    (mode = "signup") => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set("tab", "auth");
        if (mode === "admin" || mode === "login") {
          next.set("mode", mode);
        } else {
          next.delete("mode");
        }
        return next;
      });
      setActiveView("auth");
    },
    [setSearchParams],
  );

  const openAdminLogin = useCallback(() => {
    navigate("/admin/login");
  }, [navigate]);

  if (booting) {
    return (
      <div className="mesh-bg bg-slateDeep font-body text-slate-100">
        <div className="grid min-h-screen place-items-center px-4">
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-200">
            <span className="pulse-dot" />
            Preparing your social space...
          </div>
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

      <div className="relative mx-auto flex w-full max-w-[1460px] gap-4 px-3 pb-28 pt-4 sm:px-4 sm:pt-6 lg:gap-6 lg:px-8 lg:pb-24">
        <aside className="glass-strong hidden w-[300px] shrink-0 animate-rise flex-col justify-between rounded-3xl p-5 lg:flex">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-coral to-ember text-lg font-bold shadow-glow">
                S
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold leading-none">Spark Social</p>
                <p className="mt-1 text-xs text-slate-300">Dating and social ecosystem</p>
              </div>
            </div>

            <div className="surface-soft mb-5 flex items-center gap-3 rounded-xl px-3 py-3 text-xs text-slate-200">
              <span className="status-dot" />
              {isAuthenticated ? `Signed in as ${user?.name}` : "Guest mode enabled"}
            </div>

            <nav className="space-y-2">
              {availableNavItems.map((item) => {
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-white/20 bg-white/12 text-white shadow-lg shadow-black/20"
                        : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`${isActive ? "text-coral" : "text-slate-400 group-hover:text-coral"}`}>
                      <Icon path={item.icon} />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.key === "notifications" && unreadCount > 0 && (
                      <span className="ml-auto rounded-full border border-coral/30 bg-coral/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/30 to-amber-400/10 p-4">
            <p className="font-heading text-base text-white">Environment Setup</p>
            <p className="mt-1 text-xs text-slate-100/90">Switch to production backend using:</p>
            <div className="mt-3 grid gap-2">
              <span className="rounded-md border border-white/25 bg-black/20 px-2 py-1 font-mono text-[10px] text-slate-100">
                VITE_API_BASE_URL
              </span>
              <span className="rounded-md border border-white/25 bg-black/20 px-2 py-1 font-mono text-[10px] text-slate-100">
                VITE_USE_MOCK_API
              </span>
            </div>
            <button
              onClick={() => openAuthView(isAuthenticated ? "login" : "signup")}
              className="mt-4 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              {isAuthenticated ? "Manage Account" : "Login / Sign Up"}
            </button>
            {!isAuthenticated && (
              <button
                onClick={openAdminLogin}
                className="mt-2 w-full rounded-xl border border-aqua/30 bg-aqua/15 px-4 py-2 text-sm font-semibold text-aqua transition hover:bg-aqua/25"
              >
                Admin Login
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Logout
              </button>
            )}
          </div>
        </aside>

        <main className="min-w-0 w-full flex-1">
          <header className="glass mb-6 animate-rise rounded-3xl p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Spark Workspace</p>
                <h1 className="mt-1 font-heading text-2xl font-semibold text-white md:text-3xl">{activeMeta.title}</h1>
                <p className="mt-1 text-sm text-slate-300">{activeMeta.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {activeView === "discover" && (
                  <button
                    onClick={refreshFeed}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/10 sm:px-4"
                  >
                    Refresh Feed
                  </button>
                )}
                {activeView === "moderation" && !isAuthenticated && (
                  <button
                    onClick={openAdminLogin}
                    className="rounded-xl border border-aqua/30 bg-aqua/15 px-3 py-2 text-xs font-semibold text-aqua transition hover:bg-aqua/25 sm:px-4"
                  >
                    Admin Login
                  </button>
                )}

                <button
                  onClick={() => openAuthView(isAuthenticated ? "login" : "signup")}
                  className="surface-soft flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-left"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-coral to-amber-400 text-xs font-bold text-white">
                    {userInitial}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-xs text-slate-300">Profile</span>
                    <span className="block text-sm font-semibold text-white">
                      {isAuthenticated ? user?.name : "Guest User"}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </header>

          {hasIncomingCall && activeView !== "calls" && (
            <section className="mb-6 rounded-2xl border border-coral/40 bg-coral/15 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-white">
                  Incoming {activeCallSession?.type === "video" ? "video" : "voice"} call from{" "}
                  {activeCallSession?.peerName || "a match"}.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveView("calls")}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Open Calls
                  </button>
                  <button
                    onClick={() => activeCallSession?.id && respondToCall(activeCallSession.id, "decline")}
                    disabled={!activeCallSession?.id}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeView === "discover" && (
            <DiscoverView
              feed={feed}
              loading={discoverLoading}
              error={discoverError}
              searchState={discoverSearchState}
              searchLoading={discoverSearchLoading}
              onRefresh={refreshFeed}
              onOpenSwipe={() => setActiveView("swipe")}
              onOpenAuth={() => openAuthView("signup")}
              onToggleFollow={toggleFollowAuthor}
              onToggleLike={togglePostLike}
              onAddPostComment={addPostComment}
              onSharePost={sharePost}
              onAddReelComment={addReelComment}
              onShareReel={shareReel}
              onSearch={runSearch}
              onRefreshRecommendations={refreshRecommendations}
              onRefreshReels={refreshReels}
              interactionLoading={discoverInteractionLoading}
              isAuthenticated={isAuthenticated}
            />
          )}

          {activeView === "dashboard" && (
            <DashboardView
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              user={user}
              unreadCount={unreadCount}
              swipeStats={stats}
              threads={threads}
              activeCallSession={activeCallSession}
              currentPlanMeta={currentPlanMeta}
              reportSummary={reportSummary}
              onOpenTab={setActiveView}
              onLoginRequest={() => openAuthView("login")}
            />
          )}

          {activeView === "swipe" && (
            <SwipeView
              currentProfile={currentProfile}
              stats={stats}
              loading={swipeLoading}
              actionLoading={actionLoading}
              error={swipeError}
              lastAction={lastAction}
              lastMatchName={lastMatchName}
              onAction={handleSwipeAction}
              onLoginRequest={() => openAuthView("signup")}
              onOpenChat={() => setActiveView("chat")}
              isAuthenticated={isAuthenticated}
              filters={filters}
              updateFilters={updateFilters}
              resetFilters={resetFilters}
              filterOptions={filterOptions}
              filteredCount={filteredCount}
              totalCount={totalCount}
              isCurrentProfileMatched={isCurrentProfileMatched}
            />
          )}

          {activeView === "chat" && (
            <ChatView
              threads={threads}
              activeThreadId={activeThreadId}
              setActiveThreadId={setActiveThreadId}
              activeThread={activeThread}
              messages={messages}
              threadsLoading={threadsLoading}
              messagesLoading={messagesLoading}
              sendLoading={sendLoading}
              isPeerTyping={isPeerTyping}
              error={chatError}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              onRefresh={loadThreads}
              onMarkThreadRead={markThreadRead}
              onReactMessage={toggleMessageReaction}
              onDeleteMessage={deleteMessage}
              onReportMessage={reportMessage}
              onReportUser={reportUser}
              onBlockUser={blockUser}
              onUnmatchUser={unmatchUser}
              onStartVoiceCall={(peerUserId) => startCall(peerUserId, "voice")}
              onStartVideoCall={(peerUserId) => startCall(peerUserId, "video")}
              onLoginRequest={() => openAuthView("signup")}
              isAuthenticated={isAuthenticated}
            />
          )}

          {activeView === "calls" && (
            <CallsView
              activeSession={activeCallSession}
              contacts={callContacts}
              recentSessions={recentCalls}
              localStream={localCallStream}
              remoteStream={remoteCallStream}
              micMuted={isCallMicMuted}
              cameraOff={isCallCameraOff}
              mediaReady={isCallMediaReady}
              loading={callsLoading}
              actionLoading={callsActionLoading}
              error={callsError}
              onRefresh={refreshCalls}
              onStartCall={startCall}
              onRespondToCall={respondToCall}
              onToggleMic={toggleCallMic}
              onToggleCamera={toggleCallCamera}
              onLoginRequest={() => openAuthView("signup")}
              isAuthenticated={isAuthenticated}
            />
          )}

          {activeView === "notifications" && (
            <NotificationsView
              notifications={notifications}
              unreadCount={unreadCount}
              queuedEmailCount={queuedEmailCount}
              preferences={notificationPreferences}
              browserPermission={browserPermission}
              loading={notificationsLoading}
              readAllLoading={readAllLoading}
              preferencesLoading={notificationPreferencesLoading}
              actionLoading={notificationActionLoading}
              error={notificationsError}
              onRefresh={refreshNotifications}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onOpenTab={setActiveView}
              onUpdatePreference={updatePreference}
              onRequestBrowserPermission={requestBrowserPermission}
              isAuthenticated={isAuthenticated}
              onLoginRequest={() => openAuthView("signup")}
            />
          )}

          {activeView === "moderation" && (
            <AdminModerationView
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              loading={moderationLoading}
              actionLoading={moderationActionLoading}
              error={moderationError}
              reports={moderationReports}
              reportSummary={reportSummary}
              users={moderationUsers}
              usersSummary={moderationUsersSummary}
              userStatusFilter={moderationUserStatusFilter}
              userSearchQuery={moderationUserSearchQuery}
              audit={moderationAudit}
              analytics={analytics}
              statusFilter={moderationStatusFilter}
              onStatusFilterChange={setModerationStatusFilter}
              onUserStatusFilterChange={setModerationUserStatusFilter}
              onUserSearchChange={setModerationUserSearchQuery}
              onRefresh={async () => {
                await Promise.all([
                  refreshModerationReports(),
                  refreshModerationUsers({
                    background: true,
                    query: moderationUserSearchQuery,
                    status: moderationUserStatusFilter,
                  }),
                  refreshModerationAudit({ background: true }),
                  refreshAnalytics({ background: true }),
                ]);
              }}
              onRefreshUsers={() =>
                refreshModerationUsers({
                  query: moderationUserSearchQuery,
                  status: moderationUserStatusFilter,
                })
              }
              onResolveReport={resolveModerationReport}
              onUpdateUserStatus={updateModerationUserStatus}
              onOpenAccount={() => openAuthView("login")}
              onLoginRequest={openAdminLogin}
            />
          )}

          {activeView === "premium" && (
            <PremiumView
              user={user}
              subscription={subscription}
              currentPlanMeta={currentPlanMeta}
              loading={subscriptionLoading}
              actionLoading={subscriptionActionLoading}
              checkoutLoading={subscriptionCheckoutLoading}
              confirmLoading={subscriptionConfirmLoading}
              error={subscriptionError}
              onRefresh={refreshSubscription}
              onChangePlan={changePlan}
              onConfirmCheckout={confirmCheckout}
              onCloseCheckout={closeCheckout}
              isAuthenticated={isAuthenticated}
              onLoginRequest={() => openAuthView("signup")}
            />
          )}

          {activeView === "auth" && (
            <AuthView
              user={user}
              loading={authLoading}
              error={authError}
              onLogin={login}
              onRegister={register}
              onLogout={logout}
              onUpdateProfile={updateProfile}
              onCompleteVerification={completeVerification}
              blockedUsers={blockedUsers}
              blockedLoading={blockedLoading}
              onRefreshBlockedUsers={loadBlockedUsers}
              onUnblockUser={unblockUser}
              defaultMode={authDefaultMode}
              isAdminLogin={requestedMode === "admin"}
            />
          )}

          {authError && activeView !== "auth" && (
            <p className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {authError}
            </p>
          )}

          <footer className="glass mt-6 overflow-hidden rounded-3xl">
            <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <section>
                <p className="font-heading text-xl text-white">Spark Workspace</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                  Manage matches, conversations, and profile activity in one secure dashboard built for speed and clarity.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-aqua/30 bg-aqua/15 px-3 py-1 text-[11px] font-semibold text-aqua">
                    Real-time Chat
                  </span>
                  <span className="rounded-full border border-coral/30 bg-coral/15 px-3 py-1 text-[11px] font-semibold text-coral">
                    Match Insights
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    Privacy First
                  </span>
                </div>
              </section>

              <section>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Quick Links</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {workspaceFooterLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-lg px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Need Help?</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p className="surface-soft rounded-xl px-3 py-2">Support: hello@sparksocial.app</p>
                  <p className="surface-soft rounded-xl px-3 py-2">Avg response time: Under 24 hours</p>
                  <Link
                    to="/contact"
                    className="inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    Open Support
                  </Link>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 bg-black/15 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <p>Copyright {new Date().getFullYear()} Spark Social</p>
              <p>Workspace security, trust, and experience crafted for modern dating.</p>
            </div>
          </footer>
        </main>
      </div>

      <nav className="glass fixed inset-x-2 bottom-2 z-20 mx-auto overflow-x-auto rounded-2xl px-2 py-2 scrollbar-hidden sm:inset-x-4 sm:bottom-4 sm:px-3 lg:hidden">
        <div className="flex min-w-max items-center gap-2">
          {availableNavItems.map((item) => {
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`min-w-[84px] rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
                  active ? "bg-coral text-white" : "text-slate-300"
                }`}
              >
                <span className="block leading-tight">{item.shortLabel}</span>
                {item.key === "notifications" && unreadCount > 0 && <span className="block text-[10px]">{unreadCount}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default AppWorkspacePage;
