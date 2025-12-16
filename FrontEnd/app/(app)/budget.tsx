import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavigation from '../../components/Navigation/TopNavigation';
import BudgetCardList from '../../components/Card/BudgetCard';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function BudgetScreen() {
  const { budgets, loading } = useData();
  const { isDarkMode } = useSettings();

  // Calculate total budget summary
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.total, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <TopNavigation variant="simple-title" title="Monthly Budget" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Main Budget Summary Card */}
        <View className="px-4 mt-4">
          <View className={`${isDarkMode ? 'bg-violet-900' : 'bg-violet-800'} rounded-2xl p-6 items-center`}>
            <Text className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-300'}`}>Total Budget for October</Text>
            <Text className="text-4xl font-bold text-white mt-2">${totalBudget.toFixed(2)}</Text>
            <View className="w-full h-3 bg-white/20 rounded-full mt-4">
              <View className="h-3 bg-green-400 rounded-full" style={{ width: `${spentPercentage}%` }} />
            </View>
            <View className="flex-row justify-between w-full mt-2">
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-300'}`}>Spent: ${totalSpent.toFixed(2)}</Text>
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-300'}`}>Remaining: ${totalRemaining.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Budget Category List */}
        <View className="mt-8">
            <BudgetCardList budgets={budgets} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
