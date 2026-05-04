import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const authService = {
  async register(payload) {
    if (USE_MOCK_API) {
      return mockApi.register(payload);
    }
    return request("/auth/register", { method: "POST", data: payload });
  },

  async login(payload) {
    if (USE_MOCK_API) {
      return mockApi.login(payload);
    }
    return request("/auth/login", { method: "POST", data: payload });
  },

  async refreshSession(refreshToken) {
    if (USE_MOCK_API) {
      return null;
    }
    return request("/auth/refresh", { method: "POST", data: { refreshToken } });
  },

  async getCurrentUser(token) {
    if (USE_MOCK_API) {
      return mockApi.getCurrentUser(token);
    }
    return request("/auth/me", { method: "GET", token });
  },

  async updateProfile(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.updateProfile(token, payload);
    }
    return request("/auth/profile", { method: "POST", token, data: payload });
  },

  async completeVerification(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.completeVerification(token, payload);
    }
    return request("/auth/verify", { method: "POST", token, data: payload });
  },

  async getSubscription(token) {
    if (USE_MOCK_API) {
      return mockApi.getSubscription(token);
    }
    return request("/subscription", { method: "GET", token });
  },

  async updateSubscription(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.updateSubscription(token, payload);
    }
    return request("/subscription/update", { method: "POST", token, data: payload });
  },
};
