import React from 'react';
import { View } from 'react-native';
import { SheetBottom } from '../Sheet/SheetBottom';
import { CategorySelector } from '../Category/CategorySelector';
import { useData } from '../../contexts/DataContext';
import { Category } from '../../services/api/categoryService';

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
  const { categories } = useData();

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type && c.isActive);

  const handleCategorySelect = (category: Category) => {
    onSelect(category.name);
    onClose();
  };

  // Find a default selected category (first one) or null
  const defaultCategory = filteredCategories.length > 0 ? filteredCategories[0] : undefined;

  // We need to map API Category to Component expected format if they differ
  // CategorySelector expects { id, title, icon, color, keywords? }
  // API Category is { id, name, type, icon?, color?, isSystem... }
  // We need to adapt it. CategorySelector uses 'title', API uses 'name'.

  const adaptedCategories = filteredCategories.map(c => ({
    id: c.id,
    title: c.name,
    icon: (c.icon || 'help-circle-outline') as any, // Cast to any to bypass exact icon name check for now
    color: c.color || '#cccccc',
    keywords: []
  }));

  const adaptedDefault = defaultCategory ? {
    id: defaultCategory.id,
    title: defaultCategory.name,
    icon: (defaultCategory.icon || 'help-circle-outline') as any,
    color: defaultCategory.color || '#cccccc'
  } : undefined;

  return (
    <SheetBottom
      visible={visible}
      onClose={onClose}
      title={`Chọn danh mục ${type === 'expense' ? 'chi tiêu' : 'thu nhập'}`}
      type="Option"
    >
      <View style={{ padding: 16 }}>
        <CategorySelector
          categories={adaptedCategories}
          selectedCategory={adaptedDefault!}
          onSelect={(c) => onSelect(c.title)}
        />
      </View>
    </SheetBottom>
  );
};