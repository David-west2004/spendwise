/**
 * SpendWise Utility Formatters
 * Supports dynamic global currency configuration based on user settings.
 */

/**
 * Resolves the active currency symbol from an optional currency string
 * or from localStorage ('spendwise_currency'), defaulting to Nigerian Naira (₦).
 * @param {string} [currency] - Optional currency name or symbol
 * @returns {string} Currency symbol, e.g. "₦", "$", "£"
 */
export function getCurrencySymbol(currency) {
  const val =
    currency ||
    (typeof window !== 'undefined' ? localStorage.getItem('spendwise_currency') : null) ||
    '₦';

  if (val.includes('₦') || val.toUpperCase() === 'NGN') return '₦';
  if (val.includes('$') || val.toUpperCase() === 'USD') return '$';
  if (val.includes('£') || val.toUpperCase() === 'GBP') return '£';
  if (val.includes('€') || val.toUpperCase() === 'EUR') return '€';

  const match = val.match(/\(([^)]+)\)/);
  if (match && match[1]) return match[1];

  return val.trim() || '₦';
}

/**
 * Formats a numeric value into the active currency standard (e.g. ₦15,000.00, $15,000.00)
 * @param {number|string} amount - The amount to format
 * @param {object} options - Optional configuration { withSpace: false, showDecimals: true, currency: string }
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, options = {}) {
  const { withSpace = false, showDecimals = true, currency } = options;
  const symbol = getCurrencySymbol(currency);

  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${symbol}${withSpace ? ' ' : ''}${showDecimals ? '0.00' : '0'}`;
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absValue = Math.abs(num);

  const formattedNum = absValue.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const space = withSpace ? ' ' : '';
  const prefix = isNegative ? `-${symbol}${space}` : `${symbol}${space}`;

  return `${prefix}${formattedNum}`;
}

/**
 * Alias to formatCurrency to ensure complete backwards compatibility
 */
export const formatNaira = formatCurrency;

/**
 * Formats a numeric value into compact currency (e.g. ₦15k, $1.5M)
 * @param {number|string} amount
 * @param {object} options
 * @returns {string}
 */
export function formatCompactCurrency(amount, options = {}) {
  const { currency } = options;
  const symbol = getCurrencySymbol(currency);

  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${symbol}0`;
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const abs = Math.abs(num);

  let formatted = '';
  if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  } else {
    formatted = abs.toLocaleString('en-US');
  }

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Alias to formatCompactCurrency to ensure complete backwards compatibility
 */
export const formatCompactNaira = formatCompactCurrency;

/**
 * Formats a date string into friendly readable format
 * @param {string|Date} dateInput
 * @param {object} options
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday && options.relativeToday) {
    return 'Today';
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: options.includeYear ? 'numeric' : undefined,
  });
}

/**
 * Formats a percentage value (e.g. 40 -> "40%")
 * @param {number} value
 * @returns {string}
 */
export function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0%';
  }
  return `${Math.round(Number(value))}%`;
}
