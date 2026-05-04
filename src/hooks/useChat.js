import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, USE_MOCK_API } from "../config/env";
import { chatService } from "../services/chatService";

const FALLBACK_POLL_MS = 15000;
const MOCK_POLL_MS = 4000;

function createWsUrl(token) {
  const apiUrl = new URL(API_BASE_URL, window.location.origin);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";

  const normalizedPath = apiUrl.pathname.replace(/\/+$/, "");
  apiUrl.pathname = normalizedPath.endsWith("/api")
    ? `${normalizedPath.slice(0, -4) || ""}/ws`
    : `${normalizedPath || ""}/ws`;
  apiUrl.search = `token=${encodeURIComponent(token)}`;

  return apiUrl.toString();
}

export function useChat(token, isAuthenticated, isChatVisible = false) {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messageMap, setMessageMap] = useState({});
  const [typingByThread, setTypingByThread] = useState({});
  const [presenceByUserId, setPresenceByUserId] = useState({});
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const activeThreadIdRef = useRef("");
  const isChatVisibleRef = useRef(isChatVisible);

  const threadsWithPresence = useMemo(
    () =>
      threads.map((thread) => {
        if (thread.kind === "direct" && thread.peerUserId) {
          const isOnline = Boolean(presenceByUserId[thread.peerUserId]);
          return {
            ...thread,
            isPeerOnline: isOnline,
            status: isOnline ? "Online now" : thread.status || "Offline",
          };
        }
        return {
          ...thread,
          isPeerOnline: false,
        };
      }),
    [threads, presenceByUserId],
  );

  const activeThread = useMemo(
    () => threadsWithPresence.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threadsWithPresence],
  );

  const messages = useMemo(() => messageMap[activeThreadId] ?? [], [activeThreadId, messageMap]);
  const activeTypingState = useMemo(() => typingByThread[activeThreadId] ?? null, [activeThreadId, typingByThread]);

  const loadThreads = useCallback(
    async (options = {}) => {
      const { background = false } = options;

      if (!isAuthenticated || !token) {
        setThreads([]);
        setActiveThreadId("");
        setMessageMap({});
        setTypingByThread({});
        setPresenceByUserId({});
        setBlockedUsers([]);
        setError("Login to access direct messages.");
        setIsSocketConnected(false);
        return [];
      }

      if (!background) {
        setThreadsLoading(true);
      }
      setError("");

      try {
        const response = await chatService.getThreads(token);
        const safeThreads = Array.isArray(response) ? response : [];
        setThreads(safeThreads);
        setActiveThreadId((previous) =>
          safeThreads.some((thread) => thread.id === previous) ? previous : safeThreads[0]?.id || "",
        );
        return safeThreads;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load chat threads.");
        return [];
      } finally {
        if (!background) {
          setThreadsLoading(false);
        }
      }
    },
    [isAuthenticated, token],
  );

  const loadBlockedUsers = useCallback(
    async (options = {}) => {
      const { background = false } = options;

      if (!isAuthenticated || !token) {
        setBlockedUsers([]);
        return [];
      }

      if (!background) {
        setBlockedLoading(true);
      }

      try {
        const response = await chatService.getBlockedUsers(token);
        const safeBlockedUsers = Array.isArray(response?.blockedUsers) ? response.blockedUsers : [];
        setBlockedUsers(safeBlockedUsers);
        return safeBlockedUsers;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load blocked users.");
        return [];
      } finally {
        if (!background) {
          setBlockedLoading(false);
        }
      }
    },
    [isAuthenticated, token],
  );

  const markThreadRead = useCallback(
    async (threadId) => {
      if (!threadId || !token || !isAuthenticated) {
        return { updatedMessageIds: [] };
      }

      try {
        const response = await chatService.markThreadRead(token, threadId);
        if (Array.isArray(response?.updatedMessageIds) && response.updatedMessageIds.length) {
          const updatedSet = new Set(response.updatedMessageIds);
          setMessageMap((previous) => {
            const currentMessages = previous[threadId];
            if (!Array.isArray(currentMessages)) {
              return previous;
            }
            return {
              ...previous,
              [threadId]: currentMessages.map((message) =>
                message.from === "them" && updatedSet.has(message.id)
                  ? { ...message, deliveryStatus: "read" }
                  : message,
              ),
            };
          });
          loadThreads({ background: true });
        }
        return response;
      } catch {
        return { updatedMessageIds: [] };
      }
    },
    [isAuthenticated, loadThreads, token],
  );

  const loadMessages = useCallback(
    async (threadId, options = {}) => {
      const { background = false, markRead = false } = options;
      if (!threadId || !token || !isAuthenticated) {
        return null;
      }

      if (!background) {
        setMessagesLoading(true);
      }
      setError("");

      try {
        const response = await chatService.getMessages(token, threadId);
        const safeMessages = Array.isArray(response?.messages) ? response.messages : [];
        setMessageMap((previous) => ({
          ...previous,
          [threadId]: safeMessages,
        }));

        if (markRead) {
          await markThreadRead(threadId);
        }
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load chat messages.");
        return null;
      } finally {
        if (!background) {
          setMessagesLoading(false);
        }
      }
    },
    [isAuthenticated, markThreadRead, token],
  );

  const sendMessage = useCallback(
    async (text, options = {}) => {
      if (!activeThreadId || !token || !isAuthenticated || !text?.trim()) {
        return null;
      }

      setSendLoading(true);
      setError("");

      try {
        const response = await chatService.sendMessage(token, {
          threadId: activeThreadId,
          text,
          replyToId: options.replyToId || "",
        });
        setMessageMap((previous) => ({
          ...previous,
          [activeThreadId]: [...(previous[activeThreadId] ?? []), response.message],
        }));
        loadThreads({ background: true });
        return response;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to send message.");
        return null;
      } finally {
        setSendLoading(false);
      }
    },
    [activeThreadId, isAuthenticated, loadThreads, token],
  );

  const sendTyping = useCallback(
    async (isTyping) => {
      if (!activeThreadId || !token || !isAuthenticated) {
        return { ok: false };
      }

      try {
        await chatService.sendTyping(token, {
          threadId: activeThreadId,
          isTyping: Boolean(isTyping),
        });
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    [activeThreadId, isAuthenticated, token],
  );

  const toggleMessageReaction = useCallback(
    async (messageId, emoji) => {
      if (!activeThreadId || !messageId || !emoji || !token) {
        return { ok: false };
      }

      try {
        const response = await chatService.toggleMessageReaction(token, {
          threadId: activeThreadId,
          messageId,
          emoji,
        });
        if (response?.message) {
          setMessageMap((previous) => ({
            ...previous,
            [activeThreadId]: (previous[activeThreadId] ?? []).map((message) =>
              message.id === messageId ? response.message : message,
            ),
          }));
        }
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to update reaction.");
        return { ok: false };
      }
    },
    [activeThreadId, token],
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!activeThreadId || !messageId || !token) {
        return { ok: false };
      }

      try {
        await chatService.deleteMessage(token, {
          threadId: activeThreadId,
          messageId,
        });
        setMessageMap((previous) => ({
          ...previous,
          [activeThreadId]: (previous[activeThreadId] ?? []).filter((message) => message.id !== messageId),
        }));
        loadThreads({ background: true });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to delete message.");
        return { ok: false };
      }
    },
    [activeThreadId, loadThreads, token],
  );

  const reportMessage = useCallback(
    async (messageId, reason = "Inappropriate content") => {
      if (!activeThreadId || !messageId || !token) {
        return { ok: false };
      }
      try {
        await chatService.reportMessage(token, {
          threadId: activeThreadId,
          messageId,
          reason,
        });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to report message.");
        return { ok: false };
      }
    },
    [activeThreadId, token],
  );

  const reportUser = useCallback(
    async (targetUserId, reason = "Safety concern") => {
      if (!targetUserId || !token) {
        return { ok: false };
      }
      try {
        await chatService.reportUser(token, { targetUserId, reason });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to report user.");
        return { ok: false };
      }
    },
    [token],
  );

  const blockUser = useCallback(
    async (targetUserId) => {
      if (!targetUserId || !token) {
        return { ok: false };
      }
      try {
        await chatService.blockUser(token, { targetUserId });
        await loadThreads({ background: true });
        await loadBlockedUsers({ background: true });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to block user.");
        return { ok: false };
      }
    },
    [loadBlockedUsers, loadThreads, token],
  );

  const unblockUser = useCallback(
    async (targetUserId) => {
      if (!targetUserId || !token) {
        return { ok: false };
      }
      try {
        await chatService.unblockUser(token, { targetUserId });
        await loadBlockedUsers({ background: true });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to unblock user.");
        return { ok: false };
      }
    },
    [loadBlockedUsers, token],
  );

  const unmatchUser = useCallback(
    async (targetUserId) => {
      if (!targetUserId || !token) {
        return { ok: false };
      }
      try {
        await chatService.unmatchUser(token, { targetUserId });
        await loadThreads({ background: true });
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to unmatch user.");
        return { ok: false };
      }
    },
    [loadThreads, token],
  );

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  useEffect(() => {
    isChatVisibleRef.current = isChatVisible;
  }, [isChatVisible]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadBlockedUsers({ background: true });
  }, [loadBlockedUsers]);

  useEffect(() => {
    if (!activeThreadId) {
      return;
    }
    loadMessages(activeThreadId, {
      background: true,
      markRead: false,
    });
  }, [activeThreadId, loadMessages]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return undefined;
    }

    if (!USE_MOCK_API) {
      let reconnectAttempts = 0;
      let reconnectTimerId = null;
      let isUnmounted = false;
      let socket = null;

      const connectSocket = () => {
        if (isUnmounted) {
          return;
        }

        try {
          socket = new WebSocket(createWsUrl(token));
        } catch {
          reconnectTimerId = window.setTimeout(connectSocket, 1500);
          return;
        }

        socket.onmessage = (event) => {
          let payload = null;
          try {
            payload = JSON.parse(event.data);
          } catch {
            return;
          }

          if (!payload || typeof payload !== "object") {
            return;
          }

          if (payload.type === "chat_message") {
            const targetThreadId = payload.threadId || activeThreadIdRef.current;
            if (targetThreadId) {
              loadMessages(targetThreadId, {
                background: true,
                markRead: false,
              });
            }
            loadThreads({ background: true });
            return;
          }

          if (payload.type === "chat_thread_created") {
            loadThreads({ background: true });
            return;
          }

          if (payload.type === "chat_read") {
            const threadId = payload.threadId;
            const messageIds = Array.isArray(payload.messageIds) ? payload.messageIds : [];
            if (threadId && messageIds.length) {
              const readSet = new Set(messageIds);
              setMessageMap((previous) => {
                const list = previous[threadId];
                if (!Array.isArray(list)) {
                  return previous;
                }
                return {
                  ...previous,
                  [threadId]: list.map((message) =>
                    message.from === "me" && readSet.has(message.id)
                      ? { ...message, deliveryStatus: "read" }
                      : message,
                  ),
                };
              });
            }
            return;
          }

          if (payload.type === "chat_typing") {
            const threadId = payload.threadId;
            if (!threadId) {
              return;
            }
            setTypingByThread((previous) => {
              if (!payload.isTyping) {
                const next = { ...previous };
                delete next[threadId];
                return next;
              }
              return {
                ...previous,
                [threadId]: {
                  isTyping: true,
                  at: payload.at || new Date().toISOString(),
                  fromUserId: payload.fromUserId || "",
                },
              };
            });
            return;
          }

          if (payload.type === "chat_presence") {
            const presenceUserId = payload.userId;
            if (!presenceUserId) {
              return;
            }
            setPresenceByUserId((previous) => ({
              ...previous,
              [presenceUserId]: Boolean(payload.isOnline),
            }));
          }
        };

        socket.onopen = () => {
          reconnectAttempts = 0;
          setIsSocketConnected(true);
        };

        socket.onerror = () => {
          if (socket && socket.readyState < 2) {
            socket.close();
          }
        };

        socket.onclose = () => {
          if (isUnmounted) {
            return;
          }
          setIsSocketConnected(false);
          const reconnectDelay = Math.min(5000, 900 + reconnectAttempts * 700);
          reconnectAttempts += 1;
          reconnectTimerId = window.setTimeout(connectSocket, reconnectDelay);
        };
      };

      connectSocket();

      return () => {
        isUnmounted = true;
        setIsSocketConnected(false);
        if (reconnectTimerId) {
          window.clearTimeout(reconnectTimerId);
        }
        if (socket && socket.readyState < 2) {
          socket.close();
        }
      };
    }

    return undefined;
  }, [isAuthenticated, loadMessages, loadThreads, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return undefined;
    }

    if (!USE_MOCK_API && isSocketConnected) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      loadThreads({ background: true });
      if (activeThreadIdRef.current) {
        loadMessages(activeThreadIdRef.current, {
          background: true,
          markRead: false,
        });
      }
    }, USE_MOCK_API ? MOCK_POLL_MS : FALLBACK_POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthenticated, isSocketConnected, loadMessages, loadThreads, token]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setTypingByThread((previous) => {
        let hasChanged = false;
        const next = {};
        Object.entries(previous).forEach(([threadId, typingState]) => {
          const timestamp = new Date(typingState?.at || "").getTime();
          const isRecent = Number.isFinite(timestamp) && now - timestamp < 4500;
          if (isRecent && typingState?.isTyping) {
            next[threadId] = typingState;
          } else {
            hasChanged = true;
          }
        });
        return hasChanged ? next : previous;
      });
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return {
    threads: threadsWithPresence,
    activeThreadId,
    setActiveThreadId,
    activeThread,
    isPeerTyping: Boolean(activeTypingState?.isTyping),
    messages,
    threadsLoading,
    blockedUsers,
    blockedLoading,
    messagesLoading,
    sendLoading,
    error,
    loadThreads,
    loadBlockedUsers,
    loadMessages,
    sendMessage,
    sendTyping,
    markThreadRead,
    toggleMessageReaction,
    deleteMessage,
    reportMessage,
    reportUser,
    blockUser,
    unblockUser,
    unmatchUser,
  };
}
