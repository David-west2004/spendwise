import React, { useState } from 'react';
import {
  MinusCircle,
  Utensils,
  Bus,
  BookOpen,
  ShoppingBag,
  Receipt,
  Smartphone,
  Tv,
  HeartPulse,
  Plus,
  Sparkles,
  AlertTriangle,
  Home,
  Film,
  Tag,
} from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

const defaultCategoryPresets = [
  { name: 'Food & Cafeteria', icon: Utensils },
  { name: 'Transport & Shuttle', icon: Bus },
  { name: 'Course Handouts & Books', icon: BookOpen },
  { name: 'Data & Airtime', icon: Smartphone },
  { name: 'Hostel & Rent', icon: Home },
  { name: 'Entertainment & Snacks', icon: Film },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Bills', icon: Receipt },
  { name: '+ Custom / Other', icon: Plus },
];

const iconMap = {
  utensils: Utensils,
  bus: Bus,
  'book-open': BookOpen,
  wifi: Smartphone,
  smartphone: Smartphone,
  home: Home,
  film: Film,
  shopping: ShoppingBag,
  receipt: Receipt,
};

function resolveIcon(icon) {
  if (!icon) return Tag;
  if (typeof icon === 'function' || typeof icon === 'object') return icon;
  const key = icon.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return iconMap[key] || Tag;
}

const quickPresets = [500, 1000, 2500, 5000, 10000];

export default function AddExpenseForm({ currentBalance = 0, onSubmitSuccess }) {
  const { categories: backendCategories, currencySymbol = '₦' } = useFinance();

  // Filter expense categories from backend
  const availableCategories = (backendCategories && backendCategories.length > 0)
    ? [
        ...backendCategories
          .filter((c) => c.type === 'expense')
          .map((c) => ({ name: c.name, icon: resolveIcon(c.icon) })),
        { name: '+ Custom / Other', icon: Plus },
      ]
    : defaultCategoryPresets;

  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(availableCategories[0]?.name || 'Food & Cafeteria');
  const [customCategory, setCustomCategory] = useState('');
  const [note, setNote] = useState('');
  const [dateType, setDateType] = useState('Today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const numericAmount = Math.max(0, Number(amountStr) || 0);
  const afterDeduction = currentBalance - numericAmount;
  const isOverspending = numericAmount > currentBalance;

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmountStr(val);
    if (error) setError('');
  };

  const handlePresetClick = (presetVal) => {
    setAmountStr(presetVal.toString());
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }

    const finalCategory =
      selectedCategory === '+ Custom / Other'
        ? (customCategory.trim() || 'Custom / Other')
        : selectedCategory;

    const finalDate = dateType === 'Custom' ? customDate : dateType;

    const payload = {
      type: 'expense',
      amount: numericAmount,
      category: finalCategory,
      title: note.trim() || finalCategory,
      date: finalDate,
      transaction_date: dateType === 'Custom' ? customDate : (dateType === 'Yesterday' ? new Date(Date.now() - 86400000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
    };

    onSubmitSuccess(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Large Numeric Amount Input */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm text-center transition-colors">
        <label
          htmlFor="expense-amount-input"
          className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-2"
        >
          Amount Spent
        </label>

        <div className="relative inline-flex items-center justify-center max-w-xs sm:max-w-md w-full">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-danger mr-1 select-none">
            {currencySymbol}
          </span>
          <input
            id="expense-amount-input"
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={handleAmountChange}
            placeholder="0.00"
            autoFocus
            className="w-full text-3xl sm:text-4xl lg:text-5xl font-black text-brand-darkText dark:text-white tracking-tight bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-brand-danger focus:outline-none text-center pb-2 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
        </div>

        {error && (
          <p className="text-xs text-brand-danger font-medium mt-3 animate-in fade-in">
            {error}
          </p>
        )}

        {/* Quick Amount Presets */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {quickPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="text-xs font-semibold py-1.5 px-3 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-200 hover:text-brand-danger dark:hover:text-rose-400 border border-gray-200 dark:border-gray-600 hover:border-red-200 transition-colors"
            >
              -{formatNaira(preset, { showDecimals: false })}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Pill Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3 transition-colors">
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
          Select Category
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {availableCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/25 font-bold scale-[1.02]'
                    : 'bg-gray-50/70 dark:bg-gray-700/70 hover:bg-gray-100/80 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Category Input if "+ Custom / Other" is picked */}
        {selectedCategory === '+ Custom / Other' && (
          <div className="pt-3 animate-in fade-in">
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category name (e.g. Cinema, Laundry, Dues)"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs text-brand-darkText dark:text-white focus:outline-none focus:border-brand-primary focus:bg-white dark:focus:bg-gray-600"
            />
          </div>
        )}
      </div>

      {/* 3. Date & Note Input */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 transition-colors">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-2">
            Expense Date
          </label>
          <div className="flex items-center space-x-2">
            {['Today', 'Yesterday', 'Custom'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDateType(d)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                  dateType === d
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {dateType === 'Custom' && (
            <div className="mt-2.5">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs text-brand-darkText dark:text-white bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}
        </div>

        {/* Note / Details */}
        <div>
          <label
            htmlFor="expense-note"
            className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5"
          >
            Item Details / Note (Optional)
          </label>
          <input
            id="expense-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. MEE 302 textbook, Dinner at fast food, Campus taxi"
            className="w-full px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-brand-darkText dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-danger focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-brand-danger/20 transition-all"
          />
        </div>
      </div>

      {/* 4. Dynamic Live Calculation Card */}
      <div
        className={`rounded-3xl p-6 space-y-3 transition-colors ${
          isOverspending
            ? 'bg-red-50/90 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 text-red-950 dark:text-rose-200'
            : 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
            <span>Dynamic Preview Calculation</span>
          </div>
          {isOverspending && (
            <span className="flex items-center space-x-1 text-[11px] font-bold text-brand-danger bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-red-200 dark:border-rose-900">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Exceeds balance</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50 dark:border-gray-700">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Current available:</p>
            <p className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">
              {formatNaira(currentBalance)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">After deduction:</p>
            <p
              className={`text-base sm:text-lg font-extrabold mt-0.5 ${
                afterDeduction < 0 ? 'text-brand-danger dark:text-rose-400' : 'text-brand-darkText dark:text-white'
              }`}
            >
              {formatNaira(afterDeduction)}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Primary Submit Button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-brand-danger hover:bg-red-600 text-white text-base font-bold shadow-lg shadow-red-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <MinusCircle className="w-5 h-5 stroke-[2.2]" />
        <span>Record Expense</span>
      </button>
    </form>
  );
}
