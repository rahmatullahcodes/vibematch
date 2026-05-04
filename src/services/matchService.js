import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const matchService = {
  async getSwipeCandidates(token) {
    if (USE_MOCK_API) {
      return mockApi.getSwipeCandidates(token);
    }
    return request("/swipe/candidates", { method: "GET", token });
  },

  async sendSwipeAction(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.sendSwipeAction(token, payload);
    }
    return request("/swipe/action", { method: "POST", token, data: payload });
  },
};
