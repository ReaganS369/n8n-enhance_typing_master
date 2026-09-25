import React from 'react';
import {
  Edit3,
  Trash2,
  Sparkles,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Expense } from '../../types/expense';
import { CATEGORIES } from '../../data/categories';
import { CategoryIcon, CategoryBadge } from '../common/CategoryIcon';
import { useExpense } from '../../context/ExpenseContext';

interface TransactionItemProps {
  expense: Expense;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ expense }) => {
  const { settings, setEditingExpense, setDeleteConfirmExpense } = useExpense();
  const cat = CATEGORIES[expense.categoryId] || CATEGORIES.other;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm hover:shadow-soft hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-3">
      {/* Left: Category Icon & Details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${cat.color}15`,
            borderColor: `${cat.color}30`,
            color: cat.color,
          }}
        >
          <CategoryIcon categoryId={expense.categoryId} size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {expense.merchant}
            </h4>
            {expense.isAiCategorized && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                title="Auto-categorized by AI"
              >
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            )}
            <CategoryBadge categoryId={expense.categoryId} size="sm" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 flex-wrap">
            <span className="font-mono">{expense.date}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" />
              {expense.paymentMethod}
            </span>
            {expense.notes && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-xs" title={expense.notes}>
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{expense.notes}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="text-right">
          <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            -{settings.currency}{expense.amount.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons (Edit / Delete) */}
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingExpense(expense)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit expense"
            aria-label="Edit expense"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmExpense(expense)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete expense"
            aria-label="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
