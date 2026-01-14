import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreateScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2 mr-2 bg-gray-100 rounded-full"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Create Transaction</Text>
      </View>
      
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Form content will go here</Text>
      </View>
    </SafeAreaView>
  );
}
