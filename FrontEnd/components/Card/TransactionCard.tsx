import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Transaction } from '../../contexts/DataContext';
import { useRouter } from 'expo-router';
import { useSettings } from '../../contexts/SettingsContext';
// Helper to format amount
const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign} ${amount.toFixed(2)}`;
};

// Helper to get category details
const getCategoryDetails = (category: string): { icon: keyof typeof Ionicons.glyphMap, iconBgClass: string, iconColorClass: string } => {
    switch (category) {
        case 'Food':
            return { icon: 'fast-food-outline', iconBgClass: 'bg-yellow-100 dark:bg-yellow-900', iconColorClass: 'text-yellow-600 dark:text-yellow-400' };
        case 'Shopping':
            return { icon: 'cart-outline', iconBgClass: 'bg-blue-100 dark:bg-blue-900', iconColorClass: 'text-blue-600 dark:text-blue-400' };
        case 'Transportation':
            return { icon: 'train-outline', iconBgClass: 'bg-indigo-100 dark:bg-indigo-900', iconColorClass: 'text-indigo-600 dark:text-indigo-400' };
        case 'Subscription':
            return { icon: 'newspaper-outline', iconBgClass: 'bg-purple-100 dark:bg-purple-900', iconColorClass: 'text-purple-600 dark:text-purple-400' };
        case 'Salary':
            return { icon: 'wallet-outline', iconBgClass: 'bg-green-100 dark:bg-green-900', iconColorClass: 'text-green-600 dark:text-green-400' };
        default:
            return { icon: 'apps-outline', iconBgClass: 'bg-gray-100 dark:bg-gray-700', iconColorClass: 'text-gray-600 dark:text-gray-400' };
    }
};


interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionItem = ({ transaction, onDelete }: { transaction: Transaction, onDelete: (id: string) => void }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push({ pathname: '/(app)/add', params: { transactionId: transaction.id } });
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [-150, 0],
      outputRange: [0, 150],
      extrapolate: 'clamp',
    });

    return (
      <View className="flex-row w-[150px] mr-4">
        <TouchableOpacity onPress={handleEdit} className="justify-center items-center w-[75px] bg-blue-500 rounded-l-2xl">
          <Animated.Text className="text-white font-semibold text-base p-3" style={{ transform: [{ translateX: trans }] }}>
            Edit
          </Animated.Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(transaction.id)} className="justify-center items-center w-[75px] bg-red-500 rounded-r-2xl">
          <Animated.Text className="text-white font-semibold text-base p-3" style={{ transform: [{ translateX: trans }] }}>
            Delete
          </Animated.Text>
        </TouchableOpacity>
      </View>
    );
  };

  const time = new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const categoryDetails = getCategoryDetails(transaction.category);

  const amountColor = transaction.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
  const { isDarkMode } = useSettings();
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-2xl p-4 mx-1`}>
        <View className="flex-row items-center gap-3">
          <View className={`w-14 h-14 rounded-2xl items-center justify-center ${categoryDetails.iconBgClass}`}>
            <Ionicons
              name={categoryDetails.icon}
              size={24}
              className={categoryDetails.iconColorClass}
            />
          </View>
          <View className="flex-1 flex-row items-center justify-between">
            <View className="gap-1 justify-center">
              <Text className="font-medium text-base text-gray-900 dark:text-gray-100">{transaction.title}</Text>
              <Text className="font-medium text-sm text-gray-500 dark:text-gray-400">{transaction.note}</Text>
            </View>
            <View className="items-end gap-2">
              <Text className={`font-semibold text-base ${amountColor}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </Text>
              <Text className="font-medium text-sm text-gray-500 dark:text-gray-400">{time}</Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  return (
    <View className="gap-2">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} />
      ))}
    </View>
  );
}
