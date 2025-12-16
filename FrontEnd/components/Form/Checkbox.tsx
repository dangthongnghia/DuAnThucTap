import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../../constants/theme';

interface CheckboxProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

export default function Checkbox({ checked, onValueChange }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, checked && styles.containerChecked]}
      onPress={() => onValueChange(!checked)}
      activeOpacity={0.7}
    >
      {checked && (
        <Ionicons name="checkmark" size={20} color="#ffffff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: ui.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  containerChecked: {
    backgroundColor: ui.primary,
  },
});