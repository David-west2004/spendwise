import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <Link to="/" className="flex items-center justify-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm shadow-brand-primary/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-darkText dark:text-white">
            Spend<span className="text-brand-primary dark:text-emerald-400">Wise</span>
          </span>
        </Link>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-brand-darkText dark:text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-xs text-brand-muted dark:text-gray-400">
          Sign in to your student ledger to manage your allowance and expenses
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl shadow-gray-200/50 dark:shadow-black/40 rounded-3xl border border-gray-100 dark:border-gray-700 sm:px-10 transition-colors">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-100 dark:border-rose-900/50 text-xs text-brand-danger dark:text-rose-400 font-medium flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-danger dark:bg-rose-400 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-brand-darkText dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu.ng"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50/50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:focus:ring-emerald-500/20 focus:border-brand-primary dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-brand-darkText dark:text-gray-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions will be sent to your registered email address.');
                  }}
                  className="text-xs font-semibold text-brand-primary dark:text-emerald-400 hover:text-brand-hover dark:hover:text-emerald-300 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:focus:ring-emerald-500/20 focus:border-brand-primary dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-brand-primary/20 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-70"
              >
                <span>{isLoading ? 'Signing In...' : 'Log In'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Redirect to Register */}
          <div className="mt-6 text-center text-xs text-brand-muted dark:text-gray-400">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-brand-primary dark:text-emerald-400 hover:text-brand-hover dark:hover:text-emerald-300 hover:underline transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Legal Notice Snippet */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 text-center px-4">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-primary dark:text-emerald-400 shrink-0" />
          <span>SpendWise is a personal expense calculator • No banking • No transfers</span>
        </div>
      </div>
    </div>
  );
}
