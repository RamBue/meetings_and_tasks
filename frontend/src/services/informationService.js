const API_URL = "http://localhost:5002/api/informations";

export async function getInformationsByAgendaItem(agendaItemId) {
  const response = await fetch(`${API_URL}?agendaItemId=${agendaItemId}`);

  if (!response.ok) {
    throw new Error("Informationen konnten nicht geladen werden");
  }

  return response.json();
}

export async function createInformation(information) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(information),
  });

  if (!response.ok) {
    throw new Error("Information konnte nicht erstellt werden");
  }

  return response.json();
}

export async function updateInformation(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Information konnte nicht aktualisiert werden");
  }

  return response.json();
}
