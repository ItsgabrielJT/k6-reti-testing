import { check } from 'k6';

export function validateLoginResponse(response) {
  return check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'token exists': (r) => r.json()?.token !== undefined,
    'token is not empty': (r) => r.json()?.token?.length > 0,
  });
}

/**
 * Valida la estructura completa de la respuesta de creación
 * @param {object} response - Respuesta de k6 HTTP
 * @returns {boolean} true si todas las validaciones pasan
 */
export function validateCreateAccountResponse(response) {
  const body = response.json();
  
  return (
    validateResponseStatus(response, 200) &&
    validateResponseCode(response, 1) &&
    validateMessage(response, 'created successfully', 'message contains "created successfully"')
  );
}

/**
 * Valida la estructura completa de la respuesta de lectura
 * @param {object} response - Respuesta de k6 HTTP
 * @returns {boolean} true si todas las validaciones pasan
 */
export function validateGetAccountResponse(response) {
  const body = response.json();
  
  return (
    validateResponseStatus(response, 200) &&
    validateResponseCode(response, 1) &&
    check(response, {
      'user data exists': (r) => r.json()?.user !== undefined,
      'user has email': (r) => r.json()?.user?.email !== undefined,
    })
  );
}

/**
 * Valida error cuando usuario no existe
 * @param {object} response - Respuesta de k6 HTTP
 * @returns {boolean} true si la validación de error pasa
 */
export function validateUserNotFoundError(response) {
  return (
    validateResponseStatus(response, 400) &&
    validateResponseCode(response, 0) &&
    validateMessage(response, 'not found', 'error message contains "not found"')
  );
}

/**
 * Valida error cuando email ya existe
 * @param {object} response - Respuesta de k6 HTTP
 * @returns {boolean} true si la validación de error pasa
 */
export function validateDuplicateEmailError(response) {
  return (
    validateResponseStatus(response, 400) &&
    validateResponseCode(response, 0) &&
    validateMessage(response, 'already exist', 'error message contains "already exist"')
  );
}
