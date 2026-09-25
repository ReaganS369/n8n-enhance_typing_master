import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Expense,
  CategoryBudget,
  UserSettings,
  ViewType,
  FilterState,
  ToastMessage,
  CategoryId,
} from '../types/expense';
import { StorageService } from '../services/storage';
import confetti from 'canvas-confetti';

interface ExpenseContextType {
  expenses: Expense[];
  budgets: CategoryBudget[];
  settings: UserSettings;
  currentView: ViewType;
  selectedMonth: string; // 'YYYY-MM'
  availableMonths: string[];
  filterState: FilterState;
  isAddModalOpen: boolean;
  editingExpense: Expense | null;
  deleteConfirmExpense: Expense | null;
  isCommandPaletteOpen: boolean;
  toasts: ToastMessage[];

  // Setters
  setCurrentView: (view: ViewType) => void;
  setSelectedMonth: (month: string) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingExpense: (expense: Expense | null) => void;
  setDeleteConfirmExpense: (expense: Expense | null) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string, withUndo?: boolean) => void;
  undoLastDelete: () => void;
  updateBudget: (categoryId: CategoryId, monthlyLimit: number) => void;
  updateOverallBudget: (limit: number) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetAllData: () => void;
  importBackupData: (jsonStr: string) => boolean;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Computed metrics
  currentMonthExpenses: Expense[];
  previousMonthExpenses: Expense[];
  currentMonthTotalSpend: number;
  previousMonthTotalSpend: number;
  totalMonthlyBudget: number;
  remainingMonthlyBudget: number;
  spendingChangePercent: number;
  categorySpendMap: Record<CategoryId, number>;
  filteredExpenses: Expense[];
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  paymentMethod: 'all',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date-desc',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => StorageService.getBudgets());
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [currentView, setCurrentView] = useState<ViewType>('overview');

  // Month selector (format 'YYYY-MM')
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Modals & Overlay state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState<Expense | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Filters
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTERS);

  // Toasts & Undo
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deletedExpenseStack, setDeletedExpenseStack] = useState<Expense[]>([]);

  // Persist on change
  useEffect(() => {
    StorageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    StorageService.saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Toast helper
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K and Add Expense
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsAddModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add Expense
  const addExpense = useCallback(
    (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
      const newExpense: Expense = {
        ...expenseData,
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        createdAt: Date.now(),
      };

      setExpenses((prev) => [newExpense, ...prev]);

      showToast({
        title: 'Expense recorded',
        description: `${newExpense.merchant} • ${settings.currency}${newExpense.amount.toLocaleString()}`,
        type: 'success',
      });

      if (settings.enableConfetti && newExpense.amount > 10000) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    },
    [settings.currency, settings.enableConfetti, showToast]
  );

  // Update Expense
  const updateExpense = useCallback(
    (updated: Expense) => {
      setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast({
        title: 'Expense updated',
        description: `${updated.merchant} • ${settings.currency}${updated.amount.toLocaleString()}`,
        type: 'info',
      });
      setEditingExpense(null);
    },
    [settings.currency, showToast]
  );

  // Delete Expense with undo option
  const deleteExpense = useCallback(
    (id: string, withUndo: boolean = true) => {
      const target = expenses.find((e) => e.id === id);
      if (!target) return;

      if (withUndo) {
        setDeletedExpenseStack((prev) => [target, ...prev]);
      }

      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirmExpense(null);

      showToast({
        title: 'Expense removed',
        description: `${target.merchant} (${settings.currency}${target.amount.toLocaleString()})`,
        type: 'warning',
        action: withUndo
          ? {
              label: 'Undo',
              onClick: () => {
                setExpenses((prev) => [target, ...prev]);
                setDeletedExpenseStack((st) => st.filter((s) => s.id !== target.id));
                showToast({
                  title: 'Expense restored',
                  type: 'success',
                });
              },
            }
          : undefined,
      });
    },
    [expenses, settings.currency, showToast]
  );

  const undoLastDelete = useCallback(() => {
    if (deletedExpenseStack.length === 0) return;
    const [last, ...rest] = deletedExpenseStack;
    setExpenses((prev) => [last, ...prev]);
    setDeletedExpenseStack(rest);
    showToast({
      title: 'Expense restored',
      description: `${last.merchant}`,
      type: 'success',
    });
  }, [deletedExpenseStack, showToast]);

  // Budgets & Settings
  const updateBudget = useCallback((categoryId: CategoryId, monthlyLimit: number) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b));
      }
      return [...prev, { categoryId, monthlyLimit }];
    });
  }, []);

  const updateOverallBudget = useCallback((monthlyOverallBudget: number) => {
    setSettings((prev) => ({ ...prev, monthlyOverallBudget }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllData = useCallback(() => {
    const fresh = StorageService.resetAllData();
    setExpenses(fresh.expenses);
    setBudgets(fresh.budgets);
    setSettings(fresh.settings);
    showToast({
      title: 'Reset to demo data',
      description: 'Default sample transactions and budgets restored.',
      type: 'info',
    });
  }, [showToast]);

  const importBackupData = useCallback(
    (jsonStr: string): boolean => {
      try {
        const result = StorageService.importFromJSON(jsonStr);
        setExpenses(result.expenses);
        setBudgets(result.budgets);
        setSettings(result.settings);
        showToast({
          title: 'Backup restored successfully',
          description: `Loaded ${result.expenses.length} transactions.`,
          type: 'success',
        });
        return true;
      } catch (err) {
        showToast({
          title: 'Import failed',
          description: 'The JSON backup file is invalid or corrupted.',
          type: 'error',
        });
        return false;
      }
    },
    [showToast]
  );

  // Available Months calculated from all expenses
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(currentMonthKey);
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        monthsSet.add(e.date.slice(0, 7));
      }
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [expenses, currentMonthKey]);

  // Selected Month Expenses
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Previous Month
  const previousMonthKey = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, [selectedMonth]);

  const previousMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(previousMonthKey));
  }, [expenses, previousMonthKey]);

  // Totals
  const currentMonthTotalSpend = useMemo(() => {
    return currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentMonthExpenses]);

  const previousMonthTotalSpend = useMemo(() => {
    return previousMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [previousMonthExpenses]);

  // Sum of category budgets or overall budget setting
  const totalMonthlyBudget = useMemo(() => {
    const sumCategoryBudgets = budgets.reduce((acc, curr) => acc + curr.monthlyLimit, 0);
    return Math.max(settings.monthlyOverallBudget, sumCategoryBudgets);
  }, [budgets, settings.monthlyOverallBudget]);

  const remainingMonthlyBudget = useMemo(() => {
    return totalMonthlyBudget - currentMonthTotalSpend;
  }, [totalMonthlyBudget, currentMonthTotalSpend]);

  // Month-over-month spend change percent
  const spendingChangePercent = useMemo(() => {
    if (previousMonthTotalSpend === 0) return 0;
    const diff = currentMonthTotalSpend - previousMonthTotalSpend;
    return Math.round((diff / previousMonthTotalSpend) * 100);
  }, [currentMonthTotalSpend, previousMonthTotalSpend]);

  // Category Spend Map
  const categorySpendMap = useMemo(() => {
    const map: Record<CategoryId, number> = {
      food: 0,
      groceries: 0,
      travel: 0,
      shopping: 0,
      bills: 0,
      entertainment: 0,
      health: 0,
      education: 0,
      other: 0,
    };
    currentMonthExpenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });
    return map;
  }, [currentMonthExpenses]);

  // Filtered Expenses (for Transactions view)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesMerchant = e.merchant.toLowerCase().includes(q);
        const matchesNotes = (e.notes || '').toLowerCase().includes(q);
        const matchesAmount = e.amount.toString().includes(q);
        if (!matchesMerchant && !matchesNotes && !matchesAmount) return false;
      }
      // Category
      if (filterState.category !== 'all' && e.categoryId !== filterState.category) {
        return false;
      }
      // Payment Method
      if (filterState.paymentMethod !== 'all' && e.paymentMethod !== filterState.paymentMethod) {
        return false;
      }
      // Date Range
      if (filterState.startDate && e.date < filterState.startDate) return false;
      if (filterState.endDate && e.date > filterState.endDate) return false;

      // Min/Max Amount
      if (filterState.minAmount !== '' && e.amount < Number(filterState.minAmount)) return false;
      if (filterState.maxAmount !== '' && e.amount > Number(filterState.maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      switch (filterState.sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'merchant-asc':
          return a.merchant.localeCompare(b.merchant);
        default:
          return b.date.localeCompare(a.date);
      }
    });
  }, [expenses, filterState]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        settings,
        currentView,
        selectedMonth,
        availableMonths,
        filterState,
        isAddModalOpen,
        editingExpense,
        deleteConfirmExpense,
        isCommandPaletteOpen,
        toasts,
        setCurrentView,
        setSelectedMonth,
        setFilterState,
        setIsAddModalOpen,
        setEditingExpense,
        setDeleteConfirmExpense,
        setIsCommandPaletteOpen,
        addExpense,
        updateExpense,
        deleteExpense,
        undoLastDelete,
        updateBudget,
        updateOverallBudget,
        updateSettings,
        resetAllData,
        importBackupData,
        showToast,
        dismissToast,
        currentMonthExpenses,
        previousMonthExpenses,
        currentMonthTotalSpend,
        previousMonthTotalSpend,
        totalMonthlyBudget,
        remainingMonthlyBudget,
        spendingChangePercent,
        categorySpendMap,
        filteredExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
