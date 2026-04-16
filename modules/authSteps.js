import http from 'k6/http';
import { API_BASE_URL, DEFAULTS } from '../config.js';

export function login(username, password) {
  return http.post(
    `${API_BASE_URL}/auth/login`,
    JSON.stringify({ username, password }),
    { headers: DEFAULTS.headers, timeout: DEFAULTS.timeout }
  );
}
