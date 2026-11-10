/**
 * SpendWise API Client
 * Native fetch-based HTTP client for Node.js Express backend (http://localhost:5000/api).
 * Includes automatic JWT token authorization, JSON serialization, timeout guards,
 * and robust error handling with offline resilience.
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Perform an authenticated HTTP request using the native Fetch API.
 * @param {string} endpoint - API route (e.g. '/auth/login', '/transactions')
 * @param {RequestInit & { timeoutMs?: number }} options - Fetch options
 * @returns {Promise<any>} Parsed response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  const token = localStorage.getItem('spendwise_token');
  const timeoutMs = options.timeoutMs ?? 5000;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && data.message) ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Differentiate abort/timeout and network failures for offline fallback
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Server may be offline.');
      timeoutError.isOffline = true;
      throw timeoutError;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error. Unable to reach backend server.');
      networkError.isOffline = true;
      throw networkError;
    }

    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};

export default apiClient;
