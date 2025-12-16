import { Transaction } from '../types/transaction';

export const generateTransactionId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const filterTransactionsByAmount = (
  transactions: Transaction[], 
  minAmount?: number, 
  maxAmount?: number
): Transaction[] => {
  return transactions.filter(transaction => {
    if (minAmount !== undefined && transaction.amount < minAmount) return false;
    if (maxAmount !== undefined && transaction.amount > maxAmount) return false;
    return true;
  });
};

export const sortTransactions = (transactions: Transaction[], sortBy: string): Transaction[] => {
  return [...transactions].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'description':
        return a.description.localeCompare(b.description);
      default:
        return 0;
    }
  });
};

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};

export const calculateTotalAmount = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
  }, 0);
};

export const getTransactionsByCategory = (
  transactions: Transaction[], 
  category: string
): Transaction[] => {
  return transactions.filter(transaction => transaction.category === category);
};

export const getTransactionsByType = (
  transactions: Transaction[], 
  type: 'income' | 'expense'
): Transaction[] => {
  return transactions.filter(transaction => transaction.type === type);
};