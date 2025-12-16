import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface ImagePickerComponentProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  imageUri,
  onImageSelected,
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and gallery permissions are needed to upload receipts.',
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    Alert.alert('Remove Receipt', 'Are you sure you want to remove this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onImageSelected(null) },
    ]);
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3 px-1">
        Receipt (Optional)
      </Text>

      {imageUri ? (
        <View className="relative">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-48 rounded-2xl"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={removeImage}
            className="absolute top-2 right-2 bg-red-500 rounded-full p-2">
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View className="absolute bottom-2 right-2 bg-black/50 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-medium">Tap to remove</Text>
          </View>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={pickImageFromCamera}
            disabled={loading}
            className="flex-1 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-4 items-center justify-center">
            {loading ? (
              <ActivityIndicator color="#3b82f6" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color="#3b82f6" />
                <Text className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
                  Take Photo
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickImageFromGallery}
            disabled={loading}
            className="flex-1 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-4 items-center justify-center">
            {loading ? (
              <ActivityIndicator color="#8b5cf6" />
            ) : (
              <>
                <Ionicons name="images-outline" size={32} color="#8b5cf6" />
                <Text className="text-purple-600 dark:text-purple-400 font-semibold mt-2">
                  From Gallery
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
