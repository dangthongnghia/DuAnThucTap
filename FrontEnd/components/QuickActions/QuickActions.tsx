import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  title: string;
  amount: number;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const quickActions: QuickAction[] = [
  { id: '1', title: 'Coffee', amount: 5, category: 'Food & Dining', icon: 'cafe-outline', color: '#8b4513' },
  { id: '2', title: 'Lunch', amount: 15, category: 'Food & Dining', icon: 'restaurant-outline', color: '#ef4444' },
  { id: '3', title: 'Taxi', amount: 10, category: 'Transportation', icon: 'car-outline', color: '#3b82f6' },
  { id: '4', title: 'Groceries', amount: 50, category: 'Shopping', icon: 'cart-outline', color: '#f59e0b' },
  { id: '5', title: 'Gym', amount: 30, category: 'Fitness', icon: 'fitness-outline', color: '#14b8a6' },
];

interface QuickActionsProps {
  onActionPress: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  return (
    <View className="mb-6">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3 px-1">
        Quick Add
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row gap-3">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => onActionPress(action)}
              className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200 dark:border-violet-700 rounded-2xl p-4 items-center min-w-[100px]">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: action.color }}>
                <Ionicons name={action.icon} size={24} color="#ffffff" />
              </View>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm text-center mb-1">
                {action.title}
              </Text>
              <Text className="text-violet-600 dark:text-violet-400 font-bold text-base">
                ${action.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
