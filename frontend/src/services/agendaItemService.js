const API_URL = "http://localhost:5002/api/agenda-items";

export async function createAgendaItem(agendaItem) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agendaItem),
  });

  if (!response.ok) {
    throw new Error("Traktandum konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateAgendaItem(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Traktandum konnte nicht aktualisiert werden");
  }

  return response.json();
}
