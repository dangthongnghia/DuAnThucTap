import React, { useState } from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTab, setCurrentTab] = useState('Week');

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const { start: startOfWeek, end: endOfWeek } = getWeekRange(currentDate);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    // 'flex-1' để full màn hình, 'bg-white' màu nền
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header: flex-row để nằm ngang, justify-between để dãn cách 2 bên */}
      <View className="flex-row items-center justify-between w-full p-4  border-gray-200 bg-pink-100">
        <Text className="font-bold">Avatar</Text>
        <Text className='text-xs text-gray-500 text-center '>{currentDate.getDate()}/{currentDate.getMonth() + 1}/{currentDate.getFullYear()}</Text>
        <Text className="font-bold">Notica</Text>
      </View>
      <View className='items-center justify-between w-full bg-pink-100 rounded-b-3xl py-4'>
        <Text className='text-center items-center'> Account Balance</Text>
        <Text className='text-3xl font-bold'>900.000</Text>
        <View className='flex-row items-center justify-between w-full px-10 mt-5'>
            <View className='w-40  bg-green-400 rounded-3xl items-center py-2 '>
                <Text className='text-white font-bold '>Income</Text>
                <Text className='text-white font-black'>900.000</Text>
            </View>
            <View className='w-40 bg-red-400  rounded-3xl items-center py-2'>
                 <Text className='text-white font-bold'>Expenses</Text>
                <Text className='text-white font-black'>900.000</Text>
            </View>
        </View>
      </View>
      {/* Time Range Tabs */}
      <View className='flex-row justify-between m-6'>
        {['Day', 'Week', 'Month', 'Year'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setCurrentTab(tab)}
            className={`px-4 py-1 rounded-full ${currentTab === tab ? 'bg-yellow-200 text-orange-500' : 'bg-transparent'}`}
          >
            <Text className={`${currentTab === tab ? 'text-white font-bold' : 'text-gray-500'}`}>
              {tab === 'Day' ? 'Today' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      {/* Week Switcher */}
      {currentTab === 'Week' && (
        <View className="flex-row items-center justify-center mb-4 space-x-4">
          <TouchableOpacity onPress={handlePrevWeek} className="p-2">
             <Text className="text-xl font-bold text-gray-600">{'<'}</Text>
          </TouchableOpacity>
          <View className="bg-gray-100 px-4 py-2 rounded-full min-w-[150px] items-center">
              <Text className="font-semibold text-gray-800">
                {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
              </Text>
          </View>
          <TouchableOpacity onPress={handleNextWeek} className="p-2">
             <Text className="text-xl font-bold text-gray-600">{'>'}</Text>
          </TouchableOpacity>
        </View>
      )}

            {/* View Transaction */}
        <View className="justify-center mt-5 px-6 space-y-4">
          <View className='flex-row items-center justify-between mx-3'>
          <Text className='text-xl font-bold'>Recent Transaction</Text>
          <TouchableOpacity className="">
                <Text className="text-blue-500 font-bold">View All</Text>
          </TouchableOpacity>
          </View>
          </View>
      <ScrollView className="flex-1  mt-5 px-6 space-y-4">
         <TouchableOpacity className='mt-5 '>
          <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-2xl">
            <View className='flex-row gap-4 items-center'>
            <MaterialCommunityIcons name="cart" size={24} color="black" />
            <View>
              <Text className="font-semibold text-gray-800">Grocery Shopping</Text>
              <Text className="text-gray-500">Aug 20, 2024</Text>
            </View>
            </View>
            <Text className="font-bold text-red-500">- $50.00</Text>
          </View>
         </TouchableOpacity>
        
       
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Create')}
        className="absolute bottom-6 right-6 w-16 h-16 bg-green-500 shadow-green-300 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 5 }} // For Android shadow
      >
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}