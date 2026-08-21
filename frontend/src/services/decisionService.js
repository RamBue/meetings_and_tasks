const API_URL = "http://localhost:5002/api/decisions";

export async function getDecisionsByAgendaItem(agendaItemId) {
  const response = await fetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw new Error("Entscheide konnten nicht geladen werden");
  }

  return response.json();
}

export async function createDecision(decision) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(decision),
  });

  if (!response.ok) {
    throw new Error("Entscheid konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateDecision(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Entscheid konnte nicht aktualisiert werden");
  }

  return response.json();
}
