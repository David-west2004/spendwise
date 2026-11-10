import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle } from 'lucide-react';

export default function QuickActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Add Money (Green primary button) */}
      <button
        onClick={() => navigate('/add-money')}
        className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <PlusCircle className="w-5 h-5 shrink-0 stroke-[2.2]" />
        <span>+ Add Money</span>
      </button>

      {/* Add Expense (Secondary / Outline button) */}
      <button
        onClick={() => navigate('/add-expense')}
        className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-red-50/50 dark:hover:bg-rose-950/40 text-brand-danger dark:text-rose-400 border-2 border-red-200/80 dark:border-rose-900/60 hover:border-brand-danger dark:hover:border-rose-700 text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <MinusCircle className="w-5 h-5 shrink-0 stroke-[2.2]" />
        <span>− Add Expense</span>
      </button>
    </div>
  );
}
