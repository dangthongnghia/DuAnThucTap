import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">Danh mục</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => onCategorySelect(cat)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat ? 'bg-violet-500' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedCategory === cat ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};