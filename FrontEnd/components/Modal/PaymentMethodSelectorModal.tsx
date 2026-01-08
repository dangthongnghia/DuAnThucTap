import React from 'react';
import { View } from 'react-native';
import { SheetBottom } from '../Sheet/SheetBottom';
import { PaymentMethodSelector, PaymentMethod } from '../Payment/PaymentMethodSelector';
import { useData } from '../../contexts/DataContext';

interface PaymentMethodSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  currentMethodId?: string;
}

export const PaymentMethodSelectorModal: React.FC<PaymentMethodSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentMethodId,
}) => {
  const { accounts } = useData();

  // Map accounts to PaymentMethod format
  const methods: PaymentMethod[] = accounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    icon: (acc.icon || 'card-outline') as any, // fallback icon
    color: acc.color || '#3b82f6',
  }));

  const handleMethodSelect = (method: PaymentMethod) => {
    onSelect(method);
    onClose();
  };

  // Find the selected method or default to first one
  const selectedMethod = methods.find(m => m.id === currentMethodId) || methods[0];

  return (
    <SheetBottom
      visible={visible}
      onClose={onClose}
      title="Chọn phương thức thanh toán"
      type="Option"
    >
      <View style={{ padding: 16 }}>
        <PaymentMethodSelector
          methods={methods}
          selectedMethod={selectedMethod}
          onSelect={handleMethodSelect}
        />
      </View>
    </SheetBottom>
  );
};