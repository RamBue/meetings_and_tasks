const API_URL = "http://localhost:5002/api/users";

export async function getUsers() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Benutzer konnten nicht geladen werden");
  }

  return response.json();
}
