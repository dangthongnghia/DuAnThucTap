import { useState, useCallback } from 'react';
import { RecurringTransaction, Transaction } from '../types/transaction';
import { generateTransactionId } from '../utils/transactionUtils';

export const useRecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  const addRecurringTransaction = useCallback((recurringData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecurring: RecurringTransaction = {
      ...recurringData,
      id: generateTransactionId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecurringTransactions(prev => [...prev, newRecurring]);
    return newRecurring;
  }, []);

  const updateRecurringTransaction = useCallback((id: string, updates: Partial<RecurringTransaction>) => {
    setRecurringTransactions(prev => 
      prev.map(recurring => 
        recurring.id === id 
          ? { ...recurring, ...updates, updatedAt: new Date().toISOString() }
          : recurring
      )
    );
  }, []);

  const deleteRecurringTransaction = useCallback((id: string) => {
    setRecurringTransactions(prev => prev.filter(recurring => recurring.id !== id));
  }, []);

  const toggleRecurringTransaction = useCallback((id: string) => {
    setRecurringTransactions(prev => 
      prev.map(recurring => 
        recurring.id === id 
          ? { ...recurring, isActive: !recurring.isActive, updatedAt: new Date().toISOString() }
          : recurring
      )
    );
  }, []);

  const getNextScheduledDate = useCallback((recurring: RecurringTransaction): Date => {
    const nextDate = new Date(recurring.nextDate);
    const today = new Date();

    if (nextDate <= today && recurring.isActive) {
      // Calculate next occurrence based on frequency and interval
      switch (recurring.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + recurring.interval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (recurring.interval * 7));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + recurring.interval);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + recurring.interval);
          break;
      }
    }

    return nextDate;
  }, []);

  const createTransactionFromRecurring = useCallback((recurring: RecurringTransaction): Transaction => {
    const today = new Date().toISOString().split('T')[0];
    
    const transaction: Transaction = {
      id: generateTransactionId(),
      type: recurring.type,
      category: recurring.category,
      amount: recurring.amount,
      description: recurring.description || recurring.name,
      date: today,
      recurringId: recurring.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update recurring transaction's lastCreatedDate and nextDate
    const nextDate = getNextScheduledDate(recurring);
    updateRecurringTransaction(recurring.id, {
      lastCreatedDate: today,
      nextDate: nextDate.toISOString().split('T')[0],
    });

    return transaction;
  }, [getNextScheduledDate, updateRecurringTransaction]);

  const getUpcomingRecurringTransactions = useCallback((daysAhead: number = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return recurringTransactions.filter(recurring => {
      if (!recurring.isActive) return false;
      
      const nextDate = new Date(recurring.nextDate);
      return nextDate >= today && nextDate <= futureDate;
    });
  }, [recurringTransactions]);

  return {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    createTransactionFromRecurring,
    getUpcomingRecurringTransactions,
    getNextScheduledDate,
  };
};