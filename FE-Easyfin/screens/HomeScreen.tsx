import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
      const currentDate = new Date();

  return (
    // 'flex-1' để full màn hình, 'bg-white' màu nền
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header: flex-row để nằm ngang, justify-between để dãn cách 2 bên */}
      <View className="flex-row items-center justify-between w-full p-4 border-b border-gray-200">
        <Text className="font-bold">Avatar</Text>
        <Text className='text-xs text-gray-500 text-center '>{currentDate.getDate()}/{currentDate.getMonth() + 1}/{currentDate.getFullYear()}</Text>
        <Text className="font-bold">Notica</Text>
      </View>
      <View className='items-center justify-between w-full bg-pink-50 rounded-b-3xl py-4'>
        <Text className='text-center items-center'> Account Balance</Text>
        <Text className='text'>900.000</Text>
        <View className='flex-row items-center justify-between w-full px-10 mt-5'>
            <View className='w-40  bg-green-400 rounded-xl items-center py-2 '>
                <Text>Income</Text>
                <Text>900.000</Text>
            </View>
            <View className='w-40 bg-red-400 rounded-xl items-center py-2'>
                 <Text>Expenses</Text>
                <Text>900.000</Text>
            </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center justify-center mt-10">
          <Text className="text-2xl font-bold text-gray-800">Home Screen</Text>
          
          {/* Ví dụ một nút bấm đơn giản */}
          <View className="mt-5">
            <Button title="Click Me" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}