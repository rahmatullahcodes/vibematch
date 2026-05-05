import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AUTH_TOKEN_KEY = "spark_auth_token";
const AUTH_REFRESH_TOKEN_KEY = "spark_auth_refresh_token";
const AUTH_USER_KEY = "spark_auth_user";
const AUTH_TOKEN_EXP_KEY = "spark_auth_token_exp";

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors to avoid app crash in strict privacy modes.
  }
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors to avoid app crash in strict privacy modes.
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");

  const setAuthSession = useCallback((nextToken, nextUser, sessionMeta = {}) => {
    setToken(nextToken);
    setUser(nextUser);
    safeStorageSet(AUTH_TOKEN_KEY, nextToken);
    safeStorageSet(AUTH_USER_KEY, JSON.stringify(nextUser));
    if (typeof sessionMeta?.refreshToken === "string" && sessionMeta.refreshToken) {
      safeStorageSet(AUTH_REFRESH_TOKEN_KEY, sessionMeta.refreshToken);
    }
    if (typeof sessionMeta?.tokenExpiresAt === "string" && sessionMeta.tokenExpiresAt) {
      safeStorageSet(AUTH_TOKEN_EXP_KEY, sessionMeta.tokenExpiresAt);
    }
  }, []);

  const clearAuthSession = useCallback(() => {
    setToken(null);
    setUser(null);
    safeStorageRemove(AUTH_TOKEN_KEY);
    safeStorageRemove(AUTH_REFRESH_TOKEN_KEY);
    safeStorageRemove(AUTH_TOKEN_EXP_KEY);
    safeStorageRemove(AUTH_USER_KEY);
  }, []);

  const syncUser = useCallback((nextUser) => {
    if (!nextUser) {
      return;
    }
    setUser(nextUser);
    safeStorageSet(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const login = useCallback(
    async (payload) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.login(payload);
        setAuthSession(response.token, response.user, {
          refreshToken: response?.refreshToken || "",
          tokenExpiresAt: response?.tokenExpiresAt || "",
        });
        return { ok: true };
      } catch (apiError) {
        const endpoint = apiError?.details?.endpoint ? ` [${apiError.details.endpoint}]` : "";
        const message = (apiError?.message ?? "Unable to login.") + endpoint;
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuthSession],
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.register(payload);
        setAuthSession(response.token, response.user, {
          refreshToken: response?.refreshToken || "",
          tokenExpiresAt: response?.tokenExpiresAt || "",
        });
        return { ok: true };
      } catch (apiError) {
        const endpoint = apiError?.details?.endpoint ? ` [${apiError.details.endpoint}]` : "";
        const message = (apiError?.message ?? "Unable to create account.") + endpoint;
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuthSession],
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setError("");
  }, [clearAuthSession]);

  const updateProfile = useCallback(
    async (payload) => {
      if (!token) {
        const message = "Login required.";
        setError(message);
        return { ok: false, error: message };
      }

      setLoading(true);
      setError("");
      try {
        const response = await authService.updateProfile(token, payload);
        setAuthSession(token, response.user);
        return { ok: true, user: response.user };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to update profile.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuthSession, token],
  );

  const completeVerification = useCallback(
    async (method) => {
      if (!token) {
        const message = "Login required.";
        setError(message);
        return { ok: false, error: message };
      }

      setLoading(true);
      setError("");
      try {
        const response = await authService.completeVerification(token, { method });
        setAuthSession(token, response.user);
        return { ok: true, user: response.user };
      } catch (apiError) {
        const message = apiError?.message ?? "Unable to complete verification.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setAuthSession, token],
  );

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const savedToken = safeStorageGet(AUTH_TOKEN_KEY);
      const savedRefreshToken = safeStorageGet(AUTH_REFRESH_TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) {
          setBooting(false);
        }
        return;
      }

      try {
        const response = await authService.getCurrentUser(savedToken);
        if (!isMounted) {
          return;
        }
        setToken(savedToken);
        setUser(response.user);
        safeStorageSet(AUTH_USER_KEY, JSON.stringify(response.user));
      } catch {
        if (!isMounted) {
          return;
        }
        if (savedRefreshToken) {
          try {
            const refreshed = await authService.refreshSession(savedRefreshToken);
            if (refreshed?.token && refreshed?.user) {
              if (!isMounted) {
                return;
              }
              setAuthSession(refreshed.token, refreshed.user, {
                refreshToken: refreshed?.refreshToken || savedRefreshToken,
                tokenExpiresAt: refreshed?.tokenExpiresAt || "",
              });
            } else {
              clearAuthSession();
            }
          } catch {
            clearAuthSession();
          }
        } else {
          clearAuthSession();
        }
      } finally {
        if (isMounted) {
          setBooting(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuthSession]);

  return {
    user,
    token,
    loading,
    booting,
    error,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    syncUser,
    updateProfile,
    completeVerification,
  };
}
