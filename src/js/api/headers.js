import { API_KEY } from "./constants";

export function headers(body) {
  const headers = new Headers();

  if (API_KEY) {
    headers.append("X-Noroff-API-Key", API_KEY);
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  if (body) {
    headers.append('Content-Type', 'application/json');
  }

  return headers;
}

