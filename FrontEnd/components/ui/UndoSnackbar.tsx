import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../contexts/SettingsContext';
import { useThemeColors } from '../../hooks/useThemeColors';

interface UndoSnackbarProps {
  visible: boolean;
  onUndo: () => void;
  message: string;
}

const UndoSnackbar: React.FC<UndoSnackbarProps> = ({ visible, onUndo, message }) => {
  const { isDarkMode } = useSettings();
  const colors = useThemeColors();

  if (!visible) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[
        styles.snackbar,
        { backgroundColor: isDarkMode ? colors.surface : colors.text }
      ]}>
        <Text style={[styles.message, { color: isDarkMode ? colors.text : colors.surface }]}>
          {message}
        </Text>
        <TouchableOpacity onPress={onUndo}>
          <Text style={[styles.undoText, { color: colors.primary }]}>Undo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  message: {
    fontSize: 16,
    flex: 1,
  },
  undoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
  },
});

export default UndoSnackbar;