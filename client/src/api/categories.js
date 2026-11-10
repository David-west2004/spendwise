import { apiClient } from './client';

/**
 * Fetch all available categories (system defaults + user custom categories)
 * @param {string} [type] - Optional filter: 'income' or 'expense'
 */
export async function fetchCategories(type) {
  const endpoint = type ? `/categories?type=${type}` : '/categories';
  return apiClient.get(endpoint);
}

/**
 * Create a new user custom category
 * @param {object} categoryData - { name, type, icon, color_hex }
 */
export async function createCategory(categoryData) {
  return apiClient.post('/categories', categoryData);
}
