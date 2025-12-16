import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { useData } from '../../contexts/DataContext';
import { Search, Filter, Trash2 } from 'lucide-react-native';
import FilterModal from '../../components/Sheet/FilterModal';
import { Colors } from '../../constants/Colors';
import { SwipeableTransactionItem } from '../../components/Transaction';

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
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <SwipeableTransactionItem item={item} onDelete={deleteTransaction} />
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
