import { useState, useCallback, useMemo } from 'react';
import { Budget, Transaction } from '../types/transaction';
import { generateTransactionId } from '../utils/transactionUtils';

export const useBudgetManagement = (transactions: Transaction[]) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addBudget = useCallback((budgetData: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: generateTransactionId(),
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === id 
          ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
          : budget
      )
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  }, []);

  // Calculate spent amount for each budget based on transactions
  const budgetsWithSpent = useMemo(() => {
    return budgets.map(budget => {
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);
      
      const relevantTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === 'expense' &&
          transaction.category === budget.category &&
          transactionDate >= budgetStart &&
          transactionDate <= budgetEnd
        );
      });

      const spent = relevantTransactions.reduce((total, transaction) => total + transaction.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100,
        isOverBudget: spent > budget.amount,
      };
    });
  }, [budgets, transactions]);

  const getBudgetByCategory = useCallback((category: string) => {
    return budgetsWithSpent.find(budget => budget.category === category);
  }, [budgetsWithSpent]);

  const getActiveBudgets = useCallback(() => {
    const today = new Date();
    return budgetsWithSpent.filter(budget => {
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      return today >= startDate && today <= endDate;
    });
  }, [budgetsWithSpent]);

  const getOverBudgets = useCallback(() => {
    return budgetsWithSpent.filter(budget => budget.isOverBudget);
  }, [budgetsWithSpent]);

  const getBudgetProgress = useCallback((budgetId: string) => {
    const budget = budgetsWithSpent.find(b => b.id === budgetId);
    if (!budget) return null;

    const today = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = Math.min((daysElapsed / totalDays) * 100, 100);

    return {
      timeProgress,
      spentProgress: budget.percentage,
      daysRemaining: Math.max(0, totalDays - daysElapsed),
      isOnTrack: budget.percentage <= timeProgress,
    };
  }, [budgetsWithSpent]);

  return {
    budgets: budgetsWithSpent,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategory,
    getActiveBudgets,
    getOverBudgets,
    getBudgetProgress,
  };
};