import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  PiggyBank,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatNaira } from '../utils/formatters';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-darkText">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shadow-brand-primary/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-darkText">
                Spend<span className="text-brand-primary">Wise</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-brand-muted font-medium border-l border-gray-200 pl-2">
                Smart Student Budgeting
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-darkText px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-semibold bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-xl shadow-sm shadow-brand-primary/20 transition-all hover:shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-primary">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span>Smart student ledger • No bank link required</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-darkText leading-[1.15]">
                SpendWise:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-600">
                  Track. Plan. Save.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A simple student expense tracker for knowing what you have, what
                you spend, and what you have left.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-brand-primary hover:bg-brand-hover text-white text-base font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-brand-darkText border border-gray-200 text-base font-semibold px-6 py-3.5 rounded-2xl transition-colors shadow-sm"
                >
                  <span>Sign In</span>
                </button>
              </div>

              {/* Value Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-100 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-xs text-brand-muted">Allowance</p>
                  <p className="text-sm font-bold text-brand-darkText">Smart Ledger</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xs text-brand-muted">Safe-to-Spend</p>
                  <p className="text-sm font-bold text-brand-primary">Daily Pace</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xs text-brand-muted">Privacy First</p>
                  <p className="text-sm font-bold text-brand-darkText">No Bank Switch</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 relative">
                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                      EO
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-darkText leading-none">
                        Elizabeth Omoniho
                      </p>
                      <p className="text-[10px] text-brand-muted mt-0.5">Student Dashboard</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-brand-primary border border-emerald-100">
                    Active Term
                  </span>
                </div>

                {/* Available Balance Hero Card */}
                <div className="mt-4 bg-gradient-to-br from-brand-primary to-brand-dark rounded-2xl p-5 text-white shadow-md">
                  <p className="text-xs font-medium text-emerald-100">Total Available Balance</p>
                  <p className="text-3xl font-extrabold tracking-tight mt-1">
                    {formatNaira(15000)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-100/90 pt-3 border-t border-white/10">
                    <span>Safe-to-Spend: <strong className="text-white">₦1,250.00 / day</strong></span>
                    <span>12 days left</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Money In</p>
                    <p className="text-sm font-bold text-brand-primary mt-0.5">
                      +{formatNaira(50000)}
                    </p>
                  </div>
                  <div className="bg-red-50/70 border border-red-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">Total Spent</p>
                    <p className="text-sm font-bold text-brand-danger mt-0.5">
                      -{formatNaira(35000)}
                    </p>
                  </div>
                </div>

                {/* Recent Snippet */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-bold text-brand-darkText">Recent Activity</p>
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                      <span className="text-gray-700">Monthly Allowance</span>
                    </div>
                    <span className="font-semibold text-brand-primary">+₦30,000.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand-danger"></span>
                      <span className="text-gray-700">Course Materials & Print</span>
                    </div>
                    <span className="font-semibold text-brand-danger">-₦4,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Feature Pillars */}
          <div className="mt-20 lg:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-darkText">Track Every Naira</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Record daily allowances, stipends, and cash from home. View what is left before you make unplanned purchases.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-darkText">Spending Analysis</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Identify which categories eat up your pocket money—Food, Transport, Books, Data, or Subscriptions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-primary flex items-center justify-center mb-4">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-darkText">Reach Savings Goals</h3>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Set targets for a new laptop, school project fees, or emergency funds with visual progress markers.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Operational Disclaimer Footer (AGENT.md Section 1) */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
            <span>
              SpendWise only records your money activity. It does not send money, receive payments, or connect to bank accounts. No banking • No transfers.
            </span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SpendWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
