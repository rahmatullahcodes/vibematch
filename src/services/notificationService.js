import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const notificationService = {
  async getNotifications(token) {
    if (USE_MOCK_API) {
      return mockApi.getNotifications(token);
    }
    return request("/notifications", { method: "GET", token });
  },

  async markRead(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.markNotificationRead(token, payload);
    }
    return request("/notifications/read", { method: "POST", token, data: payload });
  },

  async markAllRead(token) {
    if (USE_MOCK_API) {
      return mockApi.markAllNotificationsRead(token);
    }
    return request("/notifications/read-all", { method: "POST", token });
  },

  async getPreferences(token) {
    if (USE_MOCK_API) {
      return mockApi.getNotificationPreferences(token);
    }
    return request("/notifications/preferences", { method: "GET", token });
  },

  async updatePreferences(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.updateNotificationPreferences(token, payload);
    }
    return request("/notifications/preferences", { method: "POST", token, data: payload });
  },
};
