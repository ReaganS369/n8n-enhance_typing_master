import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export const DeleteConfirmDialog: React.FC = () => {
  const { deleteConfirmExpense, setDeleteConfirmExpense, deleteExpense, settings } = useExpense();

  if (!deleteConfirmExpense) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDeleteConfirmExpense(null)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10"
        >
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Expense?</h3>
              <p className="text-xs text-slate-500">This action can be undone from the toast.</p>
            </div>
          </div>

          <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">{deleteConfirmExpense.merchant}</p>
            <p className="font-mono mt-0.5 text-slate-500">
              {settings.currency}{deleteConfirmExpense.amount.toLocaleString()} • {deleteConfirmExpense.date}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmExpense(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteExpense(deleteConfirmExpense.id, true);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-soft transition-colors"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
