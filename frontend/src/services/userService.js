import { API_BASE_URL } from "../config/api";
import { apiFetch } from "./apiFetch";
import { apiError } from "./apiError";

const API_URL = `${API_BASE_URL}/api/users`;

export async function getUsers() {
  const response = await apiFetch(API_URL);

  if (!response.ok) {
    throw await apiError(response, "Benutzer konnten nicht geladen werden");
  }

  return response.json();
}
