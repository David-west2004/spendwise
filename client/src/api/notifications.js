/**
 * SpendWise Notifications Service
 * Handles notification feed state, status tracking (read/unread), relative timestamps,
 * and smart alerts based on live financial metrics.
 */

export const NOTIFICATION_STORAGE_KEY = 'spendwise_notifications';

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'budget_warning',
    category: 'Budget Warning',
    title: 'Food Budget Alert',
    message: 'Your Food & Cafeteria budget is near its limit. You have used ₦7,000 of your ₦10,000 allowance (70%). Consider pacing spending before the weekend.',
    time: 'Today',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    isRead: false,
    actionLabel: 'View Budget',
    actionRoute: '/budget',
    priority: 'high',
  },
  {
    id: 'notif-2',
    type: 'goal_update',
    category: 'Savings Goal',
    title: 'Laptop Fund Milestone',
    message: 'You are only ₦32,000 away from your ₦50,000 Laptop Fund target! Current progress is at 36%. Keep up the steady contributions.',
    time: 'Today',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    isRead: false,
    actionLabel: 'Contribute Now',
    actionRoute: '/goals',
    priority: 'medium',
  },
  {
    id: 'notif-3',
    type: 'expense_reminder',
    category: 'Expense Reminder',
    title: "Don't Forget to Log Purchases",
    message: "End of day check-in: Remember to record your lunch, campus shuttle fare, and SIWES travel expenses to keep your Daily Safe-to-Spend limit accurate.",
    time: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // yesterday
    isRead: true,
    actionLabel: 'Add Expense',
    actionRoute: '/add-expense',
    priority: 'normal',
  },
  {
    id: 'notif-4',
    type: 'budget_warning',
    category: 'Budget Warning',
    title: 'Data & Airtime Notice',
    message: 'MTN 10GB bundle recorded. You have reached 60% of your monthly telecom allocation.',
    time: 'Yesterday',
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
    isRead: true,
    actionLabel: 'View Breakdown',
    actionRoute: '/analysis',
    priority: 'normal',
  },
  {
    id: 'notif-5',
    type: 'goal_update',
    category: 'Savings Goal',
    title: 'New Phone Goal Update',
    message: 'You have saved ₦35,000 out of ₦150,000 for your New Phone gadget stash. Small steps add up fast!',
    time: '2 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 52,
    isRead: true,
    actionLabel: 'View Goals',
    actionRoute: '/goals',
    priority: 'normal',
  },
];

/**
 * Load notifications from persistent local storage or initialize defaults
 */
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTIFICATIONS;
  } catch (err) {
    console.warn('Failed to parse notifications storage:', err);
    return DEFAULT_NOTIFICATIONS;
  }
}

/**
 * Persist notifications array to storage
 */
export function saveStoredNotifications(notifications) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

/**
 * Format relative time indicator (Today, Yesterday, X days ago)
 */
export function getRelativeTimeLabel(timestamp) {
  if (!timestamp) return 'Today';
  const now = Date.now();
  const diffSec = Math.floor((now - Number(timestamp)) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return hours === 1 ? '1 hour ago' : `Today (${hours}h ago)`;
  }
  if (diffSec < 172800) return 'Yesterday';
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}
