import React, { useState, useEffect } from 'react';
import { Calendar, TrendingDown, Flame, Calculator, Sparkles, PieChart, RefreshCw } from 'lucide-react';
import { formatNaira } from '../utils/formatters';
import CategoryBreakdown from '../components/analysis/CategoryBreakdown';
import { useFinance } from '../context/FinanceContext';
import { fetchAnalyticsSummary } from '../api/transactions';

// Generate dynamic month list (current month and previous 5 months)
function getRecentMonths() {
  const result = [];
  const date = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const iso = d.toISOString().slice(0, 7);
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    result.push({ iso, label });
  }
  return result;
}

export default function AnalysisPage() {
  const { totalSpent: contextTotalSpent, isOnline, currencySymbol } = useFinance();
  const monthOptions = getRecentMonths();
  const [selectedMonthIso, setSelectedMonthIso] = useState(monthOptions[0].iso);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMonthlyAnalytics() {
      setIsLoading(true);
      try {
        const res = await fetchAnalyticsSummary(selectedMonthIso);
        if (isMounted && res?.data) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch analytics for month:', selectedMonthIso, err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMonthlyAnalytics();
    return () => {
      isMounted = false;
    };
  }, [selectedMonthIso]);

  const selectedMonthObj = monthOptions.find((m) => m.iso === selectedMonthIso) || monthOptions[0];

  // Derive metrics
  const totalSpent = analyticsData?.total_expenses !== undefined
    ? Number(analyticsData.total_expenses)
    : (contextTotalSpent || 35000);

  const rawBreakdown = analyticsData?.category_breakdown || [];
  
  // Format categories with percentage of spending
  const formattedCategories = rawBreakdown.map((cat) => {
    const amount = Number(cat.total_amount) || 0;
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    return {
      name: cat.category_name,
      amount,
      percentage,
      icon: cat.category_icon || 'tag',
      color: cat.category_color ? undefined : 'bg-emerald-600',
      customColor: cat.category_color,
    };
  });

  // Calculate highest category
  const highestCategory = formattedCategories.length > 0
    ? formattedCategories[0]
    : { name: 'Food & Cafeteria', percentage: 40, amount: Math.round(totalSpent * 0.4) };

  // Calculate average expense
  const totalTxCount = rawBreakdown.reduce((sum, c) => sum + (Number(c.transaction_count) || 0), 0);
  const averageExpense = totalTxCount > 0 ? Math.round(totalSpent / totalTxCount) : (totalSpent > 0 ? Math.round(totalSpent / 12) : 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto transition-colors">
      {/* Top Header & Month Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-primary dark:text-emerald-400 uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4" />
            <span>Monthly Financial Report</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Spending Analysis</h1>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
            Understand your student burn rate and category allocations
          </p>
        </div>

        {/* Month Dropdown Filter */}
        <div className="flex items-center space-x-3">
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-brand-primary dark:text-emerald-400 animate-spin" />
          )}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Calendar className="w-4 h-4 text-brand-primary dark:text-emerald-400" />
            </div>
            <select
              value={selectedMonthIso}
              onChange={(e) => setSelectedMonthIso(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500 cursor-pointer transition-all"
            >
              {monthOptions.map((m) => (
                <option key={m.iso} value={m.iso} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {m.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row (3 Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spent This Month */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-red-100 dark:border-rose-900/40 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
            <span>Total Spent This Month</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-rose-950/40 text-brand-danger dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-danger dark:text-rose-400 mt-3 tracking-tight">
            -{formatNaira(totalSpent)}
          </p>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-1.5">
            Active in {selectedMonthObj.label}
          </p>
        </div>

        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-amber-100 dark:border-amber-900/40 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
            <span>Highest Spending Category</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
              {highestCategory.name}
            </p>
          </div>
          <div className="mt-1.5 flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              {highestCategory.percentage}% of spending
            </span>
            <span className="text-xs text-brand-muted dark:text-gray-400 font-medium">
              ({formatNaira(highestCategory.amount)})
            </span>
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
            <span>Average Expense</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-3 tracking-tight">
            {formatNaira(averageExpense)}
          </p>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-1.5">
            Per transaction across recorded entries
          </p>
        </div>
      </div>

      {/* Category Breakdown Progress Bars Card */}
      <CategoryBreakdown categories={formattedCategories} />

      {/* Financial Health Tip Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-gray-800 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/40 flex items-start space-x-3.5 text-emerald-950 dark:text-emerald-100 transition-colors">
        <Sparkles className="w-5 h-5 text-brand-primary dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-brand-primary dark:text-emerald-400">Student Budget Advice</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {highestCategory.name} makes up <strong>{highestCategory.percentage}%</strong> of your monthly spending. Pacing your discretionary expenses or bulk-buying staples can help reserve extra funds towards your savings goals!
          </p>
        </div>
      </div>
    </div>
  );
}
