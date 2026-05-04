import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const callService = {
  async getDashboard(token) {
    if (USE_MOCK_API) {
      return mockApi.getCallDashboard(token);
    }
    return request("/calls", { method: "GET", token });
  },

  async startCall(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.startCallSession(token, payload);
    }
    return request("/calls/start", { method: "POST", token, data: payload });
  },

  async respondToCall(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.respondCallSession(token, payload);
    }
    return request("/calls/respond", { method: "POST", token, data: payload });
  },

  async sendSignal(token, payload) {
    if (USE_MOCK_API) {
      return { success: true };
    }
    return request("/calls/signal", { method: "POST", token, data: payload });
  },
};
