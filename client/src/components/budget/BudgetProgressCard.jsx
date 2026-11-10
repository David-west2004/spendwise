import React from 'react';
import { Target, TrendingUp, AlertCircle, Edit3 } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';

export default function BudgetProgressCard({
  limit = 50000,
  used = 32000,
  onEditBudget,
}) {
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = percentage >= 80;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40">
            <Target className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Monthly Target Budget</h2>
            <p className="text-xs text-brand-muted dark:text-gray-400">Overall planned spending cap</p>
          </div>
        </div>

        {onEditBudget && (
          <button
            onClick={onEditBudget}
            className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-semibold border border-gray-200 dark:border-gray-600 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Budget</span>
          </button>
        )}
      </div>

      {/* Figures Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] font-semibold text-brand-muted dark:text-gray-400 uppercase">Target Limit</p>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
            {formatNaira(limit)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">Amount Used</p>
          <p className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
            {formatNaira(used)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Remaining Funds</p>
          <p className="text-xl sm:text-2xl font-black text-brand-primary dark:text-emerald-400 mt-1">
            {formatNaira(remaining)}
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 dark:text-white">Budget Utilization</span>
            {isNearLimit && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-danger dark:text-rose-400 bg-red-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-rose-900/50">
                <AlertCircle className="w-3 h-3" />
                <span>Near Limit</span>
              </span>
            )}
          </div>
          <span className={isNearLimit ? 'text-brand-danger dark:text-rose-400 font-black' : 'text-brand-primary dark:text-emerald-400 font-black'}>
            {percentage}% used
          </span>
        </div>

        <ProgressBar
          value={used}
          max={limit}
          color={isNearLimit ? 'bg-brand-danger' : 'bg-brand-primary'}
          bgColor={isNearLimit ? 'bg-red-100 dark:bg-rose-950/40' : 'bg-emerald-100 dark:bg-emerald-950/40'}
          size="lg"
        />
      </div>
    </div>
  );
}
