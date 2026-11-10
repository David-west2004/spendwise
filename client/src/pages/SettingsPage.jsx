import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Settings,
  Shield,
  RefreshCw,
  Check,
  Sun,
  Moon,
  Bell,
  Coins,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useFinance();
  const [currency, setCurrency] = useState(() => localStorage.getItem('spendwise_currency') || globalCurrency || 'Nigerian Naira (₦)');
  const [frequency, setFrequency] = useState(() => localStorage.getItem('spendwise_frequency') || 'Weekly');
  const [budgetPeriod, setBudgetPeriod] = useState(() => localStorage.getItem('spendwise_budget_period') || 'Monthly');

  // Appearance state - initialize directly from localStorage
  const [appearance, setAppearance] = useState(() => {
    return localStorage.getItem('spendwise_theme') || 'Light';
  });

  // Reminder toggles
  const [budgetAlerts, setBudgetAlerts] = useState(() => {
    return localStorage.getItem('spendwise_remind_budget') !== 'false';
  });
  const [dailyReminders, setDailyReminders] = useState(() => {
    return localStorage.getItem('spendwise_remind_daily') !== 'false';
  });
  const [goalAlerts, setGoalAlerts] = useState(() => {
    return localStorage.getItem('spendwise_remind_goals') !== 'false';
  });

  const [savedToast, setSavedToast] = useState(false);

  // Sync with global currency if changed externally
  useEffect(() => {
    if (globalCurrency) {
      setCurrency(globalCurrency);
    }
  }, [globalCurrency]);

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('spendwise_currency', newCurrency);
    if (setGlobalCurrency) {
      setGlobalCurrency(newCurrency);
    }
  };

  // Synchronously update documentElement class & localStorage
  const applyTheme = (selectedTheme) => {
    setAppearance(selectedTheme);
    localStorage.setItem('spendwise_theme', selectedTheme);

    if (selectedTheme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Keep DOM in sync if appearance changes via other means
  useEffect(() => {
    if (appearance === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearance]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('spendwise_currency', currency);
    if (setGlobalCurrency) {
      setGlobalCurrency(currency);
    }
    localStorage.setItem('spendwise_frequency', frequency);
    localStorage.setItem('spendwise_budget_period', budgetPeriod);
    localStorage.setItem('spendwise_remind_budget', budgetAlerts.toString());
    localStorage.setItem('spendwise_remind_daily', dailyReminders.toString());
    localStorage.setItem('spendwise_remind_goals', goalAlerts.toString());

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset app data? This resets locally recorded tracker transactions, balances, and notifications to default sample data.'
      )
    ) {
      localStorage.removeItem('spendwise_transactions');
      localStorage.removeItem('spendwise_balance');
      localStorage.removeItem('spendwise_total_spent');
      localStorage.removeItem('spendwise_total_added');
      localStorage.removeItem('spendwise_notifications');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control how SpendWise looks, feels, and behaves.
          </p>
        </div>
        {savedToast && (
          <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 shadow-sm animate-fade-in">
            <Check className="w-4 h-4" /> Preferences Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Appearance & Theme Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-5 transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#157347] dark:text-emerald-400" /> Appearance & Theme
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white text-sm block">
                Color Mode
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Instantly switch between high-contrast crisp light view and dark theme.
              </span>
            </div>

            {/* Quick Segmented Toggle Buttons */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-700/80 rounded-2xl border border-gray-200 dark:border-gray-600 shrink-0">
              <button
                type="button"
                onClick={() => applyTheme('Light')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appearance === 'Light'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => applyTheme('Dark')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  appearance === 'Dark'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Select Dropdown Alternative */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white text-sm block">
                Theme Preset
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Choose standard system theme preference.
              </span>
            </div>
            <select
              value={appearance}
              onChange={(e) => applyTheme(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500"
            >
              <option value="Light" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Light Mode
              </option>
              <option value="Dark" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Dark Mode
              </option>
            </select>
          </div>
        </div>

        {/* General Financial Preferences */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-5 transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#157347] dark:text-emerald-400" /> Financial Preferences
          </h2>

          {/* Currency */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white text-sm block">
                Display Currency
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Default currency symbol used across balances and logs.
              </span>
            </div>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500"
            >
              <option value="Nigerian Naira (₦)" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Nigerian Naira (₦)
              </option>
              <option value="US Dollar ($)" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                US Dollar ($)
              </option>
              <option value="British Pound (£)" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                British Pound (£)
              </option>
            </select>
          </div>

          {/* Default Income Frequency */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white text-sm block">
                Default Income Frequency
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Pre-selected cadence when recording pocket money.
              </span>
            </div>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500"
            >
              <option value="Weekly" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Weekly
              </option>
              <option value="Monthly" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Monthly
              </option>
              <option value="Occasional" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Random / Occasional
              </option>
            </select>
          </div>

          {/* Budget Period */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white text-sm block">
                Budget Evaluation Period
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Cycle used for calculating Safe-to-Spend allowances.
              </span>
            </div>
            <select
              value={budgetPeriod}
              onChange={(e) => setBudgetPeriod(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500"
            >
              <option value="Monthly" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Monthly
              </option>
              <option value="Weekly" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                Weekly
              </option>
            </select>
          </div>
        </div>

        {/* Reminder & Alert Toggles (AGENT.md Section 3.10) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
          <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#157347] dark:text-emerald-400" /> Notifications & Reminders
          </h2>

          {/* Budget Overrun Alert */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Budget Overrun Warnings
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alert me whenever category spending exceeds 75% of limit.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#157347]"></div>
            </label>
          </div>

          {/* Daily Logging Reminder */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Daily Expense Prompts (8:00 PM)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive evening notifications to log final food or commute costs.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={dailyReminders}
                onChange={(e) => setDailyReminders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#157347]"></div>
            </label>
          </div>

          {/* Goal Milestones */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Savings Goal Milestones
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Celebrate key progress steps toward laptop or emergency funds.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={goalAlerts}
                onChange={(e) => setGoalAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#157347]"></div>
            </label>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#157347] hover:bg-[#0D4428] text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>Save Preferences</span>
        </button>
      </form>

      {/* Account & Danger Zone */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
        <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-600" /> Account & Data
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Reset App Data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              Resetting restores locally recorded tracker entries, sample balances, and notifications back to defaults.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-sm rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
