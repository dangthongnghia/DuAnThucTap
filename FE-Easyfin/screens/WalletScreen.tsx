import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Dummy Data
const MOCK_WALLETS = [
  { id: '1', name: 'Main Wallet', balance: 12500000, currency: 'VND', icon: 'wallet', color: 'bg-emerald-500' },
  { id: '2', name: 'Visa Credit', balance: 5400000, currency: 'VND', icon: 'credit-card', color: 'bg-blue-600' },
  { id: '3', name: 'MoMo', balance: 250000, currency: 'VND', icon: 'cellphone', color: 'bg-pink-600' },
  { id: '4', name: 'Savings', balance: 50000000, currency: 'VND', icon: 'bank', color: 'bg-purple-600' },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', walletId: '1', title: 'Siêu thị Go!', date: '14/01/2026', amount: -650000, type: 'expense', icon: 'cart' },
  { id: 't2', walletId: '1', title: 'Lương tháng 12', date: '01/01/2026', amount: 30000000, type: 'income', icon: 'cash' },
  { id: 't3', walletId: '2', title: 'Thanh toán Netflix', date: '10/01/2026', amount: -260000, type: 'expense', icon: 'movie' },
  { id: 't4', walletId: '3', title: 'Nạp tiền điện thoại', date: '12/01/2026', amount: -50000, type: 'expense', icon: 'cellphone' },
  { id: 't5', walletId: '1', title: 'Cafe Highland', date: '15/01/2026', amount: -45000, type: 'expense', icon: 'coffee' },
  { id: 't6', walletId: '2', title: 'Mua sắm Shopee', date: '11/01/2026', amount: -1200000, type: 'expense', icon: 'shopping' },
];

export default function WalletScreen() {
  const [selectedWallet, setSelectedWallet] = useState<typeof MOCK_WALLETS[0] | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderWalletItem = ({ item }: { item: typeof MOCK_WALLETS[0] }) => (
    <TouchableOpacity
      onPress={() => setSelectedWallet(item)}
      className={`mx-4 mb-4 rounded-2xl p-5 shadow-sm ${item.color}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="p-2 bg-white/20 rounded-full">
          <MaterialCommunityIcons name={item.icon as any} size={24} color="white" />
        </View>
        <TouchableOpacity>
           <MaterialCommunityIcons name="dots-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View className="mt-6">
        <Text className="text-white/80 text-sm font-medium">{item.name}</Text>
        <Text className="text-white text-2xl font-bold mt-1">{formatCurrency(item.balance)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: typeof MOCK_TRANSACTIONS[0] }) => {
    const isExpense = item.type === 'expense';
    return (
      <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
        <View className="flex-row items-center space-x-4 flex-1">
          <View className={`rounded-full p-3 ${isExpense ? 'bg-red-50' : 'bg-green-50'}`}>
            <MaterialCommunityIcons 
              name={item.icon as any} 
              size={24} 
              color={isExpense ? '#EF4444' : '#10B981'} 
            />
          </View>
          <View className="flex-1 ml-3">
             <Text className="text-base font-semibold text-gray-800">{item.title}</Text>
             <Text className="text-sm text-gray-500">{item.date}</Text>
          </View>
        </View>
        <Text className={`font-bold text-base ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
        </Text>
      </View>
    );
  };

  const currentTransactions = selectedWallet 
    ? MOCK_TRANSACTIONS.filter(t => t.walletId === selectedWallet.id)
    : [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center bg-white mb-2">
        <Text className="text-2xl font-bold text-gray-800">Ví của tôi</Text>
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <MaterialCommunityIcons name="plus" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Wallet List */}
      <FlatList
        data={MOCK_WALLETS}
        keyExtractor={item => item.id}
        renderItem={renderWalletItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedWallet}
        onRequestClose={() => setSelectedWallet(null)}
      >
        <View className="flex-1 bg-gray-900/50 justify-end">
           <View className="bg-white rounded-t-3xl h-[85%] overflow-hidden">
             
             {/* Modal Header */}
             <View className={`p-6 ${selectedWallet?.color} pt-8`}>
                <View className="flex-row justify-between items-center mb-6">
                   <TouchableOpacity onPress={() => setSelectedWallet(null)} className="p-2 bg-white/20 rounded-full">
                      <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                   </TouchableOpacity>
                   <Text className="text-white text-lg font-semibold w-full ml-5">Chi tiết ví</Text>
                   <TouchableOpacity className="p-2 bg-white/20 rounded-full">
                      <MaterialCommunityIcons name="cog" size={24} color="white" />
                   </TouchableOpacity>
                </View>

                {/* Wallet Info inside Modal */}
                <View className="items-center mb-4">
                  <View className="p-4 bg-white/20 rounded-full mb-3">
                    <MaterialCommunityIcons name={selectedWallet?.icon as any} size={40} color="white" />
                  </View>
                  <Text className="text-white/80 text-lg">{selectedWallet?.name}</Text>
                  <Text className="text-white text-3xl font-bold mt-1">
                    {selectedWallet ? formatCurrency(selectedWallet.balance) : ''}
                  </Text>
                </View>
             </View>

             {/* Transactions List */}
             <View className="flex-1 bg-white px-5 pt-2">
               <Text className="text-lg font-bold text-gray-800 py-4">Lịch sử giao dịch</Text>
               {currentTransactions.length > 0 ? (
                 <FlatList
                   data={currentTransactions}
                   keyExtractor={item => item.id}
                   renderItem={renderTransactionItem}
                   showsVerticalScrollIndicator={false}
                   contentContainerStyle={{ paddingBottom: 20 }}
                 />
               ) : (
                 <View className="flex-1 justify-center items-center pb-20">
                   <MaterialCommunityIcons name="receipt-text-outline" size={60} color="#E5E7EB" />
                   <Text className="text-gray-400 mt-4">Chưa có giao dịch nào</Text>
                 </View>
               )}
             </View>

           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
