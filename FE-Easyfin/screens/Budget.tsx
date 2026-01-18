import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';

// Mock Data
const MOCK_BUDGETS = [
  { 
    id: '1', 
    category: 'Ăn uống', 
    spent: 4500000, 
    limit: 6000000, 
    icon: 'food-variant', 
    color: 'bg-orange-500',
    iconColor: '#F97316'
  },
  { 
    id: '2', 
    category: 'Di chuyển', 
    spent: 1200000, 
    limit: 2000000, 
    icon: 'bus', 
    color: 'bg-blue-500',
    iconColor: '#3B82F6'
  },
  { 
    id: '3', 
    category: 'Mua sắm', 
    spent: 2800000, 
    limit: 2500000, 
    icon: 'shopping', 
    color: 'bg-pink-500',
    iconColor: '#EC4899'
  },
  { 
    id: '4', 
    category: 'Giải trí', 
    spent: 500000, 
    limit: 1500000, 
    icon: 'ticket', 
    color: 'bg-purple-500',
    iconColor: '#A855F7'
  },
    { 
    id: '5', 
    category: 'Hóa đơn', 
    spent: 1800000, 
    limit: 2000000, 
    icon: 'file-document-outline', 
    color: 'bg-emerald-500',
    iconColor: '#10B981'
  },
];

export default function BudgetScreen() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  };

  const calculateProgress = (spent: number, limit: number) => {
    const progress = (spent / limit) * 100;
    return Math.min(progress, 100);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const totalBudget = MOCK_BUDGETS.reduce((acc, item) => acc + item.limit, 0);
  const totalSpent = MOCK_BUDGETS.reduce((acc, item) => acc + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white flex-row justify-between items-center shadow-sm z-10">
        <View>
             <Text className="text-gray-500 text-sm font-medium">Tháng 1, 2026</Text>
             <TouchableOpacity className="flex-row items-center mt-1">
                <Text className="text-2xl font-bold text-gray-800 mr-1">Ngân sách chi tiêu</Text>
                <Icon name="chevron-down" size={24} color="#374151" />
             </TouchableOpacity>
        </View>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
           <Icon name="dots-horizontal" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View className="mx-5 mt-5 p-5 bg-emerald-600 rounded-3xl shadow-lg shadow-emerald-200">
           <Text className="text-white/80 font-medium mb-1">Tổng quan tháng này</Text>
           <View className="flex-row items-end justify-between">
              <View>
                 <Text className="text-3xl font-bold text-white mb-1">{formatCurrency(totalRemaining)}</Text>
                 <Text className="text-emerald-100 text-sm">Còn lại để chi tiêu</Text>
              </View>
              <View className="items-end">
                 <Text className="text-white font-bold">{Math.round((totalSpent / totalBudget) * 100)}%</Text>
                 <View className="w-24 h-2 bg-emerald-900/30 rounded-full mt-1 overflow-hidden">
                    <View 
                       style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }} 
                       className="h-full bg-white rounded-full" 
                    />
                 </View>
              </View>
           </View>
           
           <View className="flex-row mt-6 pt-6 border-t border-white/20">
              <View className="flex-1">
                 <Text className="text-emerald-100 text-xs mb-1">Đã chi</Text>
                 <Text className="text-white font-bold">{formatCurrency(totalSpent)}</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/20 mx-4" />
              <View className="flex-1">
                 <Text className="text-emerald-100 text-xs mb-1">Tổng ngân sách</Text>
                 <Text className="text-white font-bold">{formatCurrency(totalBudget)}</Text>
              </View>
           </View>
        </View>

        {/* Budget List Header */}
        <View className="flex-row justify-between items-center px-5 mt-8 mb-4">
           <Text className="text-lg font-bold text-gray-800">Danh mục</Text>
           <TouchableOpacity>
              <Text className="text-emerald-600 font-semibold">Tạo mới</Text>
           </TouchableOpacity>
        </View>

        {/* List Items */}
        <View className="px-5 pb-24">
           {MOCK_BUDGETS.map((item) => {
             const isOverBudget = item.spent > item.limit;
             const remaining = item.limit - item.spent;
             
             return (
               <View key={item.id} className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                 <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                       <View className={`w-10 h-10 rounded-full items-center justify-center bg-gray-50 mr-3`}>
                          <Icon name={item.icon as any} size={24} color={item.iconColor} />
                       </View>
                       <View>
                          <Text className="text-base font-bold text-gray-800">{item.category}</Text>
                          <Text className="text-xs text-gray-400">
                            {remaining < 0 ? 'Vượt quá' : 'Còn lại'}: {formatCurrency(Math.abs(remaining))}
                          </Text>
                       </View>
                    </View>
                    <Text className="text-base font-bold text-gray-800">{formatCurrency(item.limit)}</Text>
                 </View>

                 {/* Progress Bar */}
                 <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                       style={{ width: `${calculateProgress(item.spent, item.limit)}%` }} 
                       className={`h-full rounded-full ${getProgressColor(item.spent, item.limit)}`}
                    />
                 </View>
                 
                 <View className="flex-row justify-between mt-2">
                    <Text className={`text-xs font-semibold ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
                       {formatCurrency(item.spent)}
                    </Text>
                    <Text className={`text-xs font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>
                       {Math.round((item.spent / item.limit) * 100)}%
                    </Text>
                 </View>
               </View>
             );
           })}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-5 w-14 h-14 bg-emerald-600 rounded-full items-center justify-center shadow-lg shadow-emerald-300"
        activeOpacity={0.8}
      >
         <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
