import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface MetricCardProps {
  title: string;
  amount: number;
  currency: string;
  subtitle?: string;
  trend?: {
    value: number; // percentage
    isPositiveGood?: boolean; // for spending, a lower spend vs last month is usually good
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  progressPercent?: number; // optional progress bar (0 - 100)
  progressColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  currency,
  subtitle,
  trend,
  icon: Icon,
  iconBgColor = 'bg-emerald-500/10',
  iconColor = 'text-emerald-600 dark:text-emerald-400',
  progressPercent,
  progressColor = 'bg-emerald-500',
}) => {
  const isNeutral = trend?.value === 0;
  const isIncrease = (trend?.value || 0) > 0;

  return (
    <div className="relative group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg transition-all duration-200 overflow-hidden">
      {/* Top Header: Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          <AnimatedNumber value={amount} currency={currency} />
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
              isNeutral
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : isIncrease
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3.5 h-3.5" />
            ) : isIncrease ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Subtitle / Progress */}
      {progressPercent !== undefined ? (
        <div className="mt-3">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 mb-1">
            <span>Budget Utilized</span>
            <span className="font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      ) : subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
