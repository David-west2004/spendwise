import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  PieChart,
  PiggyBank,
  User,
  PlusCircle,
  MinusCircle,
  X,
} from 'lucide-react';

export default function BottomNav() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const navigate = useNavigate();

  const handleAction = (path) => {
    setShowAddMenu(false);
    navigate(path);
  };

  return (
    <>
      {/* Mobile Action Chooser Modal Backdrop */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden flex flex-col justify-end p-4 transition-opacity animate-in fade-in"
          onClick={() => setShowAddMenu(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-gray-700 mb-16 space-y-3 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Record Transaction</h3>
              <button
                onClick={() => setShowAddMenu(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Add Money Option */}
              <button
                onClick={() => handleAction('/add-money')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-100 dark:border-emerald-800/50 transition-colors text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#157347] dark:text-emerald-400">Add Money</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Allowance & Income</span>
              </button>

              {/* Add Expense Option */}
              <button
                onClick={() => handleAction('/add-expense')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-rose-950/40 hover:bg-red-100/80 dark:hover:bg-rose-900/60 border border-red-100 dark:border-rose-900/50 transition-colors text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-danger text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                  <MinusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-brand-danger dark:text-rose-400">Add Expense</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Log Purchases</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-2 flex items-center justify-around transition-colors">
        {/* Home */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-primary dark:text-emerald-400 font-bold'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* Analysis */}
        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-primary dark:text-emerald-400 font-bold'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span>Analysis</span>
        </NavLink>

        {/* Center Prominent Add Button */}
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex flex-col items-center justify-center -mt-5"
          aria-label="Add transaction"
        >
          <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-brand-primary dark:text-emerald-400 mt-1">Add</span>
        </button>

        {/* Goals */}
        <NavLink
          to="/goals"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-primary dark:text-emerald-400 font-bold'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <PiggyBank className="w-5 h-5 mb-0.5" />
          <span>Goals</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-primary dark:text-emerald-400 font-bold'
                : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}
