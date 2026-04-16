import http from 'k6/http';
import { API_BASE_URL, DEFAULTS } from '../config.js';

export function login(username, password) {
  const response = http.post(
    `${API_BASE_URL}/auth/login`,
    JSON.stringify({ username, password }),
    { headers: DEFAULTS.headers, timeout: DEFAULTS.timeout }
  );

  // Manejo explícito de errores a nivel de red/conexión
  if (response.error) {
    if (response.error_code === 1050 || response.error.includes('timeout')) {
      console.error(`Request timeout for user ${username}: ${response.error}`);
    } else if (response.error.includes('connection refused')) {
      console.error(`Connection refused for user ${username}: ${response.error}`);
    } else {
      console.error(`HTTP error for user ${username}: ${response.error}`);
    }
  }

  return response;
}
