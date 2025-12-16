import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const { transactions, loading } = useData();
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const accountBalance = income - expenses;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <ScreenWrapper className="justify-center items-center">
        <ActivityIndicator size="large" color={theme.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
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
            <TouchableOpacity onPress={() => router.push('/transaction')}>
              <Typography variant="body" className="text-primary font-medium">See all</Typography>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {transactions.slice(0, 5).map((t) => (
              <Card key={t.id} className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-4">
                  <View className={`h-12 w-12 rounded-full items-center justify-center ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                    <Typography variant="h4">
                      {t.type === 'income' ? '💰' : '💸'}
                    </Typography>
                  </View>
                  <View>
                    <Typography variant="body" className="font-semibold">{t.category}</Typography>
                    <Typography variant="caption">{t.note || 'No description'}</Typography>
                  </View>
                </View>
                <View className="items-end">
                  <Typography
                    variant="body"
                    className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </Typography>
                  <Typography variant="caption">{new Date(t.date).toLocaleDateString()}</Typography>
                </View>
              </Card>
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