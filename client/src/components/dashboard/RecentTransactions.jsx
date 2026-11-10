import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Bus,
  BookOpen,
  Smartphone,
  ShoppingBag,
  Receipt,
  Tv,
  HeartPulse,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import EmptyState from '../common/EmptyState';

const categoryIcons = {
  'Food & Drinks': { icon: Utensils, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/40' },
  'Food & Cafeteria': { icon: Utensils, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/40' },
  'Transport': { icon: Bus, bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/40' },
  'Transport & Shuttle': { icon: Bus, bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/40' },
  'School Supplies / Books': { icon: BookOpen, bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800/40' },
  'Course Handouts & Books': { icon: BookOpen, bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800/40' },
  'Data / Airtime': { icon: Smartphone, bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-100 dark:border-cyan-800/40' },
  'Data & Airtime': { icon: Smartphone, bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-100 dark:border-cyan-800/40' },
  'Hostel & Rent': { icon: Receipt, bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-800/40' },
  'Shopping': { icon: ShoppingBag, bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border-pink-100 dark:border-pink-800/40' },
  'Bills': { icon: Receipt, bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-800/40' },
  'Subscriptions': { icon: Tv, bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/40' },
  'Health': { icon: HeartPulse, bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-800/40' },
  'Entertainment & Snacks': { icon: Tv, bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 border-pink-100 dark:border-pink-800/40' },
  'Allowance': { icon: ArrowDownLeft, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40' },
  'Monthly Allowance': { icon: ArrowDownLeft, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40' },
  'Income': { icon: ArrowDownLeft, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40' },
  'Side Hustle': { icon: ArrowDownLeft, bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border-teal-100 dark:border-teal-800/40' },
  'Scholarship/Stipend': { icon: ArrowDownLeft, bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-100 dark:border-cyan-800/40' },
};

export default function RecentTransactions({ transactions = [], onAddFirst, currencySymbol: propCurrencySymbol }) {
  const { currencySymbol: contextCurrencySymbol } = useFinance?.() || {};
  const currencySymbol = propCurrencySymbol || contextCurrencySymbol;
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        message="Add money or record expenses to get started"
        actionLabel="Record Transaction"
        onAction={onAddFirst}
      />
    );
  }

  // Display only the 5 most recent
  const displayedTransactions = transactions.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">Your latest recorded entries</p>
        </div>
        <Link
          to="/expenses"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-primary dark:text-emerald-400 hover:text-brand-hover dark:hover:text-emerald-300 hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {displayedTransactions.map((tx) => {
          const isIncome = tx.type === 'income' || tx.amount > 0;
          const categoryMeta = categoryIcons[tx.category] || {
            icon: isIncome ? ArrowDownLeft : Wallet,
            bg: isIncome
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700',
          };
          const Icon = categoryMeta.icon;

          return (
            <div
              key={tx.id}
              className="py-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 px-2 -mx-2 rounded-2xl transition-colors"
            >
              {/* Left: Category Icon & Details */}
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${categoryMeta.bg}`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {tx.title || tx.note || tx.category}
                  </p>
                  <div className="flex items-center space-x-2 text-[11px] text-brand-muted dark:text-gray-400 mt-0.5">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right shrink-0 pl-3">
                <p
                  className={`text-sm font-bold tracking-tight ${
                    isIncome ? 'text-brand-primary dark:text-emerald-400' : 'text-brand-danger dark:text-rose-400'
                  }`}
                >
                  {isIncome ? `+${formatNaira(Math.abs(tx.amount), { currency: currencySymbol })}` : `-${formatNaira(Math.abs(tx.amount), { currency: currencySymbol })}`}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {isIncome ? 'Money in' : 'Money out'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
