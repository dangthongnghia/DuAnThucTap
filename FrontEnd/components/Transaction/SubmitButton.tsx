import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

interface SubmitButtonProps {
  isEditMode: boolean;
  transactionType: 'Expense' | 'Income';
  onPress: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isEditMode,
  transactionType,
  onPress
}) => {
  const { isDarkMode } = useSettings();

  const getButtonColor = () => {
    if (transactionType === 'Expense') {
      return isDarkMode ? '#DC2626' : '#EF4444'; // darker red for dark mode
    } else {
      return isDarkMode ? '#059669' : '#10B981'; // darker green for dark mode
    }
  };

  return (
    <TouchableOpacity
      className="rounded-2xl p-5 items-center justify-center mt-6 shadow-lg"
      style={{
        backgroundColor: getButtonColor()
      }}
      onPress={onPress}
      activeOpacity={0.8}>
      <View className="flex-row items-center">
        <Ionicons
          name={isEditMode ? 'checkmark-circle-outline' : 'add-circle-outline'}
          size={24}
          color="#ffffff"
        />
        <Text className="text-white font-bold text-lg ml-2">
          {isEditMode ? 'Save Changes' : 'Add Transaction'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};