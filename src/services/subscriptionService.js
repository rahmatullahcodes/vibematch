import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const subscriptionService = {
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

  async createCheckout(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.createSubscriptionCheckout(token, payload);
    }
    return request("/subscription/checkout", { method: "POST", token, data: payload });
  },

  async confirmCheckout(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.confirmSubscriptionCheckout(token, payload);
    }
    return request("/subscription/checkout/confirm", { method: "POST", token, data: payload });
  },
};
