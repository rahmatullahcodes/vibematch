import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";

export function useAdminPanel(token, isAuthenticated, isAdmin, isVisible = false) {
  const [reports, setReports] = useState([]);
  const [reportSummary, setReportSummary] = useState({ total: 0, open: 0, underReview: 0, resolved: 0, dismissed: 0 });
  const [users, setUsers] = useState([]);
  const [usersSummary, setUsersSummary] = useState({ total: 0, active: 0, suspended: 0, banned: 0 });
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [audit, setAudit] = useState([]);
  const [analytics, setAnalytics] = useState({
    metrics: {
      totalUsers: 0,
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      matchConversionRate: 0,
      chatResponseRate: 0,
      paidConversionRate: 0,
      totalLikes: 0,
      totalMatches: 0,
      paidUsers: 0,
      reportsOpen: 0,
    },
    trends: {
      dau7d: [],
      paidConversion7d: [],
    },
    generatedAt: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportsLoading, setReportsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshReports = useCallback(
    async (options = {}) => {
      const { background = false } = options;
      if (!isAuthenticated || !token || !isAdmin) {
        setReports([]);
        setReportSummary({ total: 0, open: 0, underReview: 0, resolved: 0, dismissed: 0 });
        return [];
      }
      setReportsLoading(true);
      if (!background) {
        setLoading(true);
      }
      setError("");
      try {
        const response = await adminService.getModerationReports(token, statusFilter);
        setReports(Array.isArray(response?.reports) ? response.reports : []);
        setReportSummary(
          response?.summary || { total: 0, open: 0, underReview: 0, resolved: 0, dismissed: 0 },
        );
        return response?.reports || [];
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load moderation reports.");
        return [];
      } finally {
        setReportsLoading(false);
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAdmin, isAuthenticated, statusFilter, token],
  );

  const refreshUsers = useCallback(
    async (options = {}) => {
      const { background = false } = options;
      const query = typeof options.query === "string" ? options.query : "";
      const status = typeof options.status === "string" ? options.status : "all";
      if (!isAuthenticated || !token || !isAdmin) {
        setUsers([]);
        setUsersSummary({ total: 0, active: 0, suspended: 0, banned: 0 });
        return [];
      }
      setUsersLoading(true);
      if (!background) {
        setLoading(true);
      }
      setError("");
      try {
        const response = await adminService.getModerationUsers(token, { query, status });
        const nextUsers = Array.isArray(response?.users) ? response.users : [];
        setUsers(nextUsers);
        setUsersSummary(response?.summary || { total: 0, active: 0, suspended: 0, banned: 0 });
        return nextUsers;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load moderation users.");
        return [];
      } finally {
        setUsersLoading(false);
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAdmin, isAuthenticated, token],
  );

  const refreshAudit = useCallback(
    async (options = {}) => {
      const { background = false } = options;
      if (!isAuthenticated || !token || !isAdmin) {
        setAudit([]);
        return [];
      }
      setAuditLoading(true);
      if (!background) {
        setLoading(true);
      }
      setError("");
      try {
        const response = await adminService.getModerationAudit(token);
        setAudit(Array.isArray(response?.audit) ? response.audit : []);
        return response?.audit || [];
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load moderation audit.");
        return [];
      } finally {
        setAuditLoading(false);
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAdmin, isAuthenticated, token],
  );

  const refreshAnalytics = useCallback(
    async (options = {}) => {
      const { background = false } = options;
      if (!isAuthenticated || !token || !isAdmin) {
        return null;
      }
      setAnalyticsLoading(true);
      if (!background) {
        setLoading(true);
      }
      setError("");
      try {
        const response = await adminService.getAnalyticsDashboard(token);
        setAnalytics((previous) => response || previous);
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load analytics.");
        return null;
      } finally {
        setAnalyticsLoading(false);
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAdmin, isAuthenticated, token],
  );

  const resolveReport = useCallback(
    async (payload) => {
      if (!isAuthenticated || !token || !isAdmin) {
        return { ok: false };
      }
      setActionLoading(true);
      setError("");
      try {
        await adminService.resolveModerationReport(token, payload);
        await Promise.all([
          refreshReports({ background: true }),
          refreshUsers({ background: true, query: userSearchQuery, status: userStatusFilter }),
          refreshAudit({ background: true }),
          refreshAnalytics({ background: true }),
        ]);
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to resolve report.");
        return { ok: false };
      } finally {
        setActionLoading(false);
      }
    },
    [
      isAdmin,
      isAuthenticated,
      refreshAnalytics,
      refreshAudit,
      refreshReports,
      refreshUsers,
      token,
      userSearchQuery,
      userStatusFilter,
    ],
  );

  const updateUserStatus = useCallback(
    async (payload) => {
      if (!isAuthenticated || !token || !isAdmin) {
        return { ok: false };
      }
      setActionLoading(true);
      setError("");
      try {
        await adminService.updateUserModerationStatus(token, payload);
        await Promise.all([
          refreshReports({ background: true }),
          refreshUsers({ background: true, query: userSearchQuery, status: userStatusFilter }),
          refreshAudit({ background: true }),
          refreshAnalytics({ background: true }),
        ]);
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to update user status.");
        return { ok: false };
      } finally {
        setActionLoading(false);
      }
    },
    [
      isAdmin,
      isAuthenticated,
      refreshAnalytics,
      refreshAudit,
      refreshReports,
      refreshUsers,
      token,
      userSearchQuery,
      userStatusFilter,
    ],
  );

  const deleteUser = useCallback(
    async (payload) => {
      if (!isAuthenticated || !token || !isAdmin) {
        return { ok: false };
      }
      setActionLoading(true);
      setError("");
      try {
        await adminService.deleteModerationUser(token, payload);
        await Promise.all([
          refreshReports({ background: true }),
          refreshUsers({ background: true, query: userSearchQuery, status: userStatusFilter }),
          refreshAudit({ background: true }),
          refreshAnalytics({ background: true }),
        ]);
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to delete user.");
        return { ok: false };
      } finally {
        setActionLoading(false);
      }
    },
    [
      isAdmin,
      isAuthenticated,
      refreshAnalytics,
      refreshAudit,
      refreshReports,
      refreshUsers,
      token,
      userSearchQuery,
      userStatusFilter,
    ],
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    refreshReports();
    refreshAudit({ background: true });
    refreshAnalytics({ background: true });
  }, [isVisible, refreshAnalytics, refreshAudit, refreshReports]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    refreshUsers({
      background: true,
      query: userSearchQuery,
      status: userStatusFilter,
    });
  }, [isVisible, refreshUsers, userSearchQuery, userStatusFilter]);

  return {
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
    deleteUser,
  };
}
