import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/dashboard/BalanceCard';
import OverviewStats from '../components/dashboard/OverviewStats';
import QuickActionButtons from '../components/dashboard/QuickActionButtons';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { ShieldCheck, Sparkles, RefreshCcw, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { balance, totalSpent, totalAdded, transactions, safeToSpendData, clearAllTransactions, resetToDefaultMock, currencySymbol } = useFinance();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showGreetingNotice, setShowGreetingNotice] = useState(true);

  // Use backend safe-to-spend calculation if available, otherwise compute client fallback
  const daysLeftInMonth = safeToSpendData?.days_remaining || 12;
  const safeDailySpend = safeToSpendData?.daily_safe_spend !== undefined
    ? safeToSpendData.daily_safe_spend
    : (balance > 0 ? Math.round(balance / daysLeftInMonth) : 0);

  return (
    <div className="space-y-6 transition-colors">
      {/* Welcome / Good Morning Banner (AGENT.md Section 3.1) */}
      {showGreetingNotice && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-gray-800 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-colors">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Good morning, {(user?.name || (typeof window !== 'undefined' ? localStorage.getItem('spendwise_name') : null) || 'Student').split(' ')[0]}! ☀️
              </h2>
              <p className="text-xs text-brand-muted dark:text-gray-300 mt-0.5 leading-relaxed">
                Ready to manage your funds today? Remember to record yesterday's final allowance or expenses.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => navigate('/add-expense')}
              className="text-xs font-bold text-brand-primary dark:text-emerald-400 hover:text-brand-hover dark:hover:text-emerald-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm transition-colors"
            >
              Record Now
            </button>
            <button
              onClick={() => setShowGreetingNotice(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 1. Hero Balance Card */}
      <BalanceCard
        balance={balance}
        safeToSpendDaily={safeDailySpend}
        daysLeft={daysLeftInMonth}
        healthStatus={safeToSpendData?.health_status || 'ON_TRACK'}
        currencySymbol={currencySymbol}
      />

      {/* 2. Quick Action Buttons (+ Add Money, − Add Expense) */}
      <QuickActionButtons />

      {/* 3. Overview Split Cards (Total Money Added vs Total Spent) */}
      <OverviewStats
        totalSpent={totalSpent}
        totalAdded={totalAdded}
        currencySymbol={currencySymbol}
      />

      {/* 4. Recent Transactions Feed */}
      <RecentTransactions
        transactions={transactions}
        currencySymbol={currencySymbol}
        onAddFirst={() => navigate('/add-money')}
      />

      {/* Testing Toolbar (Allows testing EmptyState vs Mock data easily) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-brand-muted dark:text-gray-400 transition-colors">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-primary dark:bg-emerald-400"></span>
          <span className="font-semibold text-gray-900 dark:text-white">Active Ledger:</span>
          <span>{transactions.length} recorded entries</span>
        </div>

        <div className="flex items-center space-x-2">
          {transactions.length > 0 ? (
            <button
              onClick={clearAllTransactions}
              className="text-xs font-medium text-brand-danger dark:text-rose-400 hover:underline px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Test Empty State
            </button>
          ) : (
            <button
              onClick={resetToDefaultMock}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-primary dark:text-emerald-400 hover:underline px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Restore Mock Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational Disclaimer (AGENT.md Section 1) */}
      <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 text-center py-2">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-primary dark:text-emerald-400 shrink-0" />
        <span>
          SpendWise only records your money activity. It does not send money, receive payments, or connect to bank accounts. No banking • No transfers.
        </span>
      </div>
    </div>
  );
}
