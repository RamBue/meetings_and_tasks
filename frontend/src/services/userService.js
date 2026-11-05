import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";

const API_URL = `${API_BASE_URL}/api/users`;

export async function getUsers() {
  const response = await apiFetch(API_URL);

  if (!response.ok) {
    throw new Error("Benutzer konnten nicht geladen werden");
  }

  return response.json();
}
