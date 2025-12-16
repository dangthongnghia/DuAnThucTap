import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { theme, ui } from '../../constants/theme';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  showValue?: boolean;
}

export default function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  minimumTrackTintColor = ui.primary,
  maximumTrackTintColor = theme.colors.baseLightLight60,
  thumbTintColor = ui.primary,
  showValue = true,
}: SliderProps) {
  return (
    <View style={styles.container}>
      <RNSlider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
      />
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{Math.round(value)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  valueContainer: {
    position: 'absolute',
    top: -8,
    backgroundColor: ui.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.baseLightLight100,
  },
});