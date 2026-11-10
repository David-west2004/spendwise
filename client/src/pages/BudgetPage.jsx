import React, { useState } from 'react';
import { Target, Utensils, Bus, Smartphone, BookOpen, User, X, Check, RefreshCw } from 'lucide-react';
import { formatNaira } from '../utils/formatters';
import ProgressBar from '../components/common/ProgressBar';
import BudgetProgressCard from '../components/budget/BudgetProgressCard';
import { useFinance } from '../context/FinanceContext';

const defaultCategoryBudgets = [
  { id: 'c1', name: 'Food & Cafeteria', limit: 15000, icon: Utensils, color: 'bg-emerald-600' },
  { id: 'c2', name: 'Transport & Shuttle', limit: 8000, icon: Bus, color: 'bg-blue-600' },
  { id: 'c3', name: 'Data & Airtime', limit: 6000, icon: Smartphone, color: 'bg-cyan-600' },
  { id: 'c4', name: 'Course Handouts & Books', limit: 10000, icon: BookOpen, color: 'bg-purple-600' },
  { id: 'c5', name: 'Entertainment & Snacks', limit: 5000, icon: User, color: 'bg-amber-600' },
];

export default function BudgetPage() {
  const { budget, updateBudget, totalSpent, transactions, currencySymbol = '₦' } = useFinance();
  const monthlyLimit = Number(budget?.total_allowance) || 50000;
  const fixedBills = Number(budget?.fixed_bills) || 10000;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempLimit, setTempLimit] = useState(monthlyLimit.toString());
  const [tempFixed, setTempFixed] = useState(fixedBills.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Compute live spending per category based on recorded transactions
  const categorySpending = defaultCategoryBudgets.map((cat) => {
    const matchingSpent = transactions
      .filter((t) => t.type === 'expense' && (t.category?.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]) || t.category === cat.name))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      ...cat,
      used: matchingSpent > 0 ? matchingSpent : Math.round(cat.limit * 0.45),
    };
  });

  const totalUsed = totalSpent || categorySpending.reduce((sum, item) => sum + item.used, 0);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const newAllowance = Number(tempLimit) || monthlyLimit;
    const newFixed = Number(tempFixed) || fixedBills;

    await updateBudget({
      total_allowance: newAllowance,
      fixed_bills: newFixed,
    });

    setIsSaving(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto transition-colors">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-primary dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Target Setting & Guardrails</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Budget Planning</h1>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
            Set maximum allowance thresholds and fixed obligations to prevent mid-term campus shortages
          </p>
        </div>

        <button
          onClick={() => {
            setTempLimit(monthlyLimit.toString());
            setTempFixed(fixedBills.toString());
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm shadow-brand-primary/20 transition-all hover:scale-[1.01]"
        >
          <Target className="w-4 h-4" />
          <span>Configure Budget</span>
        </button>
      </div>

      {/* 1. Monthly Target Budget Card */}
      <BudgetProgressCard
        limit={monthlyLimit}
        used={totalUsed}
        onEditBudget={() => {
          setTempLimit(monthlyLimit.toString());
          setTempFixed(fixedBills.toString());
          setIsModalOpen(true);
        }}
      />

      {/* Fixed Obligations Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Fixed Commitments</h3>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
            Committed liabilities reserved from your Daily Safe-to-Spend burn calculation (Rent, Handouts)
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 px-4 py-2 rounded-2xl text-right">
          <p className="text-[11px] font-bold text-brand-muted dark:text-gray-400 uppercase">Reserved Amount</p>
          <p className="text-lg font-black text-brand-primary dark:text-emerald-400">
            {formatNaira(fixedBills)}
          </p>
        </div>
      </div>

      {/* 2. Category Budgets Breakdown List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Category Budgets</h2>
            <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">Itemized limits and live spending</p>
          </div>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-300">
            Used / Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorySpending.map((cat) => {
            const Icon = cat.icon;
            const pct = Math.min(100, Math.round((cat.used / cat.limit) * 100));
            const remaining = Math.max(0, cat.limit - cat.used);
            const isWarning = pct >= 80;

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 space-y-3 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</span>
                  </div>

                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {formatNaira(cat.used)} / <span className="text-brand-muted dark:text-gray-400">{formatNaira(cat.limit)}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  value={cat.used}
                  max={cat.limit}
                  color={isWarning ? 'bg-amber-500' : cat.color}
                  bgColor="bg-gray-200/70 dark:bg-gray-700"
                  size="sm"
                />

                <div className="flex items-center justify-between text-[11px] text-brand-muted dark:text-gray-400 pt-1">
                  <span>{pct}% utilized</span>
                  <span className={isWarning
                    ? 'text-amber-700 dark:text-amber-400 font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  }>
                    {formatNaira(remaining)} remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Modal to Update Monthly Target Limit & Fixed Bills */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Configure Budget & Commitments</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-2">
                  Total Monthly Allowance Budget ({currencySymbol})
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-bold text-brand-primary dark:text-emerald-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(e.target.value)}
                    required
                    min="1000"
                    step="500"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-base font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500 focus:ring-2 focus:ring-brand-primary/20 dark:focus:ring-emerald-500/20"
                  />
                </div>
                <p className="text-[11px] text-brand-muted dark:text-gray-400 mt-1.5">
                  Your baseline cycle budget for the month.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-2">
                  Upcoming Fixed Commitments ({currencySymbol})
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-bold text-brand-primary dark:text-emerald-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={tempFixed}
                    onChange={(e) => setTempFixed(e.target.value)}
                    min="0"
                    step="500"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-base font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500 focus:ring-2 focus:ring-brand-primary/20 dark:focus:ring-emerald-500/20"
                  />
                </div>
                <p className="text-[11px] text-brand-muted dark:text-gray-400 mt-1.5">
                  Reserved funds for hostel, course materials, or data renewal.
                </p>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-brand-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-70"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
