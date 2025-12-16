import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, ui } from '../../constants/theme';

interface CheckboxItem {
  id: string;
  title: string;
  checked?: boolean;
}

interface CheckboxListProps {
  items: CheckboxItem[];
  onItemToggle?: (id: string, checked: boolean) => void;
}

export default function CheckboxList({ items: initialItems, onItemToggle }: CheckboxListProps) {
  const [items, setItems] = useState(initialItems);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newChecked = !item.checked;
          onItemToggle?.(id, newChecked);
          return { ...item, checked: newChecked };
        }
        return item;
      })
    );
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.item, index === 0 && styles.firstItem]}
          onPress={() => handleToggle(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
          </View>

          {item.checked && (
            <Ionicons name="checkmark-circle" size={32} color={ui.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  firstItem: {
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 16,
    color: theme.colors.baseDarkDark100,
    textAlign: 'left',
  },
});