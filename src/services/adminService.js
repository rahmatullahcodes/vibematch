import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const adminService = {
  async getModerationUsers(token, payload = {}) {
    if (USE_MOCK_API) {
      return mockApi.getModerationUsers(token, payload);
    }
    const query = new URLSearchParams();
    if (payload?.status && payload.status !== "all") {
      query.set("status", payload.status);
    }
    if (payload?.query) {
      query.set("query", payload.query);
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request(`/moderation/users${suffix}`, { method: "GET", token });
  },

  async getModerationReports(token, status = "all") {
    if (USE_MOCK_API) {
      return mockApi.getModerationReports(token, { status });
    }
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return request(`/moderation/reports${query}`, { method: "GET", token });
  },

  async resolveModerationReport(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.resolveModerationReport(token, payload);
    }
    return request("/moderation/reports/resolve", { method: "POST", token, data: payload });
  },

  async getModerationAudit(token) {
    if (USE_MOCK_API) {
      return mockApi.getModerationAudit(token);
    }
    return request("/moderation/audit", { method: "GET", token });
  },

  async updateUserModerationStatus(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.updateUserModerationStatus(token, payload);
    }
    return request("/moderation/users/status", { method: "POST", token, data: payload });
  },

  async deleteModerationUser(token, payload) {
    if (USE_MOCK_API) {
      if (typeof mockApi.deleteModerationUser === "function") {
        return mockApi.deleteModerationUser(token, payload);
      }
      return { ok: true };
    }
    try {
      return await request("/moderation/users/delete", {
        method: "POST",
        token,
        data: {
          targetUserId: payload?.targetUserId || payload?.userId || payload?.id || "",
          reason: payload?.reason || "",
        },
      });
    } catch (error) {
      if (error?.status !== 404) {
        throw error;
      }

      return request("/admin/users/delete", {
        method: "POST",
        token,
        data: {
          targetUserId: payload?.targetUserId || payload?.userId || payload?.id || "",
          reason: payload?.reason || "",
        },
      });
    }
  },

  async getAnalyticsDashboard(token) {
    if (USE_MOCK_API) {
      return mockApi.getAnalyticsDashboard(token);
    }
    return request("/analytics/dashboard", { method: "GET", token });
  },
};
