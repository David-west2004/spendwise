import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, RotateCcw, Wallet, TrendingDown, X } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';

export default function SuccessModal({
  isOpen,
  onClose,
  type = 'income',
  title = 'Recorded Successfully! 🎉',
  subtitle,
  amount = 0,
  newBalance = 0,
  onAddAnother,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isIncome = type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-center p-6 sm:p-8 relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge Icon */}
        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg ${
          isIncome
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-brand-primary border border-emerald-100 dark:border-emerald-800/40 shadow-emerald-500/10'
            : 'bg-red-50 dark:bg-rose-950/50 text-brand-danger border border-red-100 dark:border-rose-900/50 shadow-red-500/10'
        }`}>
          {isIncome ? (
            <CheckCircle2 className="w-8 h-8 text-brand-accent stroke-[2.2]" />
          ) : (
            <TrendingDown className="w-8 h-8 text-brand-danger stroke-[2.2]" />
          )}
        </div>

        {/* Heading & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-1.5 leading-relaxed px-2">
            {subtitle}
          </p>
        )}

        {/* Amount & Balance Metrics Card */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-muted dark:text-gray-400 font-medium">
              {isIncome ? 'Amount Added:' : 'Amount Recorded:'}
            </span>
            <span className={`font-bold text-sm ${isIncome ? 'text-brand-primary dark:text-emerald-400' : 'text-brand-danger dark:text-rose-400'}`}>
              {isIncome ? `+${formatNaira(amount)}` : `-${formatNaira(amount)}`}
            </span>
          </div>

          <div className="h-px bg-gray-200/70 dark:bg-gray-600" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-muted dark:text-gray-400 font-medium flex items-center space-x-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>New Available Balance:</span>
            </span>
            <span className="font-extrabold text-base text-gray-900 dark:text-white">
              {formatNaira(newBalance)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => { onClose(); navigate('/dashboard'); }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onAddAnother && (
            <button
              onClick={() => { onClose(); onAddAnother(); }}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 text-xs font-semibold transition-colors border border-gray-200 dark:border-gray-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isIncome ? 'Add Another Money Entry' : 'Record Another Expense'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
