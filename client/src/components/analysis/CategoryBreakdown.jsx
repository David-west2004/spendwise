import React from 'react';
import {
  Utensils,
  Bus,
  Smartphone,
  BookOpen,
  MoreHorizontal,
  Home,
  Wifi,
  Film,
  Wallet,
  Briefcase,
  Award,
  Gift,
  Tag,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import ProgressBar from '../common/ProgressBar';

const iconMap = {
  utensils: Utensils,
  bus: Bus,
  wifi: Smartphone,
  smartphone: Smartphone,
  'book-open': BookOpen,
  home: Home,
  film: Film,
  wallet: Wallet,
  briefcase: Briefcase,
  award: Award,
  gift: Gift,
};

function resolveIcon(icon) {
  if (!icon) return MoreHorizontal;
  if (typeof icon === 'function' || typeof icon === 'object') return icon;
  const key = icon.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return iconMap[key] || MoreHorizontal;
}

const defaultCategoryData = [
  {
    name: 'Food & Cafeteria',
    percentage: 40,
    amount: 14000,
    icon: Utensils,
    color: 'bg-emerald-600',
    barBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    tagBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  {
    name: 'Transport & Shuttle',
    percentage: 24,
    amount: 8400,
    icon: Bus,
    color: 'bg-blue-600',
    barBg: 'bg-blue-50 dark:bg-blue-950/30',
    tagBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
  },
  {
    name: 'Data & Airtime',
    percentage: 16,
    amount: 5600,
    icon: Smartphone,
    color: 'bg-cyan-600',
    barBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    tagBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
  },
  {
    name: 'Course Handouts & Books',
    percentage: 12,
    amount: 4200,
    icon: BookOpen,
    color: 'bg-purple-600',
    barBg: 'bg-purple-50 dark:bg-purple-950/30',
    tagBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
  },
  {
    name: 'Entertainment & Snacks',
    percentage: 8,
    amount: 2800,
    icon: MoreHorizontal,
    color: 'bg-amber-600',
    barBg: 'bg-amber-50 dark:bg-amber-950/30',
    tagBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  },
];

export default function CategoryBreakdown({ categories = defaultCategoryData }) {
  const { currencySymbol } = useFinance?.() || {};
  const displayList = categories.length > 0 ? categories : defaultCategoryData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Category Breakdown</h3>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">Where your money went this month</p>
        </div>
        <span className="text-xs font-semibold text-brand-primary dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/40">
          {displayList.length} Categories Active
        </span>
      </div>

      <div className="space-y-5">
        {displayList.map((cat, idx) => {
          const Icon = resolveIcon(cat.icon);
          const colorClass = cat.color || 'bg-emerald-600';
          const barBgClass = cat.barBg || 'bg-emerald-50 dark:bg-emerald-950/30';
          const tagBgClass = cat.tagBg || 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';

          return (
            <div key={cat.name || idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${tagBgClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white sm:text-sm">{cat.name}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900 dark:text-white sm:text-sm">
                    {formatNaira(cat.amount)}
                  </span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${tagBgClass}`}>
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                value={cat.percentage}
                max={100}
                color={colorClass}
                bgColor={barBgClass}
                size="md"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
