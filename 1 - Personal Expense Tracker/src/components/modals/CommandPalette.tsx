import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, LayoutDashboard, ReceiptText, PieChart, BarChart3, Settings, Plus, ArrowRight } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { CATEGORIES } from '../../data/categories';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentView,
    setIsAddModalOpen,
    expenses,
    settings,
    setEditingExpense,
  } = useExpense();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const navigationCommands = [
    { label: 'Go to Overview Dashboard', icon: LayoutDashboard, action: () => setCurrentView('overview') },
    { label: 'View All Transactions', icon: ReceiptText, action: () => setCurrentView('transactions') },
    { label: 'Manage Category Budgets', icon: PieChart, action: () => setCurrentView('budgets') },
    { label: 'View Spending Analytics', icon: BarChart3, action: () => setCurrentView('analytics') },
    { label: 'App Settings & Gemini Key', icon: Settings, action: () => setCurrentView('settings') },
    { label: 'Add New Expense', icon: Plus, action: () => setIsAddModalOpen(true) },
  ];

  const filteredNav = navigationCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const matchedExpenses = query.trim()
    ? expenses
        .filter(
          (e) =>
            e.merchant.toLowerCase().includes(query.toLowerCase()) ||
            CATEGORIES[e.categoryId]?.name.toLowerCase().includes(query.toLowerCase()) ||
            (e.notes || '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, merchant, or expense..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {matchedExpenses.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Transactions
                  </p>
                  {matchedExpenses.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => {
                        setEditingExpense(exp);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <CategoryIcon categoryId={exp.categoryId} size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                            {exp.merchant}
                          </p>
                          <p className="text-[10px] text-slate-400">{exp.date}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {settings.currency}{exp.amount.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Items */}
              <div>
                <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Navigation & Shortcuts
                </p>
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to exit</span>
              <span>Quick navigation & search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
