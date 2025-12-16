import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecurringTransactionsList from '../../components/List/RecurringTransactionsList';
import RecurringTransactionForm from '../../components/Form/RecurringTransactionForm';
import { RecurringTransaction } from '../../types/transaction';
import { useTranslation } from 'react-i18next';

export default function RecurringScreen() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | undefined>();

  const handleAddNew = () => {
    setEditingRecurring(undefined);
    setShowForm(true);
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecurring(undefined);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-violet-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-bold">Giao dịch định kỳ</Text>
            <Text className="text-violet-200 text-sm mt-1">
              Quản lý các chi phí & thu nhập lặp lại
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleAddNew}
            className="bg-white rounded-full p-3"
          >
            <Ionicons name="add" size={24} color="#7f3dff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row">
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <View className="flex-1 ml-3">
          <Text className="text-blue-900 font-semibold text-sm">Tự động hóa giao dịch</Text>
          <Text className="text-blue-700 text-xs mt-1">
            Các giao dịch định kỳ sẽ tự động được tạo theo lịch trình. 
            Bạn có thể bật/tắt tính năng này cho từng giao dịch.
          </Text>
        </View>
      </View>

      {/* List */}
      <RecurringTransactionsList onEdit={handleEdit} />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <View className="flex-1 bg-gray-50">
          {/* Modal Header */}
          <View className="bg-violet-500 pt-12 pb-4 px-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={handleCloseForm} className="p-2">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">
              {editingRecurring ? 'Chỉnh sửa' : 'Thêm mới'}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Form */}
          <RecurringTransactionForm
            recurring={editingRecurring}
            onSave={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </View>
      </Modal>
    </View>
  );
}
