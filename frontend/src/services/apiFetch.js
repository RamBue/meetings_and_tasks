import {
  UNAUTHORIZED_EVENT,
  clearAuth,
  getToken,
} from "../auth/authStorage";
import { networkError } from "./apiError";

// Wie fetch, schickt aber das Login-Token mit. Lehnt das Backend das Token ab,
// wird die Anmeldung beendet und die App zeigt die Anmeldeseite.
// Ist der Server nicht erreichbar, entsteht ein Fehler mit verständlicher Meldung.
export async function apiFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(input, { ...init, headers });
  } catch {
    throw networkError();
  }

  if (response.status === 401 && token) {
    clearAuth();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  return response;
}
