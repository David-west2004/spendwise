import React, { useState } from 'react';
import { PiggyBank, Plus, Laptop, Smartphone, Shield, Sparkles, X, Check } from 'lucide-react';
import { formatNaira } from '../utils/formatters';
import GoalCard from '../components/goals/GoalCard';
import ContributeModal from '../components/goals/ContributeModal';
import { useFinance } from '../context/FinanceContext';

const initialGoals = [
  { id: 'g1', name: 'Laptop Fund', category: 'Academics & Tech', target: 50000, saved: 18000, icon: Laptop },
  { id: 'g2', name: 'New Phone', category: 'Gadgets', target: 150000, saved: 35000, icon: Smartphone },
  { id: 'g3', name: 'Campus Emergency Stash', category: 'Emergency & Safety', target: 30000, saved: 12500, icon: Shield },
];

export default function GoalsPage() {
  const { currencySymbol = '₦' } = useFinance?.() || {};
  const [goals, setGoals] = useState(initialGoals);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Academics & Tech');
  const [formError, setFormError] = useState('');

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreateGoal = (e) => {
    e.preventDefault();
    setFormError('');
    const targetNum = Number(newGoalTarget) || 0;
    const initialNum = Number(newGoalInitial) || 0;
    if (!newGoalName.trim()) { setFormError('Please enter a name for your savings goal.'); return; }
    if (targetNum <= 0) { setFormError('Please specify a target amount greater than zero.'); return; }
    setGoals((prev) => [{ id: `g-${Date.now()}`, name: newGoalName.trim(), category: newGoalCategory, target: targetNum, saved: initialNum, icon: PiggyBank }, ...prev]);
    setNewGoalName(''); setNewGoalTarget(''); setNewGoalInitial('');
    setIsCreateModalOpen(false);
  };

  const handleConfirmContribution = ({ goalId, amount }) => {
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, saved: g.saved + amount } : g));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-primary dark:text-emerald-400 uppercase tracking-wider mb-1">
            <PiggyBank className="w-4 h-4" /><span>Target Savings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">Lock away pocket change towards laptops, project fees, and dream items</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-sm shadow-brand-primary/20 transition-all hover:scale-[1.01]">
          <Plus className="w-4 h-4" /><span>Create Savings Goal</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-gray-800 dark:to-teal-950/40 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm transition-colors">
        <div className="p-2">
          <p className="text-[11px] font-bold text-brand-muted dark:text-gray-400 uppercase">Total Saved So Far</p>
          <p className="text-2xl sm:text-3xl font-black text-brand-primary dark:text-emerald-400 mt-1">{formatNaira(totalSaved)}</p>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">Across {goals.length} active goals</p>
        </div>
        <div className="p-2 border-t sm:border-t-0 sm:border-l border-emerald-200/60 dark:border-emerald-800/40 sm:pl-6">
          <p className="text-[11px] font-bold text-brand-muted dark:text-gray-400 uppercase">Total Target Portfolio</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{formatNaira(totalTarget)}</p>
          <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">{formatNaira(totalTarget - totalSaved)} remaining</p>
        </div>
        <div className="p-2 border-t sm:border-t-0 sm:border-l border-emerald-200/60 dark:border-emerald-800/40 sm:pl-6 flex flex-col justify-center">
          <p className="text-[11px] font-bold text-brand-muted dark:text-gray-400 uppercase">Average Progress</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-brand-primary dark:text-emerald-400">{overallPercentage}%</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">overall completion</span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} onContribute={(selected) => setContributeGoal(selected)} />
        ))}
      </div>

      {/* Contribution Modal */}
      <ContributeModal isOpen={Boolean(contributeGoal)} onClose={() => setContributeGoal(null)} goal={contributeGoal} onConfirm={handleConfirmContribution} />

      {/* Create Savings Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New Savings Goal</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="p-2.5 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-100 dark:border-rose-900/50 text-xs font-semibold text-brand-danger dark:text-rose-400">{formError}</p>
            )}

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Goal Name</label>
                <input type="text" required value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="e.g. Laptop Fund, Hostel Rent, Certification"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500 focus:ring-2 focus:ring-brand-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Target Amount ({currencySymbol})</label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-brand-primary dark:text-emerald-400">{currencySymbol}</span>
                  <input type="number" required min="500" step="500" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="50,000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Initial Deposit (Optional) ({currencySymbol})</label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-brand-primary dark:text-emerald-400">{currencySymbol}</span>
                  <input type="number" min="0" step="500" value={newGoalInitial} onChange={(e) => setNewGoalInitial(e.target.value)} placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted dark:text-gray-400 mb-1.5">Category</label>
                <select value={newGoalCategory} onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:border-brand-primary dark:focus:border-emerald-500">
                  <option value="Academics & Tech">Academics & Tech</option>
                  <option value="Gadgets">Gadgets</option>
                  <option value="Emergency & Safety">Emergency & Safety</option>
                  <option value="Housing & Rent">Housing & Rent</option>
                  <option value="Travel & Holidays">Travel & Holidays</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div className="pt-2 flex space-x-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-brand-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center justify-center space-x-1.5 transition-colors">
                  <Check className="w-4 h-4" /><span>Create Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
