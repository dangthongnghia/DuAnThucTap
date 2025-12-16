import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface InputFieldProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'password' | 'file';
}

export default function InputField({
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  secureTextEntry,
  ...props
}: InputFieldProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleToggleSecure = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[styles.container, variant === 'file' && styles.containerDashed]}>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={32}
          color={theme.colors.baseLightLight20}
          style={styles.leftIcon}
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholderTextColor={theme.colors.baseLightLight20}
        secureTextEntry={variant === 'password' ? isSecure : secureTextEntry}
        {...props}
      />

      {variant === 'password' && (
        <TouchableOpacity onPress={handleToggleSecure} style={styles.rightIcon}>
          <Ionicons
            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
            size={32}
            color={theme.colors.baseLightLight20}
          />
        </TouchableOpacity>
      )}

      {rightIcon && variant !== 'password' && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Ionicons
            name={rightIcon}
            size={32}
            color={theme.colors.baseLightLight20}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.baseLightLight100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.baseLightLight60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  containerDashed: {
    borderStyle: 'dashed',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.baseDarkDark100,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
});