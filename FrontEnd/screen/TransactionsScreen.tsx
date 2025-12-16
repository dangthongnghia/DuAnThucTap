import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopNavigation from '../components/Navigation/TopNavigation';
import { useTransactions } from '../contexts/TransactionContext';
import { useSettings } from '../contexts/SettingsContext';
import { paymentMethods } from '../components/Payment/PaymentMethodSelector';

type FilterPeriod = 'Day' | 'Week' | 'Month' | 'Year';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function TransactionsScreen({ navigation }: any) {
  const { transactions, deleteTransaction, refreshTransactions, isLoading } = useTransactions();
  const { isDarkMode } = useSettings();
  
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('Month');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  };

  // Lọc và sắp xếp transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = [...transactions];

    // Filter by period
    const now = new Date();
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      switch (filterPeriod) {
        case 'Day':
          return transactionDate.toDateString() === now.toDateString();
        case 'Week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'Month':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        case 'Year':
          return transactionDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPaymentMethodInfo = (paymentMethodId: string) => {
    return paymentMethods.find(pm => pm.id === paymentMethodId) || paymentMethods[0];
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TopNavigation
        variant="dropdown-with-sort-badge"
        dropdownText={filterPeriod}
        badgeCount={filteredTransactions.length}
        onDropdownPress={() => {
          // Cycle through filter options
          const periods: FilterPeriod[] = ['Day', 'Week', 'Month', 'Year'];
          const currentIndex = periods.indexOf(filterPeriod);
          const nextIndex = (currentIndex + 1) % periods.length;
          setFilterPeriod(periods[nextIndex]);
        }}
        onSortPress={() => {
          // Cycle through sort options
          const sorts: SortOption[] = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc'];
          const currentIndex = sorts.indexOf(sortBy);
          const nextIndex = (currentIndex + 1) % sorts.length;
          setSortBy(sorts[nextIndex]);
        }}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#A78BFA' : '#8B5CF6'}
          />
        }
      >
        {isLoading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={isDarkMode ? '#A78BFA' : '#8B5CF6'} />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons 
              name="receipt-outline" 
              size={64} 
              color={isDarkMode ? '#4B5563' : '#D1D5DB'} 
            />
            <Text className={`mt-4 text-lg font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No transactions found
            </Text>
            <Text className={`mt-2 text-sm ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Try changing the filter period
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <View key={date} className="mb-6">
                {/* Date Header */}
                <Text className={`font-semibold text-sm mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatDate(date)}
                </Text>

                {/* Transactions */}
                <View className="gap-3">
                  {transactions.map((transaction) => {
                    const paymentMethod = getPaymentMethodInfo(transaction.paymentMethod);
                    const isExpense = transaction.type === 'expense';

                    return (
                      <TouchableOpacity
                        key={transaction.id}
                        className={`flex-row items-center p-4 rounded-2xl ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                        onLongPress={() => {
                          // Show delete confirmation
                          if (confirm('Delete this transaction?')) {
                            handleDeleteTransaction(transaction.id);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        {/* Icon */}
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center"
                          style={{ backgroundColor: paymentMethod.color + '20' }}
                        >
                          <Ionicons
                            name={paymentMethod.icon}
                            size={24}
                            color={paymentMethod.color}
                          />
                        </View>

                        {/* Info */}
                        <View className="flex-1 ml-3">
                          <Text className={`font-semibold text-base ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {transaction.category}
                          </Text>
                          {transaction.note && (
                            <Text className={`text-sm mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {transaction.note}
                            </Text>
                          )}
                          <Text className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {paymentMethod.name}
                          </Text>
                        </View>

                        {/* Amount */}
                        <Text
                          className={`font-bold text-lg ${
                            isExpense
                              ? 'text-red-500'
                              : 'text-green-500'
                          }`}
                        >
                          {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-violet-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}