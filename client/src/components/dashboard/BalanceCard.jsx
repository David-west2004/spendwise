import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatNaira, getCurrencySymbol } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

export default function BalanceCard({ balance = 0, safeToSpendDaily = 1250, daysLeft = 12, healthStatus = 'ON_TRACK', currencySymbol: propCurrencySymbol }) {
  const [showBalance, setShowBalance] = useState(true);
  const { currencySymbol: contextCurrencySymbol = getCurrencySymbol() } = useFinance?.() || {};
  const currencySymbol = propCurrencySymbol || contextCurrencySymbol;

  // Badge mapping based on PRD Section 4.0 & 6.0
  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'DEFICIT':
        return {
          label: 'Deficit Mode',
          badgeClass: 'bg-red-500/30 text-rose-100 border-red-300/40',
          icon: ShieldAlert,
        };
      case 'CAUTION':
        return {
          label: 'Caution Pacing',
          badgeClass: 'bg-amber-500/30 text-amber-100 border-amber-300/40',
          icon: AlertTriangle,
        };
      case 'ON_TRACK':
      default:
        return {
          label: 'Optimal Pacing',
          badgeClass: 'bg-white/20 text-emerald-100 border-white/20',
          icon: CheckCircle2,
        };
    }
  };

  const badge = getHealthBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-[#136a41] to-brand-dark p-6 sm:p-8 text-white shadow-lg shadow-brand-primary/20">
      {/* Decorative Background Rings */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-emerald-400/10 pointer-events-none blur-xl" />

      {/* Top Meta Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Total Available Balance
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Health Badge */}
          <div className={`flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${badge.badgeClass}`}>
            <BadgeIcon className="w-3 h-3" />
            <span>{badge.label}</span>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors border border-white/10"
            title={showBalance ? 'Hide balance' : 'Show balance'}
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Balance Figure */}
      <div className="relative z-10 mt-4 sm:mt-5">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-sans">
          {showBalance ? formatNaira(balance, { currency: currencySymbol }) : `${currencySymbol} ••••••••`}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 font-medium mt-1.5">
          Money currently available to you
        </p>
      </div>

      {/* Safe-to-Spend Daily Burn Rate Pill */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>
            Daily Safe-to-Spend:{' '}
            <strong className="text-white font-semibold">
              {showBalance ? formatNaira(safeToSpendDaily, { currency: currencySymbol }) : `${currencySymbol} •••`} / day
            </strong>
          </span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 font-medium">
          {daysLeft} days remaining this month
        </span>
      </div>
    </div>
  );
}
