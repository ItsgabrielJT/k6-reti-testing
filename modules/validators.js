import { check } from 'k6';

export function validateLoginResponse(response) {
  return check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'token exists': (r) => r.json()?.token !== undefined,
    'token is not empty': (r) => r.json()?.token?.length > 0,
  });
}
