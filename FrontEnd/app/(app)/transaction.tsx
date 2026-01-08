import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { useTransactions, useDeleteTransaction } from '../../hooks/api/useTransactions';
import { Transaction } from '../../contexts/DataContext';
import { Search, Filter, Trash2 } from 'lucide-react-native';
import FilterModal from '../../components/Sheet/FilterModal';
import { Colors } from '../../constants/Colors';
import { SwipeableTransactionItem } from '../../components/Transaction';

export default function TransactionScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { data: transactionInfo, isLoading: loading, refetch } = useTransactions();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const deleteMutation = useDeleteTransaction();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const transactions = (transactionInfo?.transactions || []) as unknown as Transaction[];

  const filteredTransactions = transactions.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.note?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <SwipeableTransactionItem
            item={item}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
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
