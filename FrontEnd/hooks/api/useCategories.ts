import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../services/api/categoryService';
import { useAuth } from '../../contexts/AuthContext';
import { storeData, getData } from '../../lib/storage';
import { getDefaultCategories } from '../../constants/DefaultCategories';

/**
 * Hook to fetch all categories (Smart: Handles Remote vs Local)
 */
export const useCategories = () => {
    const { isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ['categories', isAuthenticated],
        queryFn: async () => {
            if (isAuthenticated) {
                const response = await categoryService.getCategories();
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch categories');
                }
                return response.data || [];
            } else {
                // Guest mode logic
                const storedCategories = await getData('categories');
                return storedCategories || getDefaultCategories();
            }
        },
    });
};

/**
 * Hook to create a new category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async (data: CreateCategoryRequest) => {
            if (isAuthenticated) {
                const response = await categoryService.createCategory(data);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to create category');
                }
                return response.data;
            } else {
                // Guest mode
                const stored = (await getData('categories')) || getDefaultCategories();
                const newCat = {
                    ...data,
                    id: Date.now().toString(),
                    isSystem: false,
                    isActive: true
                };
                const updated = [...stored, newCat];
                await storeData('categories', updated);
                return newCat;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Hook to update an existing category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryRequest }) => {
            if (isAuthenticated) {
                const response = await categoryService.updateCategory(id, data);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to update category');
                }
                return response.data;
            } else {
                // Guest mode
                const stored = (await getData('categories')) || getDefaultCategories();
                const updated = stored.map((c: any) => c.id === id ? { ...c, ...data } : c);
                await storeData('categories', updated);
                return updated.find((c: any) => c.id === id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    return useMutation({
        mutationFn: async (id: string) => {
            if (isAuthenticated) {
                const response = await categoryService.deleteCategory(id);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete category');
                }
                return response.data;
            } else {
                // Guest mode
                const stored = (await getData('categories')) || getDefaultCategories();
                const updated = stored.filter((c: any) => c.id !== id);
                await storeData('categories', updated);
                return { id };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};
