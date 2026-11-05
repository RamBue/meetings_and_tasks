import {
  UNAUTHORIZED_EVENT,
  clearAuth,
  getToken,
} from "../auth/authStorage";

// Wie fetch, schickt aber das Login-Token mit. Lehnt das Backend das Token ab,
// wird die Anmeldung beendet und die App zeigt die Anmeldeseite.
export async function apiFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 && token) {
    clearAuth();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  return response;
}
