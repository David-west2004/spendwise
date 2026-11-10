import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Target,
  Clock,
  ArrowRight,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Inbox,
  ShieldAlert,
} from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    toggleNotificationRead,
    markAllNotificationsAsRead,
    clearNotifications,
    deleteNotification,
    resetNotifications,
  } = useFinance();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'budget', 'goals', 'reminders'
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      budget: notifications.filter((n) => n.type === 'budget_warning').length,
      goals: notifications.filter((n) => n.type === 'goal_update').length,
      reminders: notifications.filter((n) => n.type === 'expense_reminder').length,
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'budget':
        return notifications.filter((n) => n.type === 'budget_warning');
      case 'goals':
        return notifications.filter((n) => n.type === 'goal_update');
      case 'reminders':
        return notifications.filter((n) => n.type === 'expense_reminder');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleClearAll = () => {
    clearNotifications();
    setShowClearConfirm(false);
  };

  // Helper for notification type visuals
  const getTypeConfig = (type) => {
    switch (type) {
      case 'budget_warning':
        return {
          icon: AlertTriangle,
          badgeLabel: 'Budget Warning',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
          iconContainer: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
          borderHighlight: 'border-l-4 border-l-amber-500',
        };
      case 'goal_update':
        return {
          icon: Target,
          badgeLabel: 'Savings Goal',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
          iconContainer: 'bg-emerald-100 dark:bg-emerald-900/50 text-[#157347] dark:text-emerald-400',
          borderHighlight: 'border-l-4 border-l-emerald-500',
        };
      case 'expense_reminder':
      default:
        return {
          icon: Clock,
          badgeLabel: 'Expense Reminder',
          badgeBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
          iconContainer: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
          borderHighlight: 'border-l-4 border-l-blue-500',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 transition-colors">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-primary dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity & Smart Reminders</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded-full shadow-sm">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Keep track of budget thresholds, monthly savings targets, and daily logging reminders.
          </p>
        </div>

        {/* Global Feed Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[#157347] dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && !showClearConfirm && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors flex items-center gap-1.5"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          )}

          {showClearConfirm && (
            <div className="flex items-center gap-2 p-1 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium pl-2">Clear all?</span>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-[#157347] text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
          }`}
        >
          <span>All</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {tabCounts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-[#157347] text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
          }`}
        >
          <span>Unread</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'unread'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
            }`}
          >
            {tabCounts.unread}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'budget'
              ? 'bg-[#157347] text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Budget Alerts</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'budget'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {tabCounts.budget}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'goals'
              ? 'bg-[#157347] text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-500" />
          <span>Savings Goals</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'goals'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {tabCounts.goals}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'reminders'
              ? 'bg-[#157347] text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Reminders</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'reminders'
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {tabCounts.reminders}
          </span>
        </button>
      </div>

      {/* Notifications Cards Feed */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3.5">
          {filteredNotifications.map((notification) => {
            const config = getTypeConfig(notification.type);
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`p-5 rounded-2xl transition-all duration-150 border ${
                  notification.isRead
                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-85 hover:opacity-100'
                    : `bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-600 ${config.borderHighlight}`
                } flex flex-col sm:flex-row sm:items-start justify-between gap-4`}
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${config.iconContainer}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${config.badgeBg}`}>
                        {config.badgeLabel}
                      </span>

                      {/* Status Badge */}
                      {!notification.isRead ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-[#157347] dark:text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Unread
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-semibold rounded-md">
                          Read
                        </span>
                      )}

                      {/* Relative Time Indicator */}
                      <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium ml-auto">
                        {notification.time}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                      {notification.title}
                    </h2>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Quick Action Button if present */}
                    {notification.actionRoute && notification.actionLabel && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            navigate(notification.actionRoute);
                          }}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#157347] dark:text-emerald-400 hover:text-[#0D4428] dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/40 transition-colors"
                        >
                          <span>{notification.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Card Controls */}
                <div className="flex sm:flex-col items-center justify-end gap-1.5 self-end sm:self-start shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700 w-full sm:w-auto">
                  <button
                    onClick={() => toggleNotificationRead(notification.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    <Check className="w-4 h-4" />
                    <span className="sm:hidden text-[11px]">{notification.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden text-[11px]">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-gray-700 text-[#157347] dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {activeTab === 'all'
                ? 'No notifications right now'
                : `No notifications in "${activeTab}"`}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              You are completely caught up! We will alert you whenever budgets near limits or when savings milestones approach.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={resetNotifications}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-[#157347] dark:text-emerald-400" />
              <span>Restore Sample Notifications</span>
            </button>
          </div>
        </div>
      )}

      {/* Educational Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/30 dark:via-gray-800 dark:to-teal-950/30 rounded-2xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-900/40 flex items-start space-x-3.5 transition-colors">
        <Sparkles className="w-5 h-5 text-[#157347] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-emerald-900 dark:text-emerald-200">
          <p className="font-bold">Smart Student Guardrails</p>
          <p className="text-emerald-800/80 dark:text-gray-300 leading-relaxed">
            SpendWise automatically calculates your safe burn rate. If your discretionary spending dips below ₦1,000/day, you will receive an instant caution alert to help preserve your allowance.
          </p>
        </div>
      </div>
    </div>
  );
}
