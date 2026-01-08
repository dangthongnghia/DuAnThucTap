import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../../hooks/api/useTransactions';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, TrendingUp, TrendingDown, Wallet, ArrowUpDown } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';
import { Colors } from '../../constants/Colors';
import { SwipeableTransactionItem } from '../../components/Transaction';
import { Transaction } from '../../contexts/DataContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [refreshing, setRefreshing] = useState(false);
  const { data: transactionInfo, isLoading: loading, refetch } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const transactions = (transactionInfo?.transactions || []) as unknown as Transaction[];
  const income = transactionInfo?.totalIncome || 0;
  const expenses = transactionInfo?.totalExpense || 0;
  const accountBalance = income - expenses;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const recentTransactions = useMemo(() => {
    const data = [...transactions];
    if (sortBy === 'amount') {
      // Sắp xếp theo số tiền giảm dần
      data.sort((a, b) => b.amount - a.amount);
    } else {
      // Sắp xếp theo ngày giảm dần (mặc định)
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return data.slice(0, 5);
  }, [transactions, sortBy]);

  if (loading) {
    return (
      <ScreenWrapper className="justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center bg-background">
          <View>
            <Typography variant="caption" className="mb-1">{getGreeting()}</Typography>
            <Typography variant="h3">{user?.name || 'Guest'}</Typography>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="h-10 w-10 rounded-full bg-secondary items-center justify-center"
          >
            <Bell size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <View className="px-6 mb-6">
          <Card variant="default" className="bg-primary border-none shadow-xl shadow-primary/30">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Typography variant="caption" className="text-primary-foreground/80 mb-1">Total Balance</Typography>
                <Typography variant="h1" className="text-primary-foreground">
                  {formatCurrency(accountBalance)}
                </Typography>
              </View>
              <View className="bg-white/20 p-2 rounded-xl">
                <Wallet size={24} color="white" />
              </View>
            </View>

            <View className="flex-row gap-4 mt-4">
              <View className="flex-1 bg-white/10 rounded-2xl p-3 flex-row items-center gap-3">
                <View className="bg-white/20 h-8 w-8 rounded-full items-center justify-center">
                  <TrendingDown size={16} color="white" />
                </View>
                <View>
                  <Typography variant="small" className="text-primary-foreground/80">Income</Typography>
                  <Typography variant="body" className="text-primary-foreground font-semibold">
                    {formatCurrency(income)}
                  </Typography>
                </View>
              </View>
              <View className="flex-1 bg-white/10 rounded-2xl p-3 flex-row items-center gap-3">
                <View className="bg-white/20 h-8 w-8 rounded-full items-center justify-center">
                  <TrendingUp size={16} color="white" />
                </View>
                <View>
                  <Typography variant="small" className="text-primary-foreground/80">Expenses</Typography>
                  <Typography variant="body" className="text-primary-foreground font-semibold">
                    {formatCurrency(expenses)}
                  </Typography>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="h4">Recent Activity</Typography>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setSortBy(prev => prev === 'date' ? 'amount' : 'date')}
                className="flex-row items-center bg-slate-700 px-3 py-1.5 rounded-full"
              >
                <ArrowUpDown size={14} color={theme.foreground} />
                <Typography variant="caption" className="ml-1 font-medium">
                  {sortBy === 'date' ? 'Date' : 'Amount'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/transaction')}>
                <Typography variant="body" className="text-primary font-medium">See all</Typography>
              </TouchableOpacity>
            </View>
          </View>

          <View className="space-y-3">
            {recentTransactions.map((item) => (
              <SwipeableTransactionItem
                key={item.id}
                item={item}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}

            {transactions.length === 0 && (
              <Card className="items-center py-8">
                <Typography variant="body" className="text-muted-foreground text-center mb-4">
                  No transactions yet
                </Typography>
                <TouchableOpacity
                  onPress={() => router.push('/add')}
                  className="bg-primary px-6 py-2 rounded-full"
                >
                  <Typography className="text-primary-foreground font-medium">Add First</Typography>
                </TouchableOpacity>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
