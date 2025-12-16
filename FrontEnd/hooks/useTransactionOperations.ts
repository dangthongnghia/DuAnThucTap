import { useState, useCallback } from 'react';
import { Transaction } from '../types/transaction';
import { generateTransactionId } from '../utils/transactionUtils';

export const useTransactionOperations = () => {
  const [undoStack, setUndoStack] = useState<{ action: string; data: any }[]>([]);

  const createTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateTransactionId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((transaction: Transaction, updates: Partial<Transaction>) => {
    const updatedTransaction: Transaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updatedTransaction;
  }, []);

  const deleteTransaction = useCallback((transactionId: string, transactions: Transaction[]) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (transactionToDelete) {
      // Add to undo stack
      setUndoStack(prev => [...prev, { action: 'delete', data: transactionToDelete }]);
    }
    return transactions.filter(t => t.id !== transactionId);
  }, []);

  const undoLastAction = useCallback(() => {
    const lastAction = undoStack[undoStack.length - 1];
    if (lastAction) {
      setUndoStack(prev => prev.slice(0, -1));
      return lastAction;
    }
    return null;
  }, [undoStack]);

  const clearUndoStack = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    undoLastAction,
    clearUndoStack,
    canUndo: undoStack.length > 0,
  };
};