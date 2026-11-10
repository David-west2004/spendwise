import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  Receipt,
  PieChart,
  Wallet,
  PiggyBank,
  User,
  Settings,
  Sparkles,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Money', path: '/add-money', icon: PlusCircle },
  { name: 'Add Expense', path: '/add-expense', icon: MinusCircle },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Spending Analysis', path: '/analysis', icon: PieChart },
  { name: 'Budget', path: '/budget', icon: Wallet },
  { name: 'Savings Goals', path: '/goals', icon: PiggyBank },
  { name: 'Notifications', path: '/notifications', icon: Bell, hasBadge: true },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { unreadCount } = useFinance();
  const { user } = useAuth();

  const displayName = user?.fullname || user?.name || (typeof window !== 'undefined' ? localStorage.getItem('spendwise_name') : null) || 'Student';
  const displaySchool = user?.school || (typeof window !== 'undefined' ? localStorage.getItem('spendwise_school') : null) || 'Lagos State University';
  const initials = displayName
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen sticky top-0 shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shadow-brand-primary/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
            Spend<span className="text-brand-primary dark:text-emerald-400">Wise</span>
          </h1>
          <p className="text-xs text-brand-muted dark:text-gray-400 font-medium mt-1">
            Smart Student Budgeting
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20 font-semibold'
                    : 'text-brand-muted dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.hasBadge && unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-danger text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Dynamic Logged-in User Profile Pill */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <div
          onClick={() => navigate('/profile')}
          className="p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-700/60 border border-gray-200/60 dark:border-gray-600/60 flex items-center space-x-3 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-gray-700 hover:border-emerald-200 dark:hover:border-emerald-600/50 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-primary dark:group-hover:text-emerald-400 transition-colors">
              {displayName}
            </p>
            <p className="text-[11px] text-brand-muted dark:text-gray-400 truncate">
              {displaySchool}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Tip Card */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-emerald-950/40 dark:to-gray-800/80 rounded-2xl p-4 border border-green-100/80 dark:border-emerald-800/40 transition-colors">
          <div className="flex items-center space-x-2 text-brand-primary dark:text-emerald-400 mb-1.5">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide">Daily Tip</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            Stay on track. Small updates make budgeting easier.
          </p>
          <button
            onClick={() => navigate('/add-expense')}
            className="w-full flex items-center justify-center space-x-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm"
          >
            <span>Add Expense</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
