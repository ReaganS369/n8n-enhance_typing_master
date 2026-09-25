import React from 'react';
import { ArrowUpRight, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';

export const BudgetOverviewWidget: React.FC = () => {
  const { budgets, categorySpendMap, settings, setCurrentView } = useExpense();

  // Sort budgets by utilization % descending to show critical categories first
  const budgetStats = budgets.map((b) => {
    const spent = categorySpendMap[b.categoryId] || 0;
    const limit = b.monthlyLimit;
    const percent = Math.round((spent / (limit || 1)) * 100);
    const remaining = limit - spent;
    const isExceeded = spent >= limit;
    const isApproaching = percent >= 80 && !isExceeded;

    return {
      ...b,
      spent,
      limit,
      percent,
      remaining,
      isExceeded,
      isApproaching,
      category: CATEGORIES[b.categoryId],
    };
  }).sort((a, b) => b.percent - a.percent);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Budget Limits & Alerts</h3>
          <p className="text-xs text-slate-500">Category pacing against assigned monthly caps</p>
        </div>
        <button
          onClick={() => setCurrentView('budgets')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Manage</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List of category budget progress bars */}
      <div className="space-y-3.5">
        {budgetStats.slice(0, 5).map((b) => {
          let statusBadge = (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Safe
            </span>
          );
          let barColor = 'bg-emerald-500';

          if (b.isExceeded) {
            statusBadge = (
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Over Budget
              </span>
            );
            barColor = 'bg-rose-500';
          } else if (b.isApproaching) {
            statusBadge = (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {b.percent}% Limit
              </span>
            );
            barColor = 'bg-amber-500';
          }

          return (
            <div key={b.categoryId} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <CategoryIcon categoryId={b.categoryId} size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {b.category?.name || b.categoryId}
                  </span>
                </div>
                {statusBadge}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(b.percent, 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-1">
                <span>
                  {settings.currency}{b.spent.toLocaleString()} spent
                </span>
                <span>
                  Limit: {settings.currency}{b.limit.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
