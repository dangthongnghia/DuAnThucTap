import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../../services/api/transactionService';
import { Transaction } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { storeData, getData } from '../../lib/storage';

/**
 * Hook to fetch all transactions (Smart: Handles Remote vs Local)
 */
export const useTransactions = (filters?: any) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['transactions', filters, isAuthenticated],
        queryFn: async () => {
            if (isAuthenticated) {
                const response = await transactionService.getTransactions(filters);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch transactions');
                }
                return response.data;
            } else {
                // Guest mode logic
                const stored = (await getData('transactions')) || [];
                // Apply simple local filtering if needed (mocking backend behavior)
                let filtered = [...stored];
                if (filters?.type) filtered = filtered.filter((t: any) => t.type === filters.type);

                const income = filtered.filter((t: any) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const expenses = filtered.filter((t: any) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

                return {
                    transactions: filtered,
                    totalIncome: income,
                    totalExpense: expenses,
                    totalCount: filtered.length,
                    hasMore: false,
                };
            }
        },
    });
};

/**
 * Hook to fetch a single transaction by ID
 */
export const useTransaction = (id?: string) => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['transactions', id, isAuthenticated],
        queryFn: async () => {
            if (!id) return null;
            if (isAuthenticated) {
                const response = await transactionService.getTransaction(id);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch transaction');
                }
                return response.data;
            } else {
                const stored = (await getData('transactions')) || [];
                return stored.find((t: any) => t.id === id) || null;
            }
        },
        enabled: !!id,
    });
};

/**
 * Hook to create a new transaction
 */
export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async (data: any) => {
            if (isAuthenticated) {
                const response = await transactionService.createTransaction(data);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to create transaction');
                }
                return response.data;
            } else {
                const stored = (await getData('transactions')) || [];
                const newTrans = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
                const updated = [newTrans, ...stored];
                await storeData('transactions', updated);
                return newTrans;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

/**
 * Hook to update an existing transaction
 */
export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            if (isAuthenticated) {
                const response = await transactionService.updateTransaction(id, data);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to update transaction');
                }
                return response.data;
            } else {
                const stored = (await getData('transactions')) || [];
                const updated = stored.map((t: any) => t.id === id ? { ...t, ...data } : t);
                await storeData('transactions', updated);
                return updated.find((t: any) => t.id === id);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

/**
 * Hook to delete a transaction
 */
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            if (isAuthenticated) {
                const response = await transactionService.deleteTransaction(id);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete transaction');
                }
                return response.data;
            } else {
                const stored = (await getData('transactions')) || [];
                const updated = stored.filter((t: any) => t.id !== id);
                await storeData('transactions', updated);
                return id;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};
