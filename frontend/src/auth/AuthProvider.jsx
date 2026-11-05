import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  STORAGE_KEY,
  UNAUTHORIZED_EVENT,
  clearAuth,
  loadAuth,
  saveAuth,
} from "./authStorage";
import { login as loginRequest } from "../services/authService";

// Größtes Intervall, das setTimeout verarbeiten kann
const MAX_TIMEOUT = 2 ** 31 - 1;

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth());

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    saveAuth(data);
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuth(null);
  }, []);

  useEffect(() => {
    // Das Backend hat das Token abgelehnt
    const handleUnauthorized = () => setAuth(null);

    // An- oder Abmeldung in einem anderen Tab desselben Browsers
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setAuth(loadAuth());
      }
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Beim Ablauf des Tokens automatisch abmelden
  useEffect(() => {
    if (!auth) return undefined;

    const timer = setTimeout(
      () => {
        clearAuth();
        setAuth(null);
      },
      Math.min(Math.max(auth.expiresAt - Date.now(), 0), MAX_TIMEOUT),
    );

    return () => clearTimeout(timer);
  }, [auth]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(auth),
      username: auth?.username ?? null,
      login,
      logout,
    }),
    [auth, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
