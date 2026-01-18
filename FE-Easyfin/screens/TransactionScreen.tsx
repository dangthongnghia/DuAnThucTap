import React, { useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock Data
const MOCK_DATA = [
  {
    title: 'Hôm nay, 15/01/2026',
    data: [
      { id: 't5', title: 'Cafe Highland', time: '08:30', amount: -45000, type: 'expense', icon: 'coffee', category: 'Ăn uống' },
    ]
  },
  {
    title: 'Hôm qua, 14/01/2026',
    data: [
      { id: 't1', title: 'Siêu thị Go!', time: '19:15', amount: -650000, type: 'expense', icon: 'cart', category: 'Mua sắm' },
    ]
  },
  {
    title: '12/01/2026',
    data: [
      { id: 't4', title: 'Nạp tiền điện thoại', time: '10:00', amount: -50000, type: 'expense', icon: 'cellphone', category: 'Hóa đơn' },
    ]
  },
  {
    title: '11/01/2026',
    data: [
      { id: 't6', title: 'Mua sắm Shopee', time: '14:20', amount: -1200000, type: 'expense', icon: 'shopping', category: 'Mua sắm' },
    ]
  },
  {
    title: '10/01/2026',
    data: [
      { id: 't3', title: 'Thanh toán Netflix', time: '09:00', amount: -260000, type: 'expense', icon: 'movie', category: 'Giải trí' },
    ]
  },
  {
    title: '01/01/2026',
    data: [
      { id: 't2', title: 'Lương tháng 12', time: '08:00', amount: 30000000, type: 'income', icon: 'cash', category: 'Thu nhập' },
    ]
  }
];

// Calculation for stats
const TOTAL_INCOME = 30000000;
const TOTAL_EXPENSE = 2205000;

export default function TransactionScreen() {
  const [filterType, setFilterType] = useState('all'); // all, income, expense

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="flex-row items-center justify-between py-4 px-5 bg-white border-b border-gray-50">
      <View className="flex-row items-center flex-1">
        <View className={`p-3 rounded-full ${item.type === 'expense' ? 'bg-red-50' : 'bg-green-50'} mr-4`}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={24} 
            color={item.type === 'expense' ? '#EF4444' : '#10B981'} 
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-gray-500">{item.category} • {item.time}</Text>
        </View>
      </View>
      <Text className={`font-bold text-base ${item.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
        {item.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View className="bg-gray-50 px-5 py-2">
      <Text className="text-gray-500 font-medium text-sm">{title}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Lịch sử giao dịch</Text>
          <TouchableOpacity>
             <MaterialCommunityIcons name="calendar-month" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-2">
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput 
                placeholder="Tìm kiếm giao dịch" 
                className="flex-1 ml-2 text-base text-gray-800"
                placeholderTextColor="#9CA3AF"
            />
        </View>
      </View>

      {/* Summary Cards */}
      <View className="flex-row px-5 py-4 space-x-4">
         <View className="flex-1 bg-green-50 p-4 rounded-2xl mr-2">
             <View className="flex-row items-center mb-2">
                 <View className="bg-green-100 p-1 rounded-full mr-2">
                    <MaterialCommunityIcons name="arrow-down" size={16} color="#10B981" />
                 </View>
                 <Text className="text-green-700 font-medium">Thu nhập</Text>
             </View>
             <Text className="text-green-700 text-lg font-bold">{formatCurrency(TOTAL_INCOME)}</Text>
         </View>
         <View className="flex-1 bg-red-50 p-4 rounded-2xl ml-2">
             <View className="flex-row items-center mb-2">
                 <View className="bg-red-100 p-1 rounded-full mr-2">
                    <MaterialCommunityIcons name="arrow-up" size={16} color="#EF4444" />
                 </View>
                 <Text className="text-red-700 font-medium">Chi tiêu</Text>
             </View>
             <Text className="text-red-700 text-lg font-bold">{formatCurrency(TOTAL_EXPENSE)}</Text>
         </View>
      </View>

      {/* Transactions List */}
      <SectionList
        sections={MOCK_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
