import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/tasks`;

export async function getTasksByAgendaItem(agendaItemId) {
  const response = await apiFetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw await apiError(response, "Pendenzen konnten nicht geladen werden");
  }

  return response.json();
}

export async function createTask(task) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw await apiError(response, "Pendenz konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateTask(id, updates) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw await apiError(response, "Pendenz konnte nicht aktualisiert werden");
  }

  return response.json();
}
