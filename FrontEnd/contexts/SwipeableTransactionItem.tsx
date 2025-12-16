import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Edit, Trash2 } from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { Typography } from '../components/ui/Typography';
import { formatCurrency } from '../utils/currency';
import { Transaction } from '../contexts/DataContext';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

interface SwipeableTransactionItemProps {
  item: Transaction;
  onDelete: (id: string) => void;
}

const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({ item, onDelete }) => {
  const router = useRouter();
  const swipeableRef = useRef<Swipeable>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleEdit = () => {
    swipeableRef.current?.close();
    router.push({ pathname: '/(app)/add', params: { id: item.id } });
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    // Thêm một khoảng trễ nhỏ để animation đóng lại mượt hơn trước khi xóa
    setTimeout(() => {
      onDelete(item.id);
    }, 200);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-128, 0],
      outputRange: [0, 128],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[{ transform: [{ translateX: trans }] }]} className="flex-row w-32 items-center">
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 h-full bg-blue-500 items-center justify-center"
        >
          <Edit size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          className="flex-1 h-full bg-red-500 items-center justify-center rounded-r-2xl"
        >
          <Trash2 size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="rounded-2xl overflow-hidden">
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <Card className="flex-row items-center justify-between p-4 rounded-none">
          <View className="flex-row items-center gap-4 flex-1">
            <View className={`h-12 w-12 rounded-full items-center justify-center ${item.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <Typography variant="h4">{item.type === 'income' ? '💰' : '💸'}</Typography>
            </View>
            <View className="flex-1">
              <Typography variant="body" className="font-semibold" numberOfLines={1}>{item.title || item.category}</Typography>
              <Typography variant="caption" numberOfLines={1}>{item.note || 'No description'}</Typography>
            </View>
          </View>
          <View className="items-end ml-4">
            <Typography variant="body" className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}</Typography>
            <Typography variant="caption" className="mb-1">{new Date(item.date).toLocaleDateString()}</Typography>
          </View>
        </Card>
      </Swipeable>
    </View>
  );
};

export default SwipeableTransactionItem;