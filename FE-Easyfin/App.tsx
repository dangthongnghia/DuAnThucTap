import './global.css';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import các màn hình của bạn
import HomeScreen from './screens/HomeScreen';
// Nếu chưa có các màn này, bạn có thể tạo file hoặc thay tạm bằng HomeScreen để test
import WalletScreen from './screens/WalletScreen'; 
import OrdersScreen from './screens/OrdersScreen'; 
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// 1. Component TabBar (Thanh Menu tùy chỉnh của bạn)
function FinanceTabBar({ state, descriptors, navigation }: any) {
  return (
    <View className="flex-row border-t-2 border-gray-100 bg-white pb-5 pt-3 shadow-lg">
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Config icon
        let iconName = 'home';
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Wallet') iconName = 'wallet';
        else if (route.name === 'Transaction') iconName = 'history';
        else if (route.name === 'Settings') iconName = 'cog';

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            className={`flex-1 items-center justify-center ${
              isFocused ? 'bg-emerald-50 rounded-xl mx-2 py-1' : ''
            }`}
          >
            <MaterialCommunityIcons
              name={iconName as any}
              size={24}
              color={isFocused ? '#10B981' : '#D1D5DB'}
            />
            {isFocused && (
              <Text className="mt-1 text-xs font-semibold text-emerald-500">{label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// 2. Ứng dụng chính (Navigation Container)
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => <FinanceTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Wallet" component={WalletScreen} />
          <Tab.Screen name="Transaction" component={OrdersScreen} />
          <Tab.Screen name="Settings" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}