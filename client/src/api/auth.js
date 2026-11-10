import { apiClient } from './client';

/**
 * Check backend health status
 */
export async function checkHealth() {
  return apiClient.get('/health');
}

/**
 * Authenticate existing user
 * @param {object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  return apiClient.post('/auth/login', credentials);
}

/**
 * Register a new user
 * @param {object} userData - { fullname, email, password, currency }
 */
export async function registerUser(userData) {
  return apiClient.post('/auth/register', userData);
}

/**
 * Retrieve authenticated user profile
 */
export async function getCurrentUser() {
  return apiClient.get('/auth/me');
}
