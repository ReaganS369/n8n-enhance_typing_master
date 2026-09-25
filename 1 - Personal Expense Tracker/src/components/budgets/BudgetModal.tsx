import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CategoryId } from '../../types/expense';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CategoryId;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'food',
}) => {
  const { budgets, updateBudget, settings, showToast } = useExpense();
  const [selectedCat, setSelectedCat] = useState<CategoryId>(initialCategory);
  const [limit, setLimit] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedCat(initialCategory);
      const existing = budgets.find((b) => b.categoryId === initialCategory);
      setLimit(existing ? existing.monthlyLimit.toString() : '5000');
    }
  }, [isOpen, initialCategory, budgets]);

  const handleCategoryChange = (catId: CategoryId) => {
    setSelectedCat(catId);
    const existing = budgets.find((b) => b.categoryId === catId);
    setLimit(existing ? existing.monthlyLimit.toString() : '5000');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit < 0) return;

    updateBudget(selectedCat, numLimit);
    showToast({
      title: 'Budget updated',
      description: `${CATEGORIES[selectedCat]?.name} limit set to ${settings.currency}${numLimit.toLocaleString()}`,
      type: 'success',
    });
    onClose();
  };

  const quickLimits = [2000, 5000, 8000, 10000, 15000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Set Category Budget</h3>
                  <p className="text-xs text-slate-500">Define monthly expenditure threshold</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Category picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {CATEGORY_LIST.map((c) => {
                    const isSelected = selectedCat === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCategoryChange(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <CategoryIcon categoryId={c.id} size={14} />
                        <span className="truncate flex-1">{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Limit Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Monthly Limit ({settings.currency})
                </label>
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800/40 focus-within:border-emerald-500 transition-colors">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-slate-400 font-mono mr-1.5">
                      {settings.currency}
                    </span>
                    <input
                      type="number"
                      step="100"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="8000"
                      className="w-full bg-transparent text-xl font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Quick Limits */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                  {quickLimits.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setLimit(q.toString())}
                      className="px-2 py-0.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500"
                    >
                      {settings.currency}{q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-soft transition-colors"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
