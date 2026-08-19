const API_URL = "http://localhost:5002/api/meetings";

export async function getMeetings() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Meetings konnten nicht geladen werden");
  }

  return response.json();
}

export async function getMeetingById(id) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Meeting konnte nicht geladen werden");
  }

  return response.json();
}

export async function updateMeeting(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Meeting konnte nicht aktualisiert werden");
  }

  return response.json();
}

export async function uploadProtocol(id, file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const response = await fetch(`${API_URL}/${id}/protocol`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Protokoll konnte nicht hochgeladen werden");
  }

  return response.json();
}

export function getProtocolDownloadUrl(id) {
  return `${API_URL}/${id}/protocol/download`;
}
