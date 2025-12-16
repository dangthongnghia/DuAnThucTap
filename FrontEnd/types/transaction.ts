export interface Transaction {
  id: string;
  title: string; // Main description of the transaction
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // ISO date string
  note?: string; // Optional extra details
  paymentMethod?: string;
  receiptImage?: string | null;
  recurringId?: string; // Link to recurring transaction if auto-generated
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., 1 for every month, 2 for every 2 months
  startDate: string;
  endDate?: string; // Optional end date
  nextDate: string; // Next scheduled date
  lastCreatedDate?: string; // Last date a transaction was created
  isActive: boolean;
  notifyBefore?: number; // Notify X days before
  autoCreate: boolean; // Auto-create transaction or just notify
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
}
