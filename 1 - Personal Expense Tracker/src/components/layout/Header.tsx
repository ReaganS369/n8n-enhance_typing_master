import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Sparkles,
  Plus,
  Moon,
  Sun,
  Settings as SettingsIcon,
  ChevronDown,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export const Header: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    setIsAddModalOpen,
    setIsCommandPaletteOpen,
    setCurrentView,
    settings,
  } = useExpense();

  // Dark mode state with document class toggle
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const formatMonthLabel = (monthKey: string) => {
    try {
      const [y, m] = monthKey.split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthKey;
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Brand & Month Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand Logo */}
        <div
          className="flex md:hidden items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView('overview')}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">Spendly</span>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-colors px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{formatMonthLabel(selectedMonth)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Select month"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Status Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Gemini AI Auto-Categorizer</span>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Shortcut */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-400 text-xs md:text-sm border border-slate-200/50 dark:border-slate-700/50 transition-colors"
          title="Search transactions (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Search expenses...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setCurrentView('settings')}
          className="hidden sm:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Settings"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Primary Add Expense CTA (Visible on all viewports) */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs md:text-sm font-semibold transition-all shadow-soft shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add Expense</span>
        </button>

        {/* User Avatar */}
        <div
          onClick={() => setCurrentView('settings')}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-soft hover:opacity-90 transition-opacity"
          title={settings.userName}
        >
          {settings.userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
