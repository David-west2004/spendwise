import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

export default function OverviewStats({ totalSpent = 0, totalAdded = 0, currencySymbol: propCurrencySymbol }) {
  const { currencySymbol: contextCurrencySymbol } = useFinance?.() || {};
  const currencySymbol = propCurrencySymbol || contextCurrencySymbol;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Money Added (Soft Green) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-emerald-100 dark:border-emerald-900/50 shadow-sm relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
            Total Money Added
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40">
            <ArrowDownLeft className="w-4 h-4 text-brand-accent stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            +{formatNaira(totalAdded, { currency: currencySymbol })}
          </p>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-brand-primary dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-brand-accent shrink-0" />
            <span>Allowances & cash recorded</span>
          </div>
        </div>
      </div>

      {/* Total Spent (Soft Red) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-red-100 dark:border-rose-900/50 shadow-sm relative overflow-hidden group hover:border-red-200 dark:hover:border-rose-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-rose-950/40 text-brand-danger dark:text-rose-400 flex items-center justify-center border border-red-100 dark:border-rose-800/40">
            <ArrowUpRight className="w-4 h-4 text-brand-danger stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            -{formatNaira(totalSpent, { currency: currencySymbol })}
          </p>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-brand-danger dark:text-rose-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-brand-danger shrink-0" />
            <span>Campus expenses & purchases</span>
          </div>
        </div>
      </div>
    </div>
  );
}
