import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ui } from '../../constants/theme';

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
}

export default function RadioButton({ selected, onPress }: RadioButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selected && <View style={styles.innerCircle} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: ui.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ui.primary,
  },
});