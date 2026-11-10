import React from 'react';
import { PiggyBank, PlusCircle, Sparkles } from 'lucide-react';
import { formatNaira } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';

export default function GoalCard({ goal, onContribute }) {
  const { id, name, target, saved, category = 'General', icon: Icon = PiggyBank } = goal;
  const percentage = Math.min(100, Math.round((saved / target) * 100));
  const remaining = Math.max(0, target - saved);
  const isCompleted = saved >= target;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-gray-200 dark:hover:border-gray-600 transition-all hover:shadow-md">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40 shrink-0">
              <Icon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-[11px] text-brand-muted dark:text-gray-400 mt-0.5">{category}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isCompleted
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
          }`}>
            {isCompleted ? 'Goal Met! 🎉' : `${percentage}% Saved`}
          </span>
        </div>

        {/* Figures Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 bg-gray-50/70 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100/80 dark:border-gray-700">
          <div>
            <p className="text-[10px] font-semibold text-brand-muted dark:text-gray-400 uppercase">Saved So Far</p>
            <p className="text-lg font-black text-brand-primary dark:text-emerald-400 mt-0.5">{formatNaira(saved)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-brand-muted dark:text-gray-400 uppercase">Target Goal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatNaira(target)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-brand-muted dark:text-gray-400">
            <span>Progress towards target</span>
            <span className="font-semibold text-gray-900 dark:text-white">{percentage}%</span>
          </div>
          <ProgressBar value={saved} max={target} color={isCompleted ? 'bg-brand-primary' : 'bg-emerald-600'} bgColor="bg-gray-200/80 dark:bg-gray-700" size="md" />
          <div className="flex justify-between items-center text-[11px] pt-1">
            <span className="text-gray-500 dark:text-gray-400">
              {isCompleted ? 'Target achieved!' : `${formatNaira(remaining)} remaining`}
            </span>
            {!isCompleted && (
              <span className="text-brand-primary dark:text-emerald-400 font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-brand-accent" /><span>Keep going!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onContribute(goal)}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 text-brand-primary dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-200/60 dark:border-emerald-800/40 active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" /><span>Record Contribution</span>
        </button>
      </div>
    </div>
  );
}
