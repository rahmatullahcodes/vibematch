import { USE_MOCK_API } from "../config/env";
import { ApiError, request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

async function requestWithPathFallback(paths, options) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }
    }
  }
  throw lastError || new ApiError("Request failed.", 500, null);
}

export const authService = {
  async register(payload) {
    if (USE_MOCK_API) {
      return mockApi.register(payload);
    }
    return requestWithPathFallback(["/auth/register", "/register"], {
      method: "POST",
      data: payload,
    });
  },

  async login(payload) {
    if (USE_MOCK_API) {
      return mockApi.login(payload);
    }
    return requestWithPathFallback(["/auth/login", "/login"], {
      method: "POST",
      data: payload,
    });
  },

  async refreshSession(refreshToken) {
    if (USE_MOCK_API) {
      return null;
    }
    return requestWithPathFallback(["/auth/refresh", "/refresh"], {
      method: "POST",
      data: { refreshToken },
    });
  },

  async getCurrentUser(token) {
    if (USE_MOCK_API) {
      return mockApi.getCurrentUser(token);
    }
    return requestWithPathFallback(["/auth/me", "/me"], { method: "GET", token });
  },

  async updateProfile(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.updateProfile(token, payload);
    }
    return requestWithPathFallback(["/auth/profile", "/profile"], {
      method: "POST",
      token,
      data: payload,
    });
  },

  async completeVerification(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.completeVerification(token, payload);
    }
    return requestWithPathFallback(["/auth/verify", "/verify"], {
      method: "POST",
      token,
      data: payload,
    });
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
