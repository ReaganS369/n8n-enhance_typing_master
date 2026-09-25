import React from 'react';
import {
  CreditCard,
  Target,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { MetricCard } from './MetricCard';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { BudgetOverviewWidget } from './BudgetOverviewWidget';
import { RecentTransactionsWidget } from './RecentTransactionsWidget';

export const Overview: React.FC = () => {
  const {
    currentMonthTotalSpend,
    previousMonthTotalSpend,
    totalMonthlyBudget,
    remainingMonthlyBudget,
    spendingChangePercent,
    settings,
    setIsAddModalOpen,
  } = useExpense();

  const budgetUtilization = Math.round(
    (currentMonthTotalSpend / (totalMonthlyBudget || 1)) * 100
  );

  const isOverBudget = currentMonthTotalSpend > totalMonthlyBudget;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time breakdown of your monthly expenditure, pacing, and limits
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-soft active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Over-Budget Alert Banner (if applicable) */}
      {isOverBudget && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Budget threshold exceeded!</span> You have surpassed your total monthly budget cap by{' '}
            <span className="font-mono font-bold">
              {settings.currency}{(currentMonthTotalSpend - totalMonthlyBudget).toLocaleString()}
            </span>
            . Consider pausing non-essential spending.
          </div>
        </div>
      )}

      {/* Top Metrics Summary Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <MetricCard
          title="Total Spending"
          amount={currentMonthTotalSpend}
          currency={settings.currency}
          trend={{
            value: spendingChangePercent,
            isPositiveGood: false,
          }}
          icon={CreditCard}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          subtitle={`Prev: ${settings.currency}${previousMonthTotalSpend.toLocaleString()}`}
        />

        {/* Monthly Budget */}
        <MetricCard
          title="Monthly Budget"
          amount={totalMonthlyBudget}
          currency={settings.currency}
          icon={Target}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          progressPercent={budgetUtilization}
          progressColor={
            budgetUtilization > 100
              ? 'bg-rose-500'
              : budgetUtilization > 80
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }
        />

        {/* Remaining Budget */}
        <MetricCard
          title="Remaining Budget"
          amount={Math.max(remainingMonthlyBudget, 0)}
          currency={settings.currency}
          icon={PiggyBank}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtitle={
            remainingMonthlyBudget < 0
              ? 'Exceeded monthly limit'
              : `${100 - budgetUtilization}% unallocated`
          }
        />

        {/* Spending Change vs Last Month */}
        <MetricCard
          title="Month vs Month"
          amount={Math.abs(currentMonthTotalSpend - previousMonthTotalSpend)}
          currency={settings.currency}
          trend={{
            value: spendingChangePercent,
            isPositiveGood: false,
          }}
          icon={TrendingUp}
          iconBgColor="bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          subtitle={
            spendingChangePercent > 0
              ? 'Higher spend than last month'
              : spendingChangePercent < 0
              ? 'Lower spend than last month'
              : 'On par with previous month'
          }
        />
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Spending Pace Trend */}
        <div className="space-y-6">
          <SpendingTrendChart />
          <RecentTransactionsWidget />
        </div>

        {/* Right Column: Category Distribution & Limits */}
        <div className="space-y-6">
          <CategoryBreakdownChart />
          <BudgetOverviewWidget />
        </div>
      </div>
    </div>
  );
};
