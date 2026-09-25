import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Calendar,
  CreditCard,
  FileText,
  Store,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CategoryId, PaymentMethod } from '../../types/expense';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { autoCategorizeExpense } from '../../services/gemini';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Net Banking',
];

export const AddExpenseModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addExpense, settings } = useExpense();

  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [categoryId, setCategoryId] = useState<CategoryId>('food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');

  const [isAiCategorizing, setIsAiCategorizing] = useState<boolean>(false);
  const [aiSuggestionSource, setAiSuggestionSource] = useState<'gemini' | 'heuristic' | null>(null);
  const [userManuallySelectedCategory, setUserManuallySelectedCategory] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & reset state
  useEffect(() => {
    if (isAddModalOpen) {
      setAmount('');
      setMerchant('');
      setCategoryId('food');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
      setAiSuggestionSource(null);
      setUserManuallySelectedCategory(false);
      setErrorMessage('');
      setTimeout(() => amountInputRef.current?.focus(), 150);
    }
  }, [isAddModalOpen]);

  // Real-time AI categorization effect when typing merchant or notes
  useEffect(() => {
    if (!merchant.trim() || userManuallySelectedCategory) return;

    const timer = setTimeout(async () => {
      setIsAiCategorizing(true);
      try {
        const result = await autoCategorizeExpense(merchant, notes, settings.geminiApiKey);
        if (result && result.categoryId) {
          setCategoryId(result.categoryId);
          setAiSuggestionSource(result.source);
        }
      } catch (e) {
        console.error('Categorization error:', e);
      } finally {
        setIsAiCategorizing(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [merchant, notes, userManuallySelectedCategory, settings.geminiApiKey]);

  const handleSelectCategory = (id: CategoryId) => {
    setCategoryId(id);
    setUserManuallySelectedCategory(true);
    setAiSuggestionSource(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount');
      return;
    }
    if (!merchant.trim()) {
      setErrorMessage('Please enter merchant or item description');
      return;
    }

    addExpense({
      amount: numAmount,
      merchant: merchant.trim(),
      categoryId,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      isAiCategorized: aiSuggestionSource !== null,
    });

    setIsAddModalOpen(false);
  };

  const quickAmounts = [100, 250, 500, 1000, 2000];

  return (
    <AnimatePresence>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col z-10"
          >
            {/* Mobile swipe indicator */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

            {/* Header */}
            <div className="px-6 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Expense</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Record a transaction with auto-categorization</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Amount Input with Currency Symbol */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Amount
                </label>
                <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/40 p-3">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 mr-2 font-mono">
                      {settings.currency}
                    </span>
                    <input
                      ref={amountInputRef}
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full bg-transparent text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      required
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
                    {quickAmounts.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(amount) || 0;
                          setAmount((curr + q).toString());
                        }}
                        className="px-2.5 py-1 text-xs font-medium font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Merchant / Description with AI trigger */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Merchant / Item
                  </label>
                  {isAiCategorizing ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse font-medium">
                      <Sparkles className="w-3 h-3" /> Categorizing...
                    </span>
                  ) : aiSuggestionSource ? (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" />
                      Auto-detected: {CATEGORIES[categoryId]?.name}
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy, Milk, Flight ticket, Indigo, Netflix"
                    value={merchant}
                    onChange={(e) => {
                      setMerchant(e.target.value);
                      setUserManuallySelectedCategory(false);
                      setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Tip: Type "milk" or "bread" for grocery, "flight" or "train" for travel.
                </p>
              </div>

              {/* Category Selection Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-semibold shadow-soft-sm'
                            : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <CategoryIcon categoryId={cat.id} size={15} />
                        </div>
                        <span className="text-xs truncate flex-1">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Payment Method Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Notes / Tags (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Add details, receipt reference, or context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold shadow-soft shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
