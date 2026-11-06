import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/informations`;

export async function getInformationsByAgendaItem(agendaItemId) {
  const response = await apiFetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw await apiError(response, "Informationen konnten nicht geladen werden");
  }

  return response.json();
}

export async function createInformation(information) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(information),
  });

  if (!response.ok) {
    throw await apiError(response, "Information konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateInformation(id, updates) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw await apiError(response, "Information konnte nicht aktualisiert werden");
  }

  return response.json();
}
