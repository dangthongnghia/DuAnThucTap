import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue?: string;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialValue = '0',
}) => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const { isDarkMode } = useSettings()
  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['.', '0', '⌫', '+'],
  ];

  const handlePress = (value: string) => {
    if (value === '⌫') {
      setDisplayValue(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (['+', '-', '×', '÷'].includes(value)) {
      setPreviousValue(displayValue);
      setOperation(value);
      setDisplayValue('0');
      return;
    }

    if (value === '.') {
      if (!displayValue.includes('.')) {
        setDisplayValue(prev => prev + '.');
      }
      return;
    }

    setDisplayValue(prev => (prev === '0' ? value : prev + value));
  };

  const handleCalculate = () => {
    if (operation && previousValue) {
      const prev = parseFloat(previousValue);
      const current = parseFloat(displayValue);
      let result = 0;

      switch (operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '×':
          result = prev * current;
          break;
        case '÷':
          result = prev / current;
          break;
      }

      setDisplayValue(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleConfirm = () => {
    handleCalculate();
    onConfirm(displayValue);
    onClose();
  };

  const handleClear = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className={`flex-1 ${isDarkMode ? 'bg-black/50' : 'bg-white'} bg-black/50 justify-end`}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-200">Calculator</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Display */}
          <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mb-4">
            {previousValue && operation && (
              <Text className="text-gray-500 dark:text-gray-400 text-lg text-right">
                {previousValue} {operation}
              </Text>
            )}
            <Text className="text-4xl font-bold text-gray-800 dark:text-gray-200 text-right">
              {parseFloat(displayValue).toLocaleString()}
            </Text>
          </View>

          {/* Buttons */}
          <View className="mb-4">
            {buttons.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-between mb-2">
                {row.map((btn) => {
                  const isOperator = ['+', '-', '×', '÷'].includes(btn);
                  const isActive = operation === btn;
                  
                  return (
                    <TouchableOpacity
                      key={btn}
                      onPress={() => handlePress(btn)}
                      className={`items-center justify-center rounded-2xl ${
                        isOperator
                          ? isActive
                            ? 'bg-violet-600'
                            : 'bg-violet-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      style={{ width: (SCREEN_WIDTH - 64) / 4 - 4, height: 60 }}>
                      <Text
                        className={`text-2xl font-semibold ${
                          isOperator ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}>
                        {btn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleClear}
              className="flex-1 bg-red-500 rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-lg">Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCalculate}
              className="flex-1 bg-blue-500 rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-lg">=</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 bg-green-500 rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
