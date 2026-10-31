import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/tasks`;

export async function getTasksByAgendaItem(agendaItemId) {
  const response = await fetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw new Error("Pendenzen konnten nicht geladen werden");
  }

  return response.json();
}

export async function createTask(task) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Pendenz konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Pendenz konnte nicht aktualisiert werden");
  }

  return response.json();
}
