import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, ui } from '../../constants/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export default function Switch({
  value,
  onValueChange,
  activeColor = ui.primary,
  inactiveColor = theme.colors.violetViolet20,
}: SwitchProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: value ? activeColor : inactiveColor },
      ]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 42,
    height: 24,
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.baseLightLight80,
    position: 'absolute',
  },
  thumbInactive: {
    left: 2,
  },
  thumbActive: {
    right: 2,
  },
});