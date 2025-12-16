import React from 'react';
import { View } from 'react-native';
import { SheetBottom } from '../Sheet/SheetBottom';
import { PaymentMethodSelector, PaymentMethod, paymentMethods } from '../Payment/PaymentMethodSelector';

interface PaymentMethodSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  currentMethod: string;
}

export const PaymentMethodSelectorModal: React.FC<PaymentMethodSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentMethod,
}) => {
  const handleMethodSelect = (method: PaymentMethod) => {
    onSelect(method.name);
    onClose();
  };

  // Find the selected method or default to first one
  const selectedMethod = paymentMethods.find(m => m.name === currentMethod) || paymentMethods[0];

  return (
    <SheetBottom
      visible={visible}
      onClose={onClose}
      title="Chọn phương thức thanh toán"
      type="Option"
    >
      <View style={{ padding: 16 }}>
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onSelect={handleMethodSelect}
        />
      </View>
    </SheetBottom>
  );
};