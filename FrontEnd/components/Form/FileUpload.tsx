import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../constants/theme';

interface FileUploadProps {
  onFileSelect?: (file: DocumentPicker.DocumentPickerAsset) => void;
  label?: string;
}

export default function FileUpload({
  onFileSelect,
  label = 'Add attachment',
}: FileUploadProps) {
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        onFileSelect?.(result.assets[0]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePickDocument}
      activeOpacity={0.7}
    >
      <Ionicons name="attach-outline" size={32} color={theme.colors.baseLightLight20} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.baseLightLight100,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.baseLightLight60,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.baseLightLight20,
  },
});