import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, LogOut, ShieldCheck, Mail, BookOpen, ChevronRight, Award, Edit3, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { currency } = useFinance();

  // Load saved profile details from localStorage or use active user state/defaults
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(() => {
    return localStorage.getItem('spendwise_name') || user?.fullname || user?.name || 'Student';
  });
  const [school, setSchool] = useState(() => {
    return localStorage.getItem('spendwise_school') || user?.school || 'Institution';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('spendwise_email') || user?.email || '';
  });
  const [successToast, setSuccessToast] = useState(false);

  // Sync state if user or localStorage changes
  useEffect(() => {
    const savedName = localStorage.getItem('spendwise_name') || user?.fullname || user?.name;
    const savedSchool = localStorage.getItem('spendwise_school') || user?.school;
    const savedEmail = localStorage.getItem('spendwise_email') || user?.email;
    if (savedName) setName(savedName);
    if (savedSchool) setSchool(savedSchool);
    if (savedEmail) setEmail(savedEmail);
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanSchool = school.trim();
    const cleanEmail = email.trim();

    // Persist changes directly to localStorage so they never reset on reload or route changes
    localStorage.setItem('spendwise_name', cleanName);
    localStorage.setItem('spendwise_school', cleanSchool);
    localStorage.setItem('spendwise_email', cleanEmail);

    setName(cleanName);
    setSchool(cleanSchool);
    setEmail(cleanEmail);

    // Sync globally with user session state
    if (setUser) {
      setUser((prev) => ({
        ...prev,
        name: cleanName,
        fullname: cleanName,
        school: cleanSchool,
        email: cleanEmail,
      }));
    }

    setIsEditing(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'EO';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header & Title */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your SpendWise profile information and credentials.</p>
        </div>
        {successToast && (
          <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1 animate-fade-in">
            <Check className="w-4 h-4" /> Updated!
          </span>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-[#157347] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl font-bold shrink-0">
          {initials || 'EO'}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-emerald-100 text-sm mt-0.5">{email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full border border-white/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Student Account
            </span>
            <span className="px-3 py-1 bg-white/10 text-xs font-semibold rounded-full border border-white/20">
              {school}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
        >
          <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Personal Details Form or View */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-[#157347]" /> Personal Details
        </h3>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Institution / School</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157347]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#157347] hover:bg-[#0D4428] text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 block font-medium">Full Name</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{name}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 block font-medium">Institution</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{school}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 block font-medium">Email Address</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{email}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 block font-medium">Preferred Currency</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{currency || 'Nigerian Naira (₦)'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Options */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
        <button 
          onClick={() => navigate('/settings')} 
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-[#157347] dark:text-emerald-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Settings & Preferences</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Control appearance, currency, and default schedules</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => navigate('/notifications')} 
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-[#157347] dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Notifications & Reminders</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage budget warnings and savings updates</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
          Your information is used only to personalize your tracker. SpendWise does not connect to bank accounts or execute money transfers. No banking • No transfers.
        </p>
      </div>

      {/* Logout Action */}
      <button 
        onClick={() => { logout(); navigate('/login'); }}
        className="w-full py-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold rounded-2xl border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Log Out of Account
      </button>
    </div>
  );
}