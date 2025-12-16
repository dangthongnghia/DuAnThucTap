import React from 'react';
import { View, Text, TextInput, Switch } from 'react-native';

interface AdvancedSettingsProps {
  notifyBefore: string;
  autoCreate: boolean;
  isActive: boolean;
  description: string;
  onNotifyBeforeChange: (value: string) => void;
  onAutoCreateChange: (value: boolean) => void;
  onIsActiveChange: (value: boolean) => void;
  onDescriptionChange: (value: string) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  notifyBefore,
  autoCreate,
  isActive,
  description,
  onNotifyBeforeChange,
  onAutoCreateChange,
  onIsActiveChange,
  onDescriptionChange
}) => {
  return (
    <>
      {/* Notify Before Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Thông báo trước (ngày)</Text>
        <TextInput
          value={notifyBefore}
          onChangeText={onNotifyBeforeChange}
          placeholder="1"
          keyboardType="numeric"
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Auto Create Toggle */}
      <View className="mb-4 bg-white rounded-xl p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-medium text-gray-900">Tự động tạo giao dịch</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Tự động thêm giao dịch vào ngày định kỳ
            </Text>
          </View>
          <Switch
            value={autoCreate}
            onValueChange={onAutoCreateChange}
            trackColor={{ false: '#d1d5db', true: '#7f3dff' }}
            thumbColor={autoCreate ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Active Toggle */}
      <View className="mb-4 bg-white rounded-xl p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-medium text-gray-900">Kích hoạt</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Bật/tắt giao dịch định kỳ này
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={onIsActiveChange}
            trackColor={{ false: '#d1d5db', true: '#7f3dff' }}
            thumbColor={isActive ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Ghi chú</Text>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Thêm ghi chú..."
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
          style={{ textAlignVertical: 'top' }}
        />
      </View>
    </>
  );
};