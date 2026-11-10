import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchTransactions,
  createTransaction as apiCreateTransaction,
  deleteTransaction as apiDeleteTransaction,
  fetchAnalyticsSummary,
  fetchSafeToSpend,
} from '../api/transactions';
import { fetchCategories, createCategory as apiCreateCategory } from '../api/categories';
import { fetchBudget, saveBudget as apiSaveBudget } from '../api/budgets';
import {
  getStoredNotifications,
  saveStoredNotifications,
  DEFAULT_NOTIFICATIONS,
} from '../api/notifications';
import { useAuth } from './AuthContext';
import { getCurrencySymbol } from '../utils/formatters';

const initialMockTransactions = [
  {
    id: 'tx-1',
    type: 'expense',
    title: 'Campus Cafeteria Lunch',
    category: 'Food & Cafeteria',
    category_id: 1,
    amount: 2500,
    date: 'Today',
    transaction_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    type: 'expense',
    title: 'MTN 10GB Data Bundle',
    category: 'Data & Airtime',
    category_id: 5,
    amount: 3000,
    date: 'Today',
    transaction_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    type: 'income',
    title: 'Monthly Allowance from Home',
    category: 'Monthly Allowance',
    category_id: 7,
    amount: 30000,
    date: 'Yesterday',
    transaction_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'Course Handouts & Lab Manual',
    category: 'Course Handouts & Books',
    category_id: 3,
    amount: 4500,
    date: 'Yesterday',
    transaction_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tx-5',
    type: 'expense',
    title: 'Campus Shuttle & Bus Fare',
    category: 'Transport & Shuttle',
    category_id: 4,
    amount: 1200,
    date: '11 Oct',
    transaction_date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'tx-6',
    type: 'income',
    title: 'SIWES Transport Stipend',
    category: 'Scholarship/Stipend',
    category_id: 9,
    amount: 20000,
    date: '8 Oct',
    transaction_date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food & Cafeteria', type: 'expense', icon: 'utensils', color_hex: '#ef4444' },
  { id: 2, name: 'Hostel & Rent', type: 'expense', icon: 'home', color_hex: '#f97316' },
  { id: 3, name: 'Course Handouts & Books', type: 'expense', icon: 'book-open', color_hex: '#eab308' },
  { id: 4, name: 'Transport & Shuttle', type: 'expense', icon: 'bus', color_hex: '#3b82f6' },
  { id: 5, name: 'Data & Airtime', type: 'expense', icon: 'wifi', color_hex: '#8b5cf6' },
  { id: 6, name: 'Entertainment & Snacks', type: 'expense', icon: 'film', color_hex: '#ec4899' },
  { id: 7, name: 'Monthly Allowance', type: 'income', icon: 'wallet', color_hex: '#10b981' },
  { id: 8, name: 'Side Hustle', type: 'income', icon: 'briefcase', color_hex: '#14b8a6' },
  { id: 9, name: 'Scholarship/Stipend', type: 'income', icon: 'award', color_hex: '#06b6d4' },
  { id: 10, name: 'Gift', type: 'income', icon: 'gift', color_hex: '#84cc16' },
];

/**
 * Format date value into standard YYYY-MM-DD for backend
 */
function toStandardDateStr(dateInput) {
  if (!dateInput || dateInput === 'Today') {
    return new Date().toISOString().slice(0, 10);
  }
  if (dateInput === 'Yesterday') {
    const d = new Date(Date.now() - 86400000);
    return d.toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const parsed = new Date(dateInput);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { token } = useAuth();

  // Load transactions from localStorage or default
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_transactions');
      return saved ? JSON.parse(saved) : initialMockTransactions;
    } catch {
      return initialMockTransactions;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('spendwise_balance');
    return saved !== null ? Number(saved) : 15000;
  });

  const [totalSpent, setTotalSpent] = useState(() => {
    const saved = localStorage.getItem('spendwise_total_spent');
    return saved !== null ? Number(saved) : 35000;
  });

  const [totalAdded, setTotalAdded] = useState(() => {
    const saved = localStorage.getItem('spendwise_total_added');
    return saved !== null ? Number(saved) : 50000;
  });

  const [budget, setBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('spendwise_budget');
      return saved ? JSON.parse(saved) : { total_allowance: 50000, fixed_bills: 10000 };
    } catch {
      return { total_allowance: 50000, fixed_bills: 10000 };
    }
  });

  const [safeToSpendData, setSafeToSpendData] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Global Currency State synced with localStorage
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('spendwise_currency') || 'Nigerian Naira (₦)';
  });

  const currencySymbol = getCurrencySymbol(currency);

  const updateCurrency = useCallback((newCurrency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('spendwise_currency', newCurrency);
    } catch (err) {
      console.warn('Failed to save currency to localStorage:', err);
    }
  }, []);

  // Listen to cross-window or direct storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'spendwise_currency' && e.newValue) {
        setCurrencyState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState(getStoredNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Persist notifications on change
  const updateNotifications = useCallback((updater) => {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveStoredNotifications(next);
      return next;
    });
  }, []);

  // Save financial metrics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
      localStorage.setItem('spendwise_categories', JSON.stringify(categories));
      localStorage.setItem('spendwise_balance', balance.toString());
      localStorage.setItem('spendwise_total_spent', totalSpent.toString());
      localStorage.setItem('spendwise_total_added', totalAdded.toString());
      localStorage.setItem('spendwise_budget', JSON.stringify(budget));
    } catch (err) {
      console.warn('Failed to cache finance data:', err);
    }
  }, [transactions, categories, balance, totalSpent, totalAdded, budget]);

  /**
   * Fetch categories from backend
   */
  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchCategories();
      if (res?.data?.categories && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
        setCategories(res.data.categories);
        localStorage.setItem('spendwise_categories', JSON.stringify(res.data.categories));
      }
    } catch (err) {
      console.warn('Unable to load backend categories, utilizing cache:', err.message);
    }
  }, [token]);

  /**
   * Fetch current month's budget
   */
  const loadBudget = useCallback(async () => {
    if (!token) return;
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await fetchBudget(currentMonth);
      if (res?.data?.budget) {
        setBudget(res.data.budget);
      }
    } catch (err) {
      console.warn('Unable to load budget, utilizing local state:', err.message);
    }
  }, [token]);

  /**
   * Sync with backend API when authenticated
   */
  const syncWithBackend = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // 1. Fetch categories
      await loadCategories();

      // 2. Fetch budget
      await loadBudget();

      // 3. Fetch transactions
      const txRes = await fetchTransactions({ limit: 100 });
      if (txRes?.data?.transactions && Array.isArray(txRes.data.transactions)) {
        const mapped = txRes.data.transactions.map((tx) => ({
          id: tx.id.toString(),
          type: tx.type,
          title: tx.description || tx.category_name || (tx.type === 'income' ? 'Allowance' : 'Expense'),
          category: tx.category_name || (tx.type === 'income' ? 'Allowance' : 'Custom / Other'),
          category_id: tx.category_id,
          amount: Number(tx.amount),
          date: tx.transaction_date,
          transaction_date: tx.transaction_date,
          created_at: tx.created_at,
        }));
        setTransactions(mapped);
      }

      // 4. Fetch monthly dashboard summary
      const currentMonth = new Date().toISOString().slice(0, 7);
      const summaryRes = await fetchAnalyticsSummary(currentMonth);
      if (summaryRes?.data) {
        setDashboardSummary(summaryRes.data);
        const { total_income, total_expenses, net_balance } = summaryRes.data;
        if (total_income !== undefined) setTotalAdded(Number(total_income));
        if (total_expenses !== undefined) setTotalSpent(Number(total_expenses));
        if (net_balance !== undefined) setBalance(Number(net_balance));
      }

      // 5. Fetch Safe-to-Spend burn calculation
      const safeRes = await fetchSafeToSpend(currentMonth);
      if (safeRes?.data) {
        setSafeToSpendData(safeRes.data);
      }

      setIsOnline(true);
    } catch (err) {
      console.warn('Backend sync paused, operating with local offline cache:', err.message);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [token, loadCategories, loadBudget]);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  /**
   * Helper to resolve category_id from category name and transaction type
   */
  const resolveCategoryId = async (categoryName, type) => {
    const normType = type.toLowerCase();
    const cleanName = (categoryName || '').trim().toLowerCase();

    // 1. Check in loaded categories list
    const found = categories.find((c) => {
      if (c.type !== normType) return false;
      const cName = c.name.toLowerCase();
      return (
        cName === cleanName ||
        cleanName.includes(cName) ||
        cName.includes(cleanName) ||
        (cleanName.includes('food') && cName.includes('food')) ||
        (cleanName.includes('transport') && cName.includes('transport')) ||
        (cleanName.includes('data') && cName.includes('data')) ||
        (cleanName.includes('book') && cName.includes('book')) ||
        (cleanName.includes('allowance') && cName.includes('allowance')) ||
        (cleanName.includes('income') && cName.includes('allowance'))
      );
    });

    if (found) {
      return found.id;
    }

    // 2. If authenticated and custom category, create it dynamically
    if (token && categoryName && categoryName !== '+ Custom / Other') {
      try {
        const createRes = await apiCreateCategory({
          name: categoryName,
          type: normType,
          icon: normType === 'income' ? 'wallet' : 'tag',
          color_hex: normType === 'income' ? '#10b981' : '#ef4444',
        });
        if (createRes?.data?.category) {
          const newCat = createRes.data.category;
          setCategories((prev) => [...prev, newCat]);
          return newCat.id;
        }
      } catch (err) {
        console.warn('Could not auto-create category on backend:', err.message);
      }
    }

    // 3. Fallback to first available category of matching type
    const fallbackCategory = categories.find((c) => c.type === normType);
    return fallbackCategory ? fallbackCategory.id : (normType === 'income' ? 7 : 1);
  };

  /**
   * Add a transaction with backend sync and instant re-calculation
   */
  const addTransaction = async (newTx) => {
    const isIncome = newTx.type === 'income';
    const numAmount = Number(newTx.amount) || 0;
    const catName = newTx.category || (isIncome ? 'Monthly Allowance' : 'Food & Cafeteria');
    const note = newTx.title || newTx.note || catName;
    const formattedDate = toStandardDateStr(newTx.date || newTx.transaction_date);

    const localTx = {
      id: `tx-${Date.now()}`,
      type: newTx.type,
      title: note,
      category: catName,
      amount: numAmount,
      date: newTx.date || 'Today',
      transaction_date: formattedDate,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setTransactions((prev) => [localTx, ...prev]);

    if (isIncome) {
      setBalance((prev) => prev + numAmount);
      setTotalAdded((prev) => prev + numAmount);
    } else {
      setBalance((prev) => prev - numAmount);
      setTotalSpent((prev) => prev + numAmount);
    }

    // Sync with backend API
    if (token) {
      try {
        const categoryId = await resolveCategoryId(catName, newTx.type);
        const apiRes = await apiCreateTransaction({
          amount: numAmount,
          category_id: categoryId,
          type: newTx.type,
          description: note,
          transaction_date: formattedDate,
        });

        if (apiRes?.data?.transaction) {
          const created = apiRes.data.transaction;
          setTransactions((prev) =>
            prev.map((t) => (t.id === localTx.id ? { ...t, id: created.id.toString(), category_id: created.category_id } : t))
          );
        }

        // Re-sync analytics and safe-to-spend dynamically without page reload
        const currentMonth = formattedDate.slice(0, 7);
        const [summaryRes, safeRes] = await Promise.all([
          fetchAnalyticsSummary(currentMonth).catch(() => null),
          fetchSafeToSpend(currentMonth).catch(() => null),
        ]);

        if (summaryRes?.data) {
          setDashboardSummary(summaryRes.data);
          if (summaryRes.data.total_income !== undefined) setTotalAdded(Number(summaryRes.data.total_income));
          if (summaryRes.data.total_expenses !== undefined) setTotalSpent(Number(summaryRes.data.total_expenses));
          if (summaryRes.data.net_balance !== undefined) setBalance(Number(summaryRes.data.net_balance));
        }

        if (safeRes?.data) {
          setSafeToSpendData(safeRes.data);
        }

        setIsOnline(true);
      } catch (err) {
        console.warn('Transaction stored locally; backend sync skipped:', err.message);
        setIsOnline(false);
      }
    }
  };

  /**
   * Delete a transaction
   */
  const deleteTransaction = async (txId) => {
    const tx = transactions.find((t) => t.id === txId || t.id.toString() === txId.toString());
    if (tx) {
      if (tx.type === 'income') {
        setBalance((prev) => prev - tx.amount);
        setTotalAdded((prev) => prev - tx.amount);
      } else {
        setBalance((prev) => prev + tx.amount);
        setTotalSpent((prev) => prev - tx.amount);
      }
    }

    setTransactions((prev) => prev.filter((t) => t.id !== txId && t.id.toString() !== txId.toString()));

    if (token && !isNaN(Number(txId))) {
      try {
        await apiDeleteTransaction(txId);
        // Refresh summary and safe-to-spend
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [summaryRes, safeRes] = await Promise.all([
          fetchAnalyticsSummary(currentMonth).catch(() => null),
          fetchSafeToSpend(currentMonth).catch(() => null),
        ]);
        if (summaryRes?.data) {
          setDashboardSummary(summaryRes.data);
          if (summaryRes.data.net_balance !== undefined) setBalance(Number(summaryRes.data.net_balance));
        }
        if (safeRes?.data) {
          setSafeToSpendData(safeRes.data);
        }
      } catch (err) {
        console.warn('Backend deletion skipped; local record updated:', err.message);
      }
    }
  };

  /**
   * Save or update monthly budget
   */
  const updateBudget = async ({ total_allowance, fixed_bills, month_year }) => {
    const currentMonth = month_year || new Date().toISOString().slice(0, 7);
    const updated = {
      month_year: currentMonth,
      total_allowance: Number(total_allowance) || 0,
      fixed_bills: Number(fixed_bills) || 0,
    };

    setBudget(updated);

    if (token) {
      try {
        await apiSaveBudget(updated);
        // Recalculate safe-to-spend with the new budget rules
        const safeRes = await fetchSafeToSpend(currentMonth);
        if (safeRes?.data) {
          setSafeToSpendData(safeRes.data);
        }
        setIsOnline(true);
      } catch (err) {
        console.warn('Budget updated locally; backend sync failed:', err.message);
      }
    }
  };

  /**
   * Notification Handlers
   */
  const markNotificationAsRead = (id) => {
    updateNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const toggleNotificationRead = (id) => {
    updateNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: !notif.isRead } : notif))
    );
  };

  const markAllNotificationsAsRead = () => {
    updateNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const clearNotifications = () => {
    updateNotifications([]);
  };

  const deleteNotification = (id) => {
    updateNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const addNotification = (notif) => {
    const newEntry = {
      id: `notif-${Date.now()}`,
      time: 'Today',
      timestamp: Date.now(),
      isRead: false,
      priority: 'normal',
      ...notif,
    };
    updateNotifications((prev) => [newEntry, ...prev]);
  };

  const resetNotifications = () => {
    updateNotifications(DEFAULT_NOTIFICATIONS);
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    setBalance(0);
    setTotalSpent(0);
    setTotalAdded(0);
  };

  const resetToDefaultMock = () => {
    setTransactions(initialMockTransactions);
    setBalance(15000);
    setTotalSpent(35000);
    setTotalAdded(50000);
    resetNotifications();
  };

  return (
    <FinanceContext.Provider
      value={{
        currency,
        currencySymbol,
        setCurrency: updateCurrency,
        updateCurrency,
        balance,
        totalSpent,
        totalAdded,
        transactions,
        categories,
        budget,
        safeToSpendData,
        dashboardSummary,
        isOnline,
        isLoading,
        notifications,
        unreadCount,
        syncWithBackend,
        loadCategories,
        loadBudget,
        updateBudget,
        addTransaction,
        deleteTransaction,
        markNotificationAsRead,
        toggleNotificationRead,
        markAllNotificationsAsRead,
        clearNotifications,
        deleteNotification,
        addNotification,
        resetNotifications,
        clearAllTransactions,
        resetToDefaultMock,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

export default FinanceContext;
