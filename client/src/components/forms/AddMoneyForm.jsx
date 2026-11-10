import React, { useState } from 'react';
import { PlusCircle, Wallet, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

const frequencies = ['Weekly', 'Monthly', 'Random / Occasional'];
const quickPresets = [2000, 5000, 10000, 20000, 50000];

export default function AddMoneyForm({ currentBalance = 0, onSubmitSuccess }) {
  const { currencySymbol = '₦' } = useFinance?.() || {};
  const [amountStr, setAmountStr] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Allowance');
  const [error, setError] = useState('');

  // Parsed numeric amount
  const numericAmount = Math.max(0, Number(amountStr) || 0);
  const afterAddingBalance = currentBalance + numericAmount;

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
      setError('Please enter a valid amount to add.');
      return;
    }

    const payload = {
      type: 'income',
      amount: numericAmount,
      frequency,
      title: note.trim() || `${frequency} Allowance`,
      category: category || 'Monthly Allowance',
      date: 'Today',
      transaction_date: new Date().toISOString().slice(0, 10),
    };

    onSubmitSuccess(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Large Numeric Amount Input */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
        <label
          htmlFor="amount-input"
          className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-2"
        >
          Amount to Add
        </label>

        <div className="relative inline-flex items-center justify-center max-w-xs sm:max-w-md w-full">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-primary mr-1 select-none">
            {currencySymbol}
          </span>
          <input
            id="amount-input"
            type="text"
            inputMode="decimal"
            value={amountStr}
            onChange={handleAmountChange}
            placeholder="0.00"
            autoFocus
            className="w-full text-3xl sm:text-4xl lg:text-5xl font-black text-brand-darkText dark:text-white tracking-tight bg-transparent border-b-2 border-gray-200 dark:border-gray-600 focus:border-brand-primary dark:focus:border-emerald-500 focus:outline-none text-center pb-2 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600"
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
              className="text-xs font-semibold py-1.5 px-3 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors"
            >
              +{formatNaira(preset, { showDecimals: false })}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Frequency Selector Pills */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400">
          Allowance / Frequency
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {frequencies.map((freq) => {
            const isActive = frequency === freq;
            return (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`py-3 px-4 rounded-2xl text-xs font-bold border text-center transition-all flex items-center justify-center space-x-1.5 ${
                  isActive
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/25'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-brand-muted dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:text-brand-darkText dark:hover:text-white'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5" />}
                <span>{freq}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Optional Note & Source Category */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div>
          <label
            htmlFor="note-input"
            className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5"
          >
            Optional Note / Source
          </label>
          <input
            id="note-input"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Extra money from home, SIWES stipend, gift"
            className="w-full px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-brand-darkText dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
      </div>

      {/* 4. Dynamic Live Calculation Card */}
      <div className="rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 p-6 space-y-3">
        <div className="flex items-center space-x-2 text-brand-primary dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
          <span>Dynamic Preview Calculation</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Current available:</p>
            <p className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200 mt-0.5">
              {formatNaira(currentBalance)}
            </p>
          </div>

          <div>
            <p className="text-[11px] text-brand-primary dark:text-emerald-400 font-medium">After adding:</p>
            <p className="text-base sm:text-lg font-extrabold text-brand-primary dark:text-emerald-400 mt-0.5">
              {formatNaira(afterAddingBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Disclaimer Notice (AGENT.md Section 3.4) */}
      <div className="flex items-start space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This does not send or receive money. It only updates your recorded amount.
        </p>
      </div>

      {/* 6. Primary Submit Button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-base font-bold shadow-lg shadow-brand-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <PlusCircle className="w-5 h-5 stroke-[2.2]" />
        <span>Record Added Money</span>
      </button>
    </form>
  );
}
