import React from 'react';
import { Receipt, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Receipt,
  title = 'No transactions yet',
  message = 'Add money or record expenses to get started',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-brand-muted dark:text-gray-400 flex items-center justify-center mb-3.5 shadow-sm">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-xs text-brand-muted dark:text-gray-400 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center space-x-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
