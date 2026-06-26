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
