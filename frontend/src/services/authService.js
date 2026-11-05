import { API_BASE_URL } from "../config/api";

// Meldet mit Benutzername und Passwort an und liefert { token, username, expiresAt }.
// Bei einem Fehler enthält error.code den Grund: "invalid", "rate-limit",
// "not-configured" oder "failed".
export async function login(username, password) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw Object.assign(new Error("Server nicht erreichbar"), {
      code: "failed",
    });
  }

  if (response.status === 401) {
    throw Object.assign(new Error("Ungültige Zugangsdaten"), {
      code: "invalid",
    });
  }

  if (response.status === 429) {
    throw Object.assign(new Error("Zu viele Versuche"), {
      code: "rate-limit",
    });
  }

  if (response.status === 503) {
    throw Object.assign(new Error("Login nicht konfiguriert"), {
      code: "not-configured",
    });
  }

  if (!response.ok) {
    throw Object.assign(new Error("Anmeldung fehlgeschlagen"), {
      code: "failed",
    });
  }

  return response.json();
}
