import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/meetings`;

export async function getMeetings() {
  const response = await apiFetch(API_URL);

  if (!response.ok) {
    throw await apiError(response, "Meetings konnten nicht geladen werden");
  }

  return response.json();
}

export async function getMeetingById(id) {
  const response = await apiFetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw await apiError(response, "Meeting konnte nicht geladen werden");
  }

  return response.json();
}

export async function createMeeting(meeting) {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meeting),
  });

  if (!response.ok) {
    throw await apiError(response, "Meeting konnte nicht gespeichert werden");
  }

  return response.json();
}

export async function updateMeeting(id, updates) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw await apiError(response, "Meeting konnte nicht aktualisiert werden");
  }

  return response.json();
}

export async function deleteMeeting(id) {
  const response = await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await apiError(response, "Meeting konnte nicht gelöscht werden");
  }

  return response.json();
}

export async function uploadProtocol(id, file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const response = await apiFetch(`${API_URL}/${id}/protocol`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw await apiError(response, "Protokoll konnte nicht hochgeladen werden");
  }

  return response.json();
}

// Lädt das Protokoll mit Anmeldung herunter. Ein einfacher Link kann das Token
// nicht mitschicken, deshalb wird die Datei abgerufen und lokal gespeichert.
export async function downloadProtocol(id, fileName) {
  const response = await apiFetch(`${API_URL}/${id}/protocol/download`);

  if (!response.ok) {
    throw await apiError(response, "Protokoll konnte nicht heruntergeladen werden");
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName || "protokoll.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
