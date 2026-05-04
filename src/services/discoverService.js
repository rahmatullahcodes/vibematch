import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const discoverService = {
  async getDiscoverFeed(token) {
    if (USE_MOCK_API) {
      return mockApi.getDiscoverFeed(token);
    }
    return request("/discover/feed", { method: "GET", token });
  },

  async toggleFollowAuthor(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.toggleFollowAuthor(token, payload);
    }
    return request("/discover/follow", { method: "POST", token, data: payload });
  },

  async togglePostLike(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.togglePostLike(token, payload);
    }
    return request("/discover/post-like", { method: "POST", token, data: payload });
  },

  async addPostComment(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.addPostComment(token, payload);
    }
    return request("/discover/post-comment", { method: "POST", token, data: payload });
  },

  async sharePost(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.sharePost(token, payload);
    }
    return request("/discover/post-share", { method: "POST", token, data: payload });
  },

  async getReelsFeed(token) {
    if (USE_MOCK_API) {
      return mockApi.getReelsFeed(token);
    }
    return request("/discover/reels", { method: "GET", token });
  },

  async addReelComment(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.addReelComment(token, payload);
    }
    return request("/discover/reel-comment", { method: "POST", token, data: payload });
  },

  async shareReel(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.shareReel(token, payload);
    }
    return request("/discover/reel-share", { method: "POST", token, data: payload });
  },

  async searchProfiles(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.searchDiscoverProfiles(token, payload);
    }
    return request("/discover/search", { method: "POST", token, data: payload });
  },

  async getRecommendations(token) {
    if (USE_MOCK_API) {
      return mockApi.getSmartRecommendations(token);
    }
    return request("/discover/recommendations", { method: "GET", token });
  },
};
