export const API_URL = 'http://127.0.0.1:8000';

export function authFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${url}`, { ...options, headers });
}