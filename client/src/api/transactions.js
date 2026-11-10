import { apiClient } from './client';

/**
 * Fetch paginated & filtered transactions from backend
 * @param {object} params - { month, category_id, type, page, limit }
 */
export async function fetchTransactions(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.append('month', params.month);
  if (params.category_id) searchParams.append('category_id', params.category_id);
  if (params.type) searchParams.append('type', params.type);
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
  return apiClient.get(endpoint);
}

/**
 * Get a single transaction by ID
 * @param {string|number} id
 */
export async function getTransactionById(id) {
  return apiClient.get(`/transactions/${id}`);
}

/**
 * Create a new income or expense transaction
 * @param {object} txData - { amount, category_id, type, description, transaction_date }
 */
export async function createTransaction(txData) {
  return apiClient.post('/transactions', txData);
}

/**
 * Update an existing transaction
 * @param {string|number} id
 * @param {object} txData
 */
export async function updateTransaction(id, txData) {
  return apiClient.put(`/transactions/${id}`, txData);
}

/**
 * Delete a transaction
 * @param {string|number} id
 */
export async function deleteTransaction(id) {
  return apiClient.delete(`/transactions/${id}`);
}

/**
 * Fetch monthly analytics summary & category breakdown (/api/analytics/dashboard)
 * @param {string} [month] - Format: YYYY-MM
 */
export async function fetchAnalyticsSummary(month) {
  const endpoint = month ? `/analytics/dashboard?month=${month}` : '/analytics/dashboard';
  try {
    return await apiClient.get(endpoint);
  } catch (err) {
    // Fallback to /analytics/summary if /dashboard is not mapped
    const fallback = month ? `/analytics/summary?month=${month}` : '/analytics/summary';
    return apiClient.get(fallback);
  }
}

/**
 * Fetch dynamic Safe-to-Spend burn calculation (/api/analytics/safe-spend)
 * @param {string} [month] - Format: YYYY-MM
 */
export async function fetchSafeToSpend(month) {
  const endpoint = month ? `/analytics/safe-spend?month=${month}` : '/analytics/safe-spend';
  try {
    return await apiClient.get(endpoint);
  } catch (err) {
    // Fallback to /analytics/safe-to-spend
    const fallback = month ? `/analytics/safe-to-spend?month=${month}` : '/analytics/safe-to-spend';
    return apiClient.get(fallback);
  }
}
