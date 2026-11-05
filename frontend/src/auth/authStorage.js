const STORAGE_KEY = "meetings_auth";

// Wird ausgelöst, wenn das Backend ein Token ablehnt (abgelaufen oder ungültig)
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

// Falls der Browser das Speichern verbietet (z.B. privates Fenster), bleibt die
// Anmeldung wenigstens bis zum Neuladen der Seite erhalten
let memoryAuth = null;

export { STORAGE_KEY };

export function saveAuth(auth) {
  memoryAuth = auth;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } catch {
    // ohne Speicher weiterarbeiten
  }
}

export function clearAuth() {
  memoryAuth = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ohne Speicher weiterarbeiten
  }
}

// Liefert { token, username, expiresAt } oder null, wenn nicht angemeldet
// oder das Token abgelaufen ist
export function loadAuth() {
  let auth = memoryAuth;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    auth = raw ? JSON.parse(raw) : null;
  } catch {
    // Speicher nicht lesbar: der Wert im Arbeitsspeicher gilt
  }

  if (!auth || !auth.token || !(auth.expiresAt > Date.now())) {
    return null;
  }

  return auth;
}

export function getToken() {
  return loadAuth()?.token ?? null;
}
