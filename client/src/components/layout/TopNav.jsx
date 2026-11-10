import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, LogOut, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/add-money': 'Add Money',
  '/add-expense': 'Add Expense',
  '/expenses': 'Expenses',
  '/analysis': 'Spending Analysis',
  '/budget': 'Budget Planning',
  '/goals': 'Savings Goals',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useFinance();
  const { user, logout } = useAuth();

  const currentTitle = routeTitles[location.pathname] || 'SpendWise';
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  const displayName = user?.name || user?.fullname || (typeof window !== 'undefined' ? localStorage.getItem('spendwise_name') : null) || 'Student';
  const displayRole = user?.school || (typeof window !== 'undefined' ? localStorage.getItem('spendwise_school') : null) || 'Student Account';
  const firstName = displayName.split(' ')[0] || 'Student';
  const initials = displayName
    .trim()
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Desktop Top Header (md: and above) */}
      <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Hello {firstName}! 👋
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Welcome to your dashboard • Track, plan, and save with ease.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications Trigger */}
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-500 dark:text-gray-300 hover:text-brand-primary dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-brand-danger text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Badge */}
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 pl-3 pr-2.5 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-100 dark:border-gray-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {displayRole}
              </p>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-danger dark:hover:text-rose-400 px-3 py-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-rose-950/30 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Top App Bar (< md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-3">
          {!isDashboard ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-emerald-400 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
          )}
          <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {isDashboard ? 'SpendWise' : currentTitle}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-500 dark:text-gray-300 hover:text-brand-primary dark:hover:text-emerald-400 rounded-lg relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs"
            aria-label="Profile"
          >
            {initials}
          </button>
        </div>
      </header>
    </>
  );
}
