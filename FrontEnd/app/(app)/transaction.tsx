import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useData } from '../../contexts/DataContext';
import { Search, Filter, Trash2 } from 'lucide-react-native';
import FilterModal from '../../components/Sheet/FilterModal';
import { formatCurrency } from '../../utils/currency';
import { Colors } from '../../constants/Colors';

export default function TransactionScreen() {
  const { filteredTransactions, loading, deleteTransaction, searchQuery, setSearchQuery } = useData();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  if (loading) {
    return (
      <ScreenWrapper className="justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center bg-background">
        <Typography variant="h3">Transactions</Typography>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="h-10 w-10 rounded-xl border border-input items-center justify-center bg-background"
        >
          <Filter size={20} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-6 py-4">
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.mutedForeground} />}
          className="bg-secondary/50 border-none"
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, gap: 12 }}
        renderItem={({ item }) => (
          <Card className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-4 flex-1">
              <View className={`h-12 w-12 rounded-full items-center justify-center ${item.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                <Typography variant="h4">
                  {item.type === 'income' ? '💰' : '💸'}
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body" className="font-semibold" numberOfLines={1}>
                  {item.category}
                </Typography>
                <Typography variant="caption" numberOfLines={1}>
                  {item.note || 'No description'}
                </Typography>
              </View>
            </View>
            <View className="items-end ml-4">
              <Typography
                variant="body"
                className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
              >
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
              </Typography>
              <Typography variant="caption" className="mb-1">
                {new Date(item.date).toLocaleDateString()}
              </Typography>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Typography variant="body" className="text-muted-foreground">
              No transactions found
            </Typography>
          </View>
        }
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </ScreenWrapper>
  );
}
