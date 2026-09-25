import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useExpense();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          let borderColor = 'border-slate-200 dark:border-slate-800';

          if (toast.type === 'error') {
            icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            borderColor = 'border-rose-200 dark:border-rose-900/50';
          } else if (toast.type === 'warning') {
            icon = <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
            borderColor = 'border-amber-200 dark:border-amber-900/50';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
            borderColor = 'border-blue-200 dark:border-blue-900/50';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 shadow-soft-lg border ${borderColor} flex items-start gap-3`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {toast.description}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
