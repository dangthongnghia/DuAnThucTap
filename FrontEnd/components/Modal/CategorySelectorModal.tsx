import React from 'react';
import { View, Text } from 'react-native';
import { SheetBottom } from '../Sheet/SheetBottom';
import { CategorySelector } from '../Category/CategorySelector';
import { Category, expenseCategories, incomeCategories } from '../../constants/categories';

interface CategorySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  type: 'expense' | 'income';
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  type,
}) => {
  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  
  const handleCategorySelect = (category: Category) => {
    onSelect(category.title);
    onClose();
  };

  // Find a default selected category (first one)
  const defaultCategory = categories[0];

  return (
    <SheetBottom
      visible={visible}
      onClose={onClose}
      title={`Chọn danh mục ${type === 'expense' ? 'chi tiêu' : 'thu nhập'}`}
      type="Option"
    >
      <View style={{ padding: 16 }}>
        <CategorySelector
          categories={categories}
          selectedCategory={defaultCategory}
          onSelect={handleCategorySelect}
        />
      </View>
    </SheetBottom>
  );
};