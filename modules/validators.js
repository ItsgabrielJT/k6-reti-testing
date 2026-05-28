import { check } from 'k6';

export function validateLoginResponse(response) {
  let body = null;
  try {
    body = response.json();
  } catch (_) {
    // body remains null if response is not valid JSON
  }

  return check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'token exists': () => body?.token !== undefined,
    'token is not empty': () => body?.token?.length > 0,
  });
}
