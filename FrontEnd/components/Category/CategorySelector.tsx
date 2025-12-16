import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../constants/categories';
import { useSettings } from '../../contexts/SettingsContext';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category;
  onSelect: (category: Category) => void;
  suggestedCategory?: Category | null;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelect,
  suggestedCategory,
}) => {
  const { isDarkMode } = useSettings();

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Category
        </Text>
        {suggestedCategory && suggestedCategory.id !== selectedCategory.id && (
          <Text className={`text-xs font-medium ${
            isDarkMode ? 'text-violet-400' : 'text-violet-600'
          }`}>
            💡 Suggested: {suggestedCategory.title}
          </Text>
        )}
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategory.id === category.id;
            const isSuggested = suggestedCategory?.id === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => onSelect(category)}
                className={`items-center justify-center p-4 rounded-2xl border-2 min-w-[100px] ${
                  isSelected
                    ? isDarkMode 
                      ? 'bg-violet-900/30 border-violet-500' 
                      : 'bg-violet-50 border-violet-500'
                    : isSuggested
                    ? isDarkMode
                      ? 'bg-yellow-900/30 border-yellow-400'
                      : 'bg-yellow-50 border-yellow-400'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                }`}>
                {isSuggested && !isSelected && (
                  <View className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-xs">💡</Text>
                  </View>
                )}
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ 
                    backgroundColor: isSelected 
                      ? category.color 
                      : isDarkMode ? '#4b5563' : '#e5e7eb' 
                  }}>
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={isSelected ? '#ffffff' : isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold text-center ${
                    isSelected
                      ? isDarkMode 
                        ? 'text-violet-300' 
                        : 'text-violet-700'
                      : isDarkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }`}
                  numberOfLines={2}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};