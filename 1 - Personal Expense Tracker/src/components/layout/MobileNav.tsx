import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { ViewType } from '../../types/expense';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, setIsAddModalOpen } = useExpense();

  const navButtons: { id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Expenses', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 pb-safe">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Left items */}
        {navButtons.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Center Prominent Add Button (Floating FAB) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-soft-lg shadow-emerald-500/40 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Add expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right items */}
        {navButtons.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
