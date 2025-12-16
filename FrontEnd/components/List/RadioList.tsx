import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../../constants/theme';

interface RadioItem {
  id: string;
  title: string;
}

interface RadioListProps {
  items: RadioItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export default function RadioList({ items, selectedId: initialSelectedId, onSelect }: RadioListProps) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  // Sync state with prop changes
  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <View className="gap-3.5 px-4 pb-4">
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          className={`flex-row items-center justify-between h-[52px] px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg ${
            index === 0 ? 'mt-4' : ''
          }`}
          onPress={() => handleSelect(item.id)}
          activeOpacity={0.7}
        >
          <Text className="font-normal text-base text-gray-900 dark:text-gray-100">{item.title}</Text>

          {selectedId === item.id && (
            <Ionicons name="checkmark-circle" size={32} color={ui.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
