import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/agenda-items`;

export async function createAgendaItem(agendaItem) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agendaItem),
  });

  if (!response.ok) {
    throw await apiError(response, "Traktandum konnte nicht erstellt werden");
  }

  return response.json();
}

// Das Backend antwortet mit 409, wenn das Traktandum schon Entscheide,
// Informationen oder Pendenzen enthält und daher nicht mehr geändert wird
function conflictError() {
  const error = new Error(
    "Das Traktandum enthält Entscheide, Informationen oder Pendenzen.",
  );
  error.conflict = true;
  return error;
}

export async function deleteAgendaItem(id) {
  const response = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });

  if (response.status === 409) throw conflictError();
  if (!response.ok) {
    throw await apiError(response, "Traktandum konnte nicht gelöscht werden");
  }

  return response.json();
}

export async function updateAgendaItem(id, updates) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (response.status === 409) throw conflictError();
  if (!response.ok) {
    throw await apiError(response, "Traktandum konnte nicht aktualisiert werden");
  }

  return response.json();
}
