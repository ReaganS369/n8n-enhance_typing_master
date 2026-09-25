import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  RotateCcw,
  ReceiptText,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { TransactionItem } from './TransactionItem';
import { CATEGORY_LIST } from '../../data/categories';
import { CategoryId, PaymentMethod } from '../../types/expense';
import { StorageService } from '../../services/storage';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
];

export const TransactionsView: React.FC = () => {
  const {
    filteredExpenses,
    filterState,
    setFilterState,
    setIsAddModalOpen,
    settings,
    expenses,
  } = useExpense();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const resetFilters = () => {
    setFilterState({
      searchQuery: '',
      category: 'all',
      paymentMethod: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date-desc',
    });
  };

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportCSV = () => {
    StorageService.exportToCSV(filteredExpenses);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and audit your complete financial ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export filtered transactions to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-soft shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
        {/* Search & Main Category Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by merchant, note, or amount..."
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-48">
            <select
              value={filterState.category}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  category: e.target.value as CategoryId | 'all',
                }))
              }
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORY_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:w-44">
            <div className="relative">
              <select
                value={filterState.sortBy}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="w-full pl-8 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="merchant-asc">Merchant A-Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Toggle More Filters */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              showAdvancedFilters
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={filterState.paymentMethod}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod | 'all',
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Methods</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filterState.startDate}
                onChange={(e) => setFilterState((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filterState.endDate}
                onChange={(e) => setFilterState((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header: Count & Filtered Total */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredExpenses.length}</span> of {expenses.length} transactions
        </span>
        <span className="font-mono">
          Filtered Sum: <span className="font-bold text-slate-900 dark:text-white">{settings.currency}{totalFilteredAmount.toLocaleString()}</span>
        </span>
      </div>

      {/* Transactions List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No transactions match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search terms, clearing category filters, or selecting a broader date range.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset all filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => (
            <TransactionItem key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
};
