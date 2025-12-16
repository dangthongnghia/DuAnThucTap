import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { RecurringTransaction } from '../../types/transaction';
import { useData } from '../../contexts/DataContext';
import { useTranslation } from 'react-i18next';
import {
  BasicInfoSection,
  CategorySelector,
  FrequencySelector,
  DateRangeSelector,
  AdvancedSettings,
  FormActions
} from '../RecurringForm';

interface RecurringTransactionFormProps {
  recurring?: RecurringTransaction;
  onSave?: () => void;
  onCancel?: () => void;
}

const CATEGORIES_EXPENSE = ['Food', 'Shopping', 'Transportation', 'Subscription', 'Bills', 'Other'];
const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export default function RecurringTransactionForm({
  recurring,
  onSave,
  onCancel,
}: RecurringTransactionFormProps) {
  const { addRecurringTransaction, updateRecurringTransaction } = useData();
  const { t } = useTranslation();

  const [name, setName] = useState(recurring?.name || '');
  const [amount, setAmount] = useState(recurring?.amount.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(recurring?.type || 'expense');
  const [category, setCategory] = useState(recurring?.category || 'Food');
  const [description, setDescription] = useState(recurring?.description || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    recurring?.frequency || 'monthly'
  );
  const [interval, setInterval] = useState(recurring?.interval.toString() || '1');
  const [startDate, setStartDate] = useState(recurring?.startDate ? new Date(recurring.startDate) : new Date());
  const [hasEndDate, setHasEndDate] = useState(!!recurring?.endDate);
  const [endDate, setEndDate] = useState(recurring?.endDate ? new Date(recurring.endDate) : new Date());
  const [autoCreate, setAutoCreate] = useState(recurring?.autoCreate ?? true);
  const [notifyBefore, setNotifyBefore] = useState(recurring?.notifyBefore?.toString() || '1');
  const [isActive, setIsActive] = useState(recurring?.isActive ?? true);



  const categories = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [type]);

  const calculateNextDate = (start: Date, freq: string, intv: number): Date => {
    const next = new Date(start);
    switch (freq) {
      case 'daily':
        next.setDate(next.getDate() + intv);
        break;
      case 'weekly':
        next.setDate(next.getDate() + intv * 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + intv);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + intv);
        break;
    }
    return next;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên giao dịch');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const numInterval = parseInt(interval);
    if (isNaN(numInterval) || numInterval <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập khoảng thời gian hợp lệ');
      return;
    }

    const nextDate = calculateNextDate(startDate, frequency, numInterval);

    const recurringData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      amount: numAmount,
      type,
      category,
      description: description.trim(),
      frequency,
      interval: numInterval,
      startDate: startDate.toISOString(),
      endDate: hasEndDate ? endDate.toISOString() : undefined,
      nextDate: recurring?.nextDate || nextDate.toISOString(),
      lastCreatedDate: recurring?.lastCreatedDate,
      isActive,
      autoCreate,
      notifyBefore: parseInt(notifyBefore) || 1,
    };

    try {
      if (recurring) {
        await updateRecurringTransaction({ ...recurringData, id: recurring.id, createdAt: recurring.createdAt, updatedAt: new Date().toISOString() });
      } else {
        await addRecurringTransaction(recurringData);
      }
      onSave?.();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu giao dịch định kỳ');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <BasicInfoSection
          name={name}
          amount={amount}
          type={type}
          onNameChange={setName}
          onAmountChange={setAmount}
          onTypeChange={setType}
        />

        <CategorySelector
          categories={categories}
          selectedCategory={category}
          onCategorySelect={setCategory}
        />

        <FrequencySelector
          frequency={frequency}
          interval={interval}
          onFrequencyChange={setFrequency}
          onIntervalChange={setInterval}
        />

        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          hasEndDate={hasEndDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onHasEndDateChange={setHasEndDate}
        />

        <AdvancedSettings
          notifyBefore={notifyBefore}
          autoCreate={autoCreate}
          isActive={isActive}
          description={description}
          onNotifyBeforeChange={setNotifyBefore}
          onAutoCreateChange={setAutoCreate}
          onIsActiveChange={setIsActive}
          onDescriptionChange={setDescription}
        />

        <FormActions
          isEditMode={!!recurring}
          onCancel={onCancel}
          onSave={handleSave}
        />
      </View>
    </ScrollView>
  );
}
