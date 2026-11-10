import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

const quickChips = [1000, 2500, 5000, 10000];

export default function ContributeModal({ isOpen, onClose, goal, onConfirm }) {
  const { currencySymbol = '₦' } = useFinance?.() || {};
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const numericAmount = Math.max(0, Number(amountStr) || 0);
  const currentSaved = goal.saved || 0;
  const target = goal.target || 1;
  const newSaved = currentSaved + numericAmount;
  const newPercentage = Math.min(100, Math.round((newSaved / target) * 100));

  const handleChipClick = (val) => {
    setAmountStr(val.toString());
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!numericAmount || numericAmount <= 0) { setError('Please enter a valid contribution amount.'); return; }
    onConfirm({ goalId: goal.id, amount: numericAmount, note: note.trim() });
    setAmountStr(''); setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Record Contribution</h3>
            <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
              Towards: <strong className="text-brand-primary dark:text-emerald-400">{goal.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Contribution Amount</label>
            <div className="relative rounded-2xl shadow-sm">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-bold text-brand-primary dark:text-emerald-400 select-none">{currencySymbol}</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => { setAmountStr(e.target.value.replace(/[^0-9.]/g, '')); if (error) setError(''); }}
                placeholder="0.00"
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-lg font-black text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500 focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
            {error && <p className="text-xs text-brand-danger dark:text-rose-400 font-medium mt-1.5">{error}</p>}

            {/* Quick Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quickChips.map((chip) => (
                <button key={chip} type="button" onClick={() => handleChipClick(chip)}
                  className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                  +{formatNaira(chip, { showDecimals: false })}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Source / Note (Optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Saved from food allowance, gift from aunt"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500" />
          </div>

          {/* Dynamic Preview Card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 text-brand-primary dark:text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" /><span>Projected Goal Progress</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 pt-1">
              <span>Current saved:</span>
              <span className="font-semibold">{formatNaira(currentSaved)}</span>
            </div>
            <div className="flex items-center justify-between text-brand-primary dark:text-emerald-400 font-bold">
              <span>After contribution:</span>
              <span className="text-sm font-extrabold">{formatNaira(newSaved)} ({newPercentage}%)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex space-x-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-brand-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center justify-center space-x-1.5 transition-colors">
              <Check className="w-4 h-4" /><span>Confirm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
