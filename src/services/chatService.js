import { USE_MOCK_API } from "../config/env";
import { request } from "../lib/httpClient";
import * as mockApi from "../mocks/mockApi";

export const chatService = {
  async getBlockedUsers(token) {
    if (USE_MOCK_API) {
      return mockApi.getBlockedUsers(token);
    }
    return request("/chat/user/blocked", { method: "GET", token });
  },

  async getThreads(token) {
    if (USE_MOCK_API) {
      return mockApi.getChatThreads(token);
    }
    return request("/chat/threads", { method: "GET", token });
  },

  async getMessages(token, threadId) {
    if (USE_MOCK_API) {
      return mockApi.getChatMessages(token, threadId);
    }
    return request(`/chat/threads/${threadId}/messages`, { method: "GET", token });
  },

  async sendMessage(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.sendMessage(token, payload);
    }
    return request("/chat/messages", { method: "POST", token, data: payload });
  },

  async sendTyping(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.sendTypingSignal(token, payload);
    }
    return request("/chat/typing", { method: "POST", token, data: payload });
  },

  async markThreadRead(token, threadId) {
    if (USE_MOCK_API) {
      return mockApi.markThreadRead(token, threadId);
    }
    return request("/chat/read", { method: "POST", token, data: { threadId } });
  },

  async toggleMessageReaction(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.toggleMessageReaction(token, payload);
    }
    return request("/chat/messages/react", { method: "POST", token, data: payload });
  },

  async deleteMessage(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.deleteMessage(token, payload);
    }
    return request("/chat/messages/delete", { method: "POST", token, data: payload });
  },

  async reportMessage(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.reportMessage(token, payload);
    }
    return request("/chat/messages/report", { method: "POST", token, data: payload });
  },

  async reportUser(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.reportUser(token, payload);
    }
    return request("/chat/user/report", { method: "POST", token, data: payload });
  },

  async blockUser(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.blockUser(token, payload);
    }
    return request("/chat/user/block", { method: "POST", token, data: payload });
  },

  async unblockUser(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.unblockUser(token, payload);
    }
    return request("/chat/user/unblock", { method: "POST", token, data: payload });
  },

  async unmatchUser(token, payload) {
    if (USE_MOCK_API) {
      return mockApi.unmatchUser(token, payload);
    }
    return request("/chat/user/unmatch", { method: "POST", token, data: payload });
  },
};
