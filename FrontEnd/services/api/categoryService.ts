import { apiClient, ApiResponse } from './apiClient';

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
    isSystem: boolean;
    isActive: boolean;
}

export interface CreateCategoryRequest {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    type?: 'income' | 'expense';
    icon?: string;
    color?: string;
}

export const categoryService = {
    /**
     * Get all categories
     */
    async getCategories(type?: 'income' | 'expense'): Promise<ApiResponse<Category[]>> {
        const query = type ? `?type=${type}` : '';
        return apiClient.get<Category[]>(`/categories${query}`);
    },

    /**
     * Create new category
     */
    async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
        return apiClient.post<Category>('/categories', data);
    },

    /**
     * Update category
     */
    async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
        return apiClient.put<Category>(`/categories/${id}`, data);
    },

    /**
     * Delete category
     */
    async deleteCategory(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/categories/${id}`);
    }
};
