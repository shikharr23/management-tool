import { createContext, useState, useEffect, useCallback } from "react";
import { authService, setUnauthorizedHandler, setAccessToken } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore errors during logout
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const fetchUser = useCallback(async (cancelled = false) => {
    try {
      const userData = await authService.getMe();
      if (!cancelled) setUser(userData);
    } catch {
      if (!cancelled) setUser(null);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        // Try to silently refresh token on app mount using httpOnly cookie
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        await fetchUser(cancelled);
      } catch {
        // No valid refresh token cookie exists
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    setLoading(true);
    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  const login = async (newToken) => {
    setAccessToken(newToken);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
