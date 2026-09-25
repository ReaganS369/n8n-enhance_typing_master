export type CategoryId =
  | 'food'
  | 'groceries'
  | 'travel'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'other';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Net Banking';

export interface Expense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  date: string; // 'YYYY-MM-DD'
  merchant: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  isAiCategorized?: boolean;
  createdAt: number;
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind hex / text class
  bgColor: string; // Tailwind bg class
  borderColor: string;
  description: string;
  defaultKeywords: string[];
}

export interface CategoryBudget {
  categoryId: CategoryId;
  monthlyLimit: number;
}

export interface UserSettings {
  currency: string; // '₹', '$', '€', '£'
  monthlyOverallBudget: number;
  userName: string;
  email: string;
  avatarSeed: string;
  geminiApiKey: string;
  enableConfetti: boolean;
  soundEnabled: boolean;
}

export type ViewType = 'overview' | 'transactions' | 'budgets' | 'analytics' | 'settings';

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'all';
  paymentMethod: PaymentMethod | 'all';
  startDate: string;
  endDate: string;
  minAmount: number | '';
  maxAmount: number | '';
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'merchant-asc';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}
