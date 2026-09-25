import React from 'react';
import { ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { CATEGORIES } from '../../data/categories';

export const RecentTransactionsWidget: React.FC = () => {
  const {
    currentMonthExpenses,
    settings,
    setCurrentView,
    setIsAddModalOpen,
    setEditingExpense,
  } = useExpense();

  const recent = currentMonthExpenses.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500">Latest recorded expenses for this period</p>
        </div>
        <button
          onClick={() => setCurrentView('transactions')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-slate-400 mb-3">No transactions found for this month.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add first expense</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recent.map((exp) => {
            const cat = CATEGORIES[exp.categoryId] || CATEGORIES.other;
            return (
              <div
                key={exp.id}
                onClick={() => setEditingExpense(exp)}
                className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}30`,
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon categoryId={exp.categoryId} size={16} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">
                        {exp.merchant}
                      </p>
                      {exp.isAiCategorized && (
                        <span title="Categorized by AI" className="text-emerald-500">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {cat.name} • {exp.paymentMethod} • {exp.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    -{settings.currency}{exp.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
