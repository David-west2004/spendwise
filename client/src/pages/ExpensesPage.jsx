import React, { useState } from 'react';
import { Search, Utensils, Bus, BookOpen, ShoppingBag, Wifi, Heart, Tag, ArrowDownLeft, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatNaira } from '../utils/formatters';

// Category Icon Helper
const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('food')) return <Utensils className="w-5 h-5 text-amber-500" />;
  if (cat.includes('transport') || cat.includes('bus')) return <Bus className="w-5 h-5 text-blue-500" />;
  if (cat.includes('book') || cat.includes('supplies') || cat.includes('education')) return <BookOpen className="w-5 h-5 text-purple-500" />;
  if (cat.includes('shop')) return <ShoppingBag className="w-5 h-5 text-pink-500" />;
  if (cat.includes('data') || cat.includes('airtime') || cat.includes('wifi')) return <Wifi className="w-5 h-5 text-cyan-500" />;
  if (cat.includes('health')) return <Heart className="w-5 h-5 text-rose-500" />;
  if (cat.includes('allowance') || cat.includes('income')) return <ArrowDownLeft className="w-5 h-5 text-[#157347] dark:text-emerald-400" />;
  return <Tag className="w-5 h-5 text-gray-500" />;
};

export default function ExpensesPage() {
  const { transactions, totalSpent, deleteTransaction, currencySymbol } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  // Filter expenses vs income
  const expensesOnly = transactions.filter((t) => t.type === 'expense');

  const filteredExpenses = expensesOnly.filter((item) => {
    const titleMatch = (item.title || item.note || '').toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || catMatch;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense record?')) {
      setDeletingId(id);
      await deleteTransaction(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors">
      {/* Header & Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Expenses Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review, search, and manage your recorded spending activity.</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 px-5 py-3 rounded-2xl">
          <p className="text-xs font-medium text-rose-800 dark:text-rose-300 uppercase tracking-wider">Total Spent Overall</p>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-200">
            {formatNaira(totalSpent)}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search expenses by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#157347] dark:focus:ring-emerald-500 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {['All', 'This week', 'This month'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterTab === tab 
                  ? 'bg-[#157347] text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Feed List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-600">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {expense.title || expense.note || expense.category}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md font-medium">
                        {expense.category}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400">• {expense.date || expense.transaction_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 pl-3">
                  <div className="text-right">
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                      -{formatNaira(Math.abs(expense.amount))}
                    </span>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Recorded expense</p>
                  </div>

                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    title="Delete expense"
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 opacity-80 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-3xl flex items-center justify-center mx-auto text-2xl font-bold">
              🧾
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Expense Records Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Every expense you enter from the Add Expense screen will appear right here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
