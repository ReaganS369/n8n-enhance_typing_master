import { Expense, CategoryBudget, UserSettings } from '../types/expense';
import { DEFAULT_SETTINGS, DEFAULT_BUDGETS, INITIAL_EXPENSES } from '../data/seedData';

const STORAGE_KEYS = {
  EXPENSES: 'spendly_expenses_v1',
  BUDGETS: 'spendly_budgets_v1',
  SETTINGS: 'spendly_settings_v1',
};

export const StorageService = {
  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        this.saveExpenses(INITIAL_EXPENSES);
        return INITIAL_EXPENSES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load expenses from localStorage:', e);
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage:', e);
    }
  },

  getBudgets(): CategoryBudget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        this.saveBudgets(DEFAULT_BUDGETS);
        return DEFAULT_BUDGETS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load budgets from localStorage:', e);
      return DEFAULT_BUDGETS;
    }
  },

  saveBudgets(budgets: CategoryBudget[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets to localStorage:', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  },

  resetAllData(): { expenses: Expense[]; budgets: CategoryBudget[]; settings: UserSettings } {
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveBudgets(DEFAULT_BUDGETS);
    this.saveSettings(DEFAULT_SETTINGS);
    return {
      expenses: INITIAL_EXPENSES,
      budgets: DEFAULT_BUDGETS,
      settings: DEFAULT_SETTINGS,
    };
  },

  exportToCSV(expenses: Expense[]): void {
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      `"${(e.merchant || '').replace(/"/g, '""')}"`,
      e.categoryId,
      e.amount,
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spendly_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportToJSON(data: { expenses: Expense[]; budgets: CategoryBudget[]; settings: UserSettings }): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spendly_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importFromJSON(jsonString: string): { expenses: Expense[]; budgets: CategoryBudget[]; settings: UserSettings } {
    const parsed = JSON.parse(jsonString);
    if (!parsed.expenses || !Array.isArray(parsed.expenses)) {
      throw new Error('Invalid backup file: missing expenses array');
    }
    const expenses = parsed.expenses;
    const budgets = Array.isArray(parsed.budgets) ? parsed.budgets : DEFAULT_BUDGETS;
    const settings = parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS;

    this.saveExpenses(expenses);
    this.saveBudgets(budgets);
    this.saveSettings(settings);

    return { expenses, budgets, settings };
  },
};
