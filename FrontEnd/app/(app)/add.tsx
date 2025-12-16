import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';import { useData } from '../../contexts/DataContext';
import { CategorySelectorModal } from '../../components/Modal/CategorySelectorModal';
import { PaymentMethodSelectorModal } from '../../components/Modal/PaymentMethodSelectorModal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ArrowLeft, Calendar, Wallet, GripHorizontal, FileText } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

type TransactionType = 'expense' | 'income';

export default function AddOrEditScreen() {
  const { id, type } = useLocalSearchParams<{ id?: string; type?: string }>();
  const router = useRouter();
  const { addTransaction, updateTransaction, transactions } = useData();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const isEditing = !!id;
  const existingTransaction = isEditing ? transactions.find(t => t.id === id) : null;

  const [transactionType, setTransactionType] = useState<TransactionType>(
    existingTransaction?.type || (type as TransactionType) || 'expense'
  );

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, '')) || 0;
  };

  const [amount, setAmount] = useState(
    existingTransaction?.amount ? formatCurrency(existingTransaction.amount.toString()) : ''
  );
  const [category, setCategory] = useState(existingTransaction?.category || '');
  const [date, setDate] = useState(
    existingTransaction ? new Date(existingTransaction.date) : new Date()
  );
  const [paymentMethod, setPaymentMethod] = useState(
    existingTransaction?.paymentMethod || '1' // Default to Cash (id: '1')
  );
  const [note, setNote] = useState(existingTransaction?.note || '');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isCategorySelectorVisible, setCategorySelectorVisible] = useState(false);
  const [isPaymentSelectorVisible, setPaymentSelectorVisible] = useState(false);

  const resetFormForNewTransaction = () => {
    setAmount('');
    setCategory('');
    setNote('');
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatCurrency(value));
  };

  const handleSave = async () => {
    try {
      if (!category) {
        alert('Please select a category');
        return;
      }

      if (parseCurrency(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const transactionData = {
        title: category,
        amount: parseCurrency(amount),
        category,
        date: date.toISOString(),
        type: transactionType,
        paymentMethod,
        note: note || '',
      };

      if (isEditing && existingTransaction) {
        await updateTransaction(existingTransaction.id, transactionData);
        router.back();
      } else {
        await addTransaction(transactionData);
        resetFormForNewTransaction();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center bg-background">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-4 p-2 -ml-2 rounded-full active:bg-secondary"
          >
            <ArrowLeft size={24} color={theme.foreground} />
          </TouchableOpacity>
          <Typography variant="h3">
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </Typography>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Type Selector */}
          <View className="mx-6 mt-6 p-1 bg-secondary rounded-2xl flex-row">
            <TouchableOpacity
              style={
                transactionType === 'expense'
                  ? {
                      backgroundColor: '#ef4444', // bg-red-500
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }
                  : {}
              }
              className={'flex-1 py-3 rounded-xl items-center'}
              onPress={() => setTransactionType('expense')}
            >
              <Typography
                variant="body"
                className={transactionType === 'expense' ? 'text-white font-semibold' : 'text-muted-foreground'}
              >
                Expense
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                transactionType === 'income'
                  ? {
                      backgroundColor: '#22c55e', // bg-green-500
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }
                  : {}
              }
              className={'flex-1 py-3 rounded-xl items-center'}
              onPress={() => setTransactionType('income')}
            >
              <Typography
                variant="body"
                className={transactionType === 'income' ? 'text-white font-semibold' : 'text-muted-foreground'}
              >
                Income
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View className="mt-8 px-6 items-center">
            <Typography variant="caption" className="mb-2">Amount</Typography>
            <View className="flex-row items-center">
              <TextInput
                className={`text-5xl font-bold text-center min-w-[100px] ${
                  transactionType === 'expense' ? 'text-red-500' : 'text-green-500'
                }`}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="numeric"
                autoFocus={!isEditing}
              />
              <Typography variant="h3" className="ml-2 text-muted-foreground">
                VND
              </Typography>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mt-8 px-6 space-y-4">
            <FormItem
              icon={<GripHorizontal size={24} color={theme.primary} />}
              label="Category"
              value={category || 'Select Category'}
              onPress={() => setCategorySelectorVisible(true)}
            />
            <FormItem
              icon={<Calendar size={24} color={theme.primary} />}
              label="Date"
              value={date.toLocaleDateString('vi-VN')}
              onPress={() => setDatePickerVisibility(true)}
            />
            <FormItem
              icon={<Wallet size={24} color={theme.primary} />}
              label="Payment Method"
              value={paymentMethod}
              onPress={() => setPaymentSelectorVisible(true)}
            />

            <View className="flex-row items-center bg-card p-4 rounded-2xl border border-border">
              <View style={{ backgroundColor: 'hsla(262, 83%, 58%, 0.1)' }} className="mr-4 p-2 rounded-full">
                <FileText size={24} color={theme.primary} />
              </View>
              <TextInput
                className="flex-1 text-base text-foreground placeholder:text-muted-foreground"
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={theme.mutedForeground}
                multiline
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="p-6 bg-background border-t border-border">
          <Button
            label={isEditing ? "Update Transaction" : "Save Transaction"}
            onPress={handleSave}
            variant={transactionType === 'expense' ? 'destructive' : 'primary'}
            className={transactionType === 'income' ? 'bg-green-500' : ''}
          />
        </View>
      </KeyboardAvoidingView>

      <CategorySelectorModal
        visible={isCategorySelectorVisible}
        onClose={() => setCategorySelectorVisible(false)}
        onSelect={(selectedCategory) => {
          setCategory(selectedCategory);
          setCategorySelectorVisible(false);
        }}
        type={transactionType}
      />
      <PaymentMethodSelectorModal
        visible={isPaymentSelectorVisible}
        onClose={() => setPaymentSelectorVisible(false)}
        onSelect={(method) => {
          setPaymentMethod(method);
          setPaymentSelectorVisible(false);
        }}
        currentMethod={paymentMethod}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(selectedDate) => {
          setDate(selectedDate);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        date={date}
        locale="vi-VN"
      />
    </ScreenWrapper>
  );
}

const FormItem = ({ 
  icon, 
  label, 
  value, 
  onPress 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-card p-4 rounded-2xl border border-border active:bg-secondary"
  >
    <View style={{ backgroundColor: 'hsla(262, 83%, 58%, 0.1)' }} className="mr-4 p-2 rounded-full">
      {icon}
    </View>
    <View className="flex-1">
      <Typography variant="caption" className="mb-0.5">{label}</Typography>
      <Typography variant="body" className="font-medium">{value}</Typography>
    </View>
  </TouchableOpacity>
);