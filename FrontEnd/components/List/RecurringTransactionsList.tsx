import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurringTransaction } from '../../types/transaction';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';

interface RecurringTransactionsListProps {
  onEdit?: (recurring: RecurringTransaction) => void;
}

export default function RecurringTransactionsList({ onEdit }: RecurringTransactionsListProps) {
  const { recurringTransactions, deleteRecurringTransaction, toggleRecurringTransaction } = useData();
  const { t } = useTranslation();

  const getFrequencyText = (frequency: string, interval: number) => {
    const freqMap: Record<string, string> = {
      daily: interval === 1 ? 'Hàng ngày' : `Mỗi ${interval} ngày`,
      weekly: interval === 1 ? 'Hàng tuần' : `Mỗi ${interval} tuần`,
      monthly: interval === 1 ? 'Hàng tháng' : `Mỗi ${interval} tháng`,
      yearly: interval === 1 ? 'Hàng năm' : `Mỗi ${interval} năm`,
    };
    return freqMap[frequency] || frequency;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderItem = ({ item }: { item: RecurringTransaction }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.category}</Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          <Switch
            value={item.isActive}
            onValueChange={() => toggleRecurringTransaction(item.id)}
            trackColor={{ false: '#d1d5db', true: '#7f3dff' }}
            thumbColor={item.isActive ? '#ffffff' : '#f3f4f6'}
          />
          
          <TouchableOpacity onPress={() => onEdit?.(item)} className="p-1">
            <Ionicons name="pencil" size={20} color="#7f3dff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => deleteRecurringTransaction(item.id)} className="p-1">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount */}
      <View className="flex-row items-center justify-between mb-2">
        <Text
          className={`text-xl font-bold ${
            item.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        
        <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
          <Ionicons 
            name={item.frequency === 'daily' ? 'calendar' : 
                  item.frequency === 'weekly' ? 'calendar-outline' :
                  item.frequency === 'monthly' ? 'calendar' : 'time'} 
            size={14} 
            color="#6b7280" 
          />
          <Text className="text-xs text-gray-600 ml-1">
            {getFrequencyText(item.frequency, item.interval)}
          </Text>
        </View>
      </View>

      {/* Dates */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-500">Ngày tiếp theo</Text>
          <Text className="text-sm font-medium text-gray-700">{formatDate(item.nextDate)}</Text>
        </View>
        
        {item.lastCreatedDate && (
          <View>
            <Text className="text-xs text-gray-500">Lần cuối</Text>
            <Text className="text-sm font-medium text-gray-700">{formatDate(item.lastCreatedDate)}</Text>
          </View>
        )}
        
        {item.autoCreate && (
          <View className="bg-blue-100 px-2 py-1 rounded">
            <Text className="text-xs text-blue-700 font-medium">Tự động</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {item.description && (
        <Text className="text-sm text-gray-600 mt-2">{item.description}</Text>
      )}
    </View>
  );

  if (recurringTransactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="repeat" size={64} color="#d1d5db" />
        <Text className="text-lg font-semibold text-gray-400 mt-4">
          Chưa có giao dịch định kỳ
        </Text>
        <Text className="text-sm text-gray-400 text-center mt-2">
          Thêm giao dịch định kỳ để tự động tạo các chi phí/thu nhập lặp lại
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recurringTransactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
