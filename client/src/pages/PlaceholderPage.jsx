import React from 'react';
import { useLocation } from 'react-router-dom';
import { formatNaira, formatCompactNaira } from '../utils/formatters';
import { ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export default function PlaceholderPage() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-primary uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            <span>Phase 1 Verified • Responsive Shell</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-darkText">
            Route: <span className="text-brand-primary">{currentPath === '/' ? '/dashboard' : currentPath}</span>
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Layout scaffolding and Tailwind design tokens are active.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 border border-emerald-100 text-brand-primary px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-accent" />
            <span>Tokens Loaded</span>
          </div>
        </div>
      </div>

      {/* Formatters Verification Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-brand-muted uppercase">Sample Balance</p>
          <p className="text-2xl font-bold text-brand-primary mt-1">
            {formatNaira(15000)}
          </p>
          <p className="text-xs text-brand-muted mt-1 font-mono">
            formatNaira(15000)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-brand-muted uppercase">Money In (Accent)</p>
          <div className="flex items-center space-x-1.5 text-brand-accent mt-1">
            <TrendingUp className="w-5 h-5" />
            <p className="text-2xl font-bold">
              +{formatNaira(50000)}
            </p>
          </div>
          <p className="text-xs text-brand-muted mt-1 font-mono">
            Compact: {formatCompactNaira(50000)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-brand-muted uppercase">Money Out (Danger)</p>
          <div className="flex items-center space-x-1.5 text-brand-danger mt-1">
            <TrendingDown className="w-5 h-5" />
            <p className="text-2xl font-bold">
              -{formatNaira(12500)}
            </p>
          </div>
          <p className="text-xs text-brand-muted mt-1 font-mono">
            formatNaira(-12500)
          </p>
        </div>
      </div>

      {/* Design Tokens Palette Visual Verification */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-brand-darkText">Design Tokens Palette</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-brand-primary text-white text-center">
            <p className="text-xs font-semibold">Primary</p>
            <p className="text-[11px] opacity-90 font-mono mt-1">#157347</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-dark text-white text-center">
            <p className="text-xs font-semibold">Dark Forest</p>
            <p className="text-[11px] opacity-90 font-mono mt-1">#0F5132</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-accent text-white text-center">
            <p className="text-xs font-semibold">Accent Green</p>
            <p className="text-[11px] opacity-90 font-mono mt-1">#10B981</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-accentLight text-brand-dark text-center border border-emerald-200">
            <p className="text-xs font-semibold">Accent Light</p>
            <p className="text-[11px] text-gray-600 font-mono mt-1">#D1FAE5</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-danger text-white text-center">
            <p className="text-xs font-semibold">Danger / Red</p>
            <p className="text-[11px] opacity-90 font-mono mt-1">#EF4444</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-bg text-brand-darkText text-center border border-gray-200">
            <p className="text-xs font-semibold">Background</p>
            <p className="text-[11px] text-gray-500 font-mono mt-1">#F8F9FA</p>
          </div>
        </div>
      </div>

      {/* Legal & Operational Notice (AGENT.md Section 1) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Legal / Operational Notice
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            SpendWise only records your money activity. It does not send money, receive payments, or connect to bank accounts. No banking • No transfers.
          </p>
        </div>
      </div>
    </div>
  );
}
