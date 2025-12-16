import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface ListItemData {
  id: string;
  title: string;
  description: string;
  time?: string;
  onPress?: () => void;
}

interface ListItemProps {
  item: ListItemData;
  variant?: 'simple' | 'detailed';
}

export function ListItem({ item, variant = 'simple' }: ListItemProps) {
  if (variant === 'simple') {
    return (
      <TouchableOpacity
        style={styles.simpleContainer}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.simpleContent}>
          <Text style={styles.title}>{item.title}</Text>
          
          <View style={styles.simpleRight}>
            <Text style={styles.description}>{item.description}</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.baseLightLight20} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.detailedContainer}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.detailedContent}>
        <View style={styles.detailedLeft}>
          <View style={styles.detailedTitleRow}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <View style={styles.detailedDescRow}>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>

        {item.time && (
          <View style={styles.detailedRight}>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ListProps {
  items: ListItemData[];
}

export default function List({ items }: ListProps) {
  return (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          item={item}
          variant={item.time ? 'detailed' : 'simple'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 25,
    paddingHorizontal: 16,
  },
  simpleContainer: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  simpleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simpleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedContainer: {
    minHeight: 71,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    justifyContent: 'center',
  },
  detailedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedLeft: {
    flex: 1,
    paddingVertical: 6,
  },
  detailedTitleRow: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
  },
  detailedDescRow: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  detailedRight: {
    padding: 8,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 16,
    color: theme.colors.baseDarkDark25,
  },
  description: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 13,
    color: theme.colors.baseLightLight20,
  },
  time: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 13,
    color: theme.colors.baseLightLight20,
  },
});