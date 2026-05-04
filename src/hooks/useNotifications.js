import { useCallback, useEffect, useRef, useState } from "react";
import { notificationService } from "../services/notificationService";

const POLL_INTERVAL_MS = 8000;
const NOTIFICATION_TYPES = ["system", "social", "match", "message", "billing", "safety"];

function getDefaultPreferences() {
  const enabledMap = Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, true]));
  return {
    inAppByType: { ...enabledMap },
    browserByType: { ...enabledMap, billing: false },
    emailByType: { ...enabledMap, social: false, system: false },
  };
}

function normalizePreferences(preferences) {
  const defaults = getDefaultPreferences();
  const safe = preferences && typeof preferences === "object" ? preferences : {};
  const toMap = (sourceMap, fallbackMap) =>
    Object.fromEntries(
      NOTIFICATION_TYPES.map((type) => [
        type,
        typeof sourceMap?.[type] === "boolean" ? sourceMap[type] : Boolean(fallbackMap[type]),
      ]),
    );

  return {
    inAppByType: toMap(safe.inAppByType, defaults.inAppByType),
    browserByType: toMap(safe.browserByType, defaults.browserByType),
    emailByType: toMap(safe.emailByType, defaults.emailByType),
  };
}

export function useNotifications(token, isAuthenticated, isVisible = false) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [queuedEmailCount, setQueuedEmailCount] = useState(0);
  const [preferences, setPreferences] = useState(getDefaultPreferences);
  const [loading, setLoading] = useState(false);
  const [readAllLoading, setReadAllLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return "unsupported";
    }
    return Notification.permission || "default";
  });
  const previousNotificationIdsRef = useRef(new Set());

  const refreshNotifications = useCallback(
    async (options = {}) => {
      const { background = false } = options;

      if (!isAuthenticated || !token) {
        setNotifications([]);
        setUnreadCount(0);
        setQueuedEmailCount(0);
        setPreferences(getDefaultPreferences());
        setError("");
        return [];
      }

      if (!background) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await notificationService.getNotifications(token);
        const list = Array.isArray(response?.notifications) ? response.notifications : [];
        setNotifications(list);
        setUnreadCount(Number(response?.unreadCount) || 0);
        setQueuedEmailCount(Number(response?.queuedEmailCount) || 0);
        if (response?.preferences) {
          setPreferences(normalizePreferences(response.preferences));
        }
        return list;
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to load notifications.");
        return [];
      } finally {
        if (!background) {
          setLoading(false);
        }
      }
    },
    [isAuthenticated, token],
  );

  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setPreferences(getDefaultPreferences());
      return getDefaultPreferences();
    }

    setPreferencesLoading(true);
    try {
      const response = await notificationService.getPreferences(token);
      const next = normalizePreferences(response?.preferences);
      setPreferences(next);
      return next;
    } catch (apiError) {
      setError(apiError?.message ?? "Unable to load notification preferences.");
      return getDefaultPreferences();
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated, token]);

  const updatePreference = useCallback(
    async (channel, type, enabled) => {
      if (!isAuthenticated || !token) {
        return { ok: false };
      }

      const loadingKey = `pref:${channel}:${type}`;
      setActionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");
      try {
        const response = await notificationService.updatePreferences(token, {
          channel,
          type,
          enabled,
        });
        setPreferences(normalizePreferences(response?.preferences));
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to update preferences.");
        return { ok: false };
      } finally {
        setActionLoading((previous) => {
          const next = { ...previous };
          delete next[loadingKey];
          return next;
        });
      }
    },
    [isAuthenticated, token],
  );

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return "unsupported";
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission || "default");
      return permission;
    } catch {
      const fallback = Notification.permission || "denied";
      setBrowserPermission(fallback);
      return fallback;
    }
  }, []);

  const markRead = useCallback(
    async (notificationId) => {
      if (!notificationId || !isAuthenticated || !token) {
        return { ok: false };
      }

      const loadingKey = `read:${notificationId}`;
      setActionLoading((previous) => ({ ...previous, [loadingKey]: true }));
      setError("");

      try {
        const response = await notificationService.markRead(token, { notificationId });
        setNotifications((previous) =>
          previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
        );
        setUnreadCount(Number(response?.unreadCount) || 0);
        return { ok: true };
      } catch (apiError) {
        setError(apiError?.message ?? "Unable to mark notification.");
        return { ok: false };
      } finally {
        setActionLoading((previous) => {
          const next = { ...previous };
          delete next[loadingKey];
          return next;
        });
      }
    },
    [isAuthenticated, token],
  );

  const markAllRead = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return { ok: false };
    }

    setReadAllLoading(true);
    setError("");
    try {
      const response = await notificationService.markAllRead(token);
      setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
      setUnreadCount(Number(response?.unreadCount) || 0);
      return { ok: true };
    } catch (apiError) {
      setError(apiError?.message ?? "Unable to mark all notifications.");
      return { ok: false };
    } finally {
      setReadAllLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshNotifications();
    refreshPreferences();
  }, [refreshNotifications, refreshPreferences]);

  useEffect(() => {
    if (!isAuthenticated || !token || !isVisible) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshNotifications({ background: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isVisible, refreshNotifications, token]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }
    setBrowserPermission(Notification.permission || "default");
    if (Notification.permission !== "granted") {
      previousNotificationIdsRef.current = new Set(notifications.map((item) => item.id));
      return;
    }

    const previousIds = previousNotificationIdsRef.current;
    const nextIds = new Set(notifications.map((item) => item.id));
    const newUnread = notifications.filter((item) => !previousIds.has(item.id) && !item.read);
    newUnread.forEach((item) => {
      if (!preferences?.browserByType?.[item.type]) {
        return;
      }
      try {
        // Browser-level push simulation for enabled notification categories.
        new Notification(item.title || "Spark Notification", {
          body: item.message || "",
          tag: item.id,
        });
      } catch {
        // Ignore notification API failures and keep in-app alerts functional.
      }
    });
    previousNotificationIdsRef.current = nextIds;
  }, [notifications, preferences]);

  return {
    notifications,
    unreadCount,
    queuedEmailCount,
    preferences,
    browserPermission,
    loading,
    readAllLoading,
    preferencesLoading,
    actionLoading,
    error,
    refreshNotifications,
    refreshPreferences,
    updatePreference,
    requestBrowserPermission,
    markRead,
    markAllRead,
  };
}
