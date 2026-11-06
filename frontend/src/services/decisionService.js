import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/decisions`;

export async function getDecisionsByAgendaItem(agendaItemId) {
  const response = await apiFetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw await apiError(response, "Entscheide konnten nicht geladen werden");
  }

  return response.json();
}

export async function createDecision(decision) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(decision),
  });

  if (!response.ok) {
    throw await apiError(response, "Entscheid konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateDecision(id, updates) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw await apiError(response, "Entscheid konnte nicht aktualisiert werden");
  }

  return response.json();
}
