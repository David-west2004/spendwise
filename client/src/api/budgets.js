import { apiClient } from './client';

/**
 * Fetch budget for authenticated user for target month (defaults to current month YYYY-MM)
 * @param {string} [month] - Format: YYYY-MM
 */
export async function fetchBudget(month) {
  const endpoint = month ? `/budgets?month=${month}` : '/budgets';
  return apiClient.get(endpoint);
}

/**
 * Upsert budget for target month
 * @param {object} budgetData - { month_year, total_allowance, fixed_bills }
 */
export async function saveBudget(budgetData) {
  return apiClient.post('/budgets', budgetData);
}
