import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Wallet,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { ViewType } from '../../types/expense';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setIsAddModalOpen,
    currentMonthTotalSpend,
    totalMonthlyBudget,
    settings,
  } = useExpense();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const budgetProgress = Math.min(
    Math.round((currentMonthTotalSpend / (totalMonthlyBudget || 1)) * 100),
    100
  );

  return (
    <aside
      className={`relative hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Floating Edge Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft-sm hover:shadow-soft flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all z-40 hover:scale-110"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800/80 transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2' : 'justify-start px-4'
        }`}
      >
        <div
          className={`flex items-center gap-3 cursor-pointer group ${
            isCollapsed ? 'justify-center' : 'min-w-0'
          }`}
          onClick={() => setCurrentView('overview')}
          title="Spendly Overview"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-soft shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Spendly
              </span>
              <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Personal Finance
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`w-full group flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm transition-all duration-200 shadow-soft hover:shadow-soft-lg active:scale-[0.98] ${
            isCollapsed ? 'p-3' : 'px-4 py-2.5'
          }`}
          title="Add Expense (Ctrl+E)"
        >
          <PlusCircle className="w-5 h-5 text-emerald-400 dark:text-white transition-transform group-hover:rotate-90" />
          {!isCollapsed && <span>Add Expense</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative group ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Mini Budget Health Widget (Desktop expanded) */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-800/50 dark:to-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              Monthly Pace
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
              {budgetProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetProgress > 95
                  ? 'bg-rose-500'
                  : budgetProgress > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {settings.currency}
            {Math.max(totalMonthlyBudget - currentMonthTotalSpend, 0).toLocaleString()} left of{' '}
            {settings.currency}
            {totalMonthlyBudget.toLocaleString()}
          </p>
        </div>
      )}

      {/* User Profile Mini Footer */}
      <div
        className={`p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center ${
          isCollapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          {settings.userName.slice(0, 2).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {settings.userName}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{settings.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
