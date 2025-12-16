import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';

type SheetType = 'Dialog' | 'Media' | 'Option' | 'FilterTransaction';

export interface SheetBottomProps {
  type: SheetType;
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function SheetBottom({
  type,
  visible,
  onClose,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'No',
}: SheetBottomProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // Combine root styles using template literals for NativeWind
  const rootClassName = `
    bg-white dark:bg-gray-900 
    pt-6 px-4 pb-6 
    rounded-t-3xl
    ${type === 'Media' ? 'py-12' : ''}
    ${type === 'Option' || type === 'FilterTransaction' ? 'w-full max-w-md self-center' : ''}
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable className={rootClassName} onPress={(e) => e.stopPropagation()}>
          <View className="w-full gap-4">
            {/* Title */}
            {title && (
              <Text className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</Text>
            )}

            {/* Description (chỉ cho Dialog) */}
            {type === 'Dialog' && description && (
              <Text className="text-center text-base text-gray-500 dark:text-gray-400 mb-2 leading-snug">{description}</Text>
            )}

            {/* Custom content */}
            {children}

            {/* Button Group (chỉ cho Dialog) */}
            {type === 'Dialog' && (
              <View className="flex-row gap-4 mt-2">
                <TouchableOpacity
                  className="flex-1 p-4 rounded-2xl items-center justify-center bg-violet-100 dark:bg-gray-800"
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text className="text-lg font-semibold text-violet-500 dark:text-violet-300">{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 p-4 rounded-2xl items-center justify-center bg-violet-500"
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text className="text-lg font-semibold text-white">{confirmText}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
