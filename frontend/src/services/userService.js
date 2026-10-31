import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/users`;

export async function getUsers() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Benutzer konnten nicht geladen werden");
  }

  return response.json();
}
