import React, { useState } from 'react';
import {
  Target,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { CategoryId } from '../../types/expense';
import { BudgetModal } from './BudgetModal';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    categorySpendMap,
    settings,
    currentMonthTotalSpend,
    totalMonthlyBudget,
    setFilterState,
    setCurrentView,
  } = useExpense();

  const [modalCat, setModalCat] = useState<CategoryId>('food');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map all categories with their budget limit (or 0 if not set)
  const categoryBudgets = CATEGORY_LIST.map((cat) => {
    const existing = budgets.find((b) => b.categoryId === cat.id);
    const limit = existing ? existing.monthlyLimit : 0;
    const spent = categorySpendMap[cat.id] || 0;
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remaining = limit - spent;
    const isExceeded = limit > 0 && spent >= limit;
    const isApproaching = limit > 0 && percent >= 80 && !isExceeded;

    return {
      category: cat,
      limit,
      spent,
      percent,
      remaining,
      isExceeded,
      isApproaching,
    };
  }).sort((a, b) => b.percent - a.percent);

  const overallPercent = Math.min(
    Math.round((currentMonthTotalSpend / (totalMonthlyBudget || 1)) * 100),
    100
  );

  const exceededCount = categoryBudgets.filter((c) => c.isExceeded).length;
  const approachingCount = categoryBudgets.filter((c) => c.isApproaching).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Budgets & Limits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set and track category spending limits with threshold notifications
          </p>
        </div>

        <button
          onClick={() => {
            setModalCat('food');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-soft shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Limit</span>
        </button>
      </div>

      {/* Top Health Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Cap */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Budget Pacing</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {settings.currency}{currentMonthTotalSpend.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">
              of {settings.currency}{totalMonthlyBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallPercent > 95
                  ? 'bg-rose-500'
                  : overallPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {overallPercent}% used this month • {settings.currency}{Math.max(totalMonthlyBudget - currentMonthTotalSpend, 0).toLocaleString()} safe margin remaining
          </p>
        </div>

        {/* Categories Over Budget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Alerts & Breaches</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mb-1">
            {exceededCount} {exceededCount === 1 ? 'Category' : 'Categories'} Over
          </div>
          <p className="text-xs text-slate-500">
            {approachingCount > 0
              ? `${approachingCount} categories approaching 80% mark`
              : 'All other categories are well under control'}
          </p>
        </div>

        {/* Active Budgets Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Categories</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mb-1">
            {budgets.length} Configured
          </div>
          <p className="text-xs text-slate-500">
            Total active limit allocation: {settings.currency}{budgets.reduce((a, b) => a + b.monthlyLimit, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBudgets.map(({ category, limit, spent, percent, remaining, isExceeded, isApproaching }) => {
          let statusColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
          let barBg = 'bg-emerald-500';
          let statusText = `${percent}% Used`;

          if (isExceeded) {
            statusColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
            barBg = 'bg-rose-500';
            statusText = 'Exceeded';
          } else if (isApproaching) {
            statusColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20';
            barBg = 'bg-amber-500';
            statusText = 'Approaching Limit';
          } else if (limit === 0) {
            statusColor = 'text-slate-500 bg-slate-100 border-slate-200';
            barBg = 'bg-slate-300';
            statusText = 'No Limit';
          }

          return (
            <div
              key={category.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${category.color}15`,
                        borderColor: `${category.color}30`,
                        color: category.color,
                      }}
                    >
                      <CategoryIcon categoryId={category.id} size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {category.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setModalCat(category.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit limit"
                    aria-label={`Edit ${category.name} budget`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount Spent vs Limit */}
                <div className="flex items-baseline justify-between mt-3 mb-1.5">
                  <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {settings.currency}{spent.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    of {limit > 0 ? `${settings.currency}${limit.toLocaleString()}` : 'Uncapped'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barBg}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Status Pills */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
                    {isExceeded ? (
                      <ShieldAlert className="w-3 h-3" />
                    ) : isApproaching ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {statusText}
                  </span>

                  <span className="font-mono text-[11px] text-slate-500">
                    {limit > 0 ? (
                      remaining >= 0 ? (
                        `${settings.currency}${remaining.toLocaleString()} left`
                      ) : (
                        `+${settings.currency}${Math.abs(remaining).toLocaleString()} over`
                      )
                    ) : (
                      'Set a budget'
                    )}
                  </span>
                </div>
              </div>

              {/* View Expenses shortcut */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setFilterState((prev) => ({ ...prev, category: category.id }));
                    setCurrentView('transactions');
                  }}
                  className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>Transactions</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    setModalCat(category.id);
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {limit > 0 ? 'Edit' : 'Set Limit'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={modalCat}
      />
    </div>
  );
};
