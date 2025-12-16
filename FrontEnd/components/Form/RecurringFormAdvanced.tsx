import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { theme, ui } from '../../constants/theme';

export default function RecurringFormAdvanced() {
  const [frequency, setFrequency] = useState('Yearly');
  const [month, setMonth] = useState('April');
  const [day, setDay] = useState('29');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <RNPickerSelect
            value={frequency}
            onValueChange={setFrequency}
            items={[
              { label: 'Yearly', value: 'Yearly' },
              { label: 'Monthly', value: 'Monthly' },
              { label: 'Weekly', value: 'Weekly' },
              { label: 'Daily', value: 'Daily' },
            ]}
            style={pickerStyles}
          />
        </View>
        <View style={styles.flex1}>
          <RNPickerSelect
            value={month}
            onValueChange={setMonth}
            items={[
              { label: 'January', value: 'January' },
              { label: 'February', value: 'February' },
              { label: 'March', value: 'March' },
              { label: 'April', value: 'April' },
              { label: 'May', value: 'May' },
              { label: 'June', value: 'June' },
              { label: 'July', value: 'July' },
              { label: 'August', value: 'August' },
              { label: 'September', value: 'September' },
              { label: 'October', value: 'October' },
              { label: 'November', value: 'November' },
              { label: 'December', value: 'December' },
            ]}
            style={pickerStyles}
          />
        </View>
        <View style={styles.flex1}>
          <RNPickerSelect
            value={day}
            onValueChange={setDay}
            items={Array.from({ length: 31 }, (_, i) => ({
              label: String(i + 1),
              value: String(i + 1),
            }))}
            style={pickerStyles}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const pickerStyles = {
  inputIOS: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.baseLightLight40,
    fontSize: 16,
    color: theme.colors.baseDarkDark50,
  },
  inputAndroid: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.baseLightLight40,
    fontSize: 16,
    color: theme.colors.baseDarkDark50,
  },
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  button: {
    backgroundColor: ui.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});