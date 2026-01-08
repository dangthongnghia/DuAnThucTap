import { Category } from '../services/api/categoryService';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'isSystem' | 'isActive'>[] = [
    { name: 'Ăn uống', type: 'expense', icon: 'restaurant-outline', color: '#FF9500' },
    { name: 'Mua sắm', type: 'expense', icon: 'cart-outline', color: '#FF2D55' },
    { name: 'Di chuyển', type: 'expense', icon: 'bus-outline', color: '#5856D6' },
    { name: 'Giải trí', type: 'expense', icon: 'game-controller-outline', color: '#AF52DE' },
    { name: 'Y tế', type: 'expense', icon: 'medical-outline', color: '#FF3B30' },
    { name: 'Giáo dục', type: 'expense', icon: 'book-outline', color: '#007AFF' },
    { name: 'Hóa đơn', type: 'expense', icon: 'receipt-outline', color: '#34C759' },
    { name: 'Khác', type: 'expense', icon: 'help-circle-outline', color: '#8E8E93' },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'isSystem' | 'isActive'>[] = [
    { name: 'Lương', type: 'income', icon: 'cash-outline', color: '#34C759' },
    { name: 'Thưởng', type: 'income', icon: 'gift-outline', color: '#FFCC00' },
    { name: 'Đầu tư', type: 'income', icon: 'trending-up-outline', color: '#007AFF' },
    { name: 'Khác', type: 'income', icon: 'help-circle-outline', color: '#8E8E93' },
];

export const getDefaultCategories = (): Category[] => {
    const categories: Category[] = [];

    DEFAULT_EXPENSE_CATEGORIES.forEach((cat, index) => {
        categories.push({
            ...cat,
            id: `system-expense-${index}`,
            isSystem: true,
            isActive: true,
        });
    });

    DEFAULT_INCOME_CATEGORIES.forEach((cat, index) => {
        categories.push({
            ...cat,
            id: `system-income-${index}`,
            isSystem: true,
            isActive: true,
        });
    });

    return categories;
};
