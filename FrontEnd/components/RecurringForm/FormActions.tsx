import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface FormActionsProps {
  isEditMode: boolean;
  onCancel?: () => void;
  onSave: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEditMode,
  onCancel,
  onSave
}) => {
  return (
    <View className="flex-row gap-3 mt-6 mb-8">
      <TouchableOpacity
        onPress={onCancel}
        className="flex-1 bg-gray-200 py-4 rounded-xl"
      >
        <Text className="text-center text-gray-700 font-semibold text-base">Hủy</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onSave}
        className="flex-1 bg-violet-500 py-4 rounded-xl"
      >
        <Text className="text-center text-white font-semibold text-base">
          {isEditMode ? 'Cập nhật' : 'Thêm'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};