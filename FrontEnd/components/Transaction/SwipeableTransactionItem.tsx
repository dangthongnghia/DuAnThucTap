import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Animated, useColorScheme, Alert } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Edit, Trash2 } from 'lucide-react-native';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { formatCurrency } from '../../utils/currency';
import { Transaction } from '../../contexts/DataContext';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';
import Haptics, { ImpactFeedbackStyle } from '../../lib/haptics';

interface SwipeableTransactionItemProps {
  item: Transaction;
  onDelete: (id: string) => void;
  confirmDelete?: boolean;
}

const SWIPE_ACTIONS_WIDTH = 140;
const ACTION_WIDTH = 70;

const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({
  item,
  onDelete,
  confirmDelete = true,
}) => {
  const router = useRouter();
  const swipeableRef = useRef<Swipeable>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { t } = useTranslation();

  const handleEdit = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    router.push({ pathname: '/(app)/add', params: { id: item.id } });
  }, [item.id, router]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();

    if (confirmDelete) {
      Alert.alert(
        t('deleteTransaction', 'Delete Transaction'),
        t('confirmDeleteTransaction', 'Are you sure you want to delete this transaction?'),
        [
          {
            text: t('cancel', 'Cancel'),
            style: 'cancel',
          },
          {
            text: t('delete', 'Delete'),
            style: 'destructive',
            onPress: () => {
              setTimeout(() => {
                onDelete(item.id);
              }, 200);
            },
          },
        ]
      );
    } else {
      setTimeout(() => {
        onDelete(item.id);
      }, 200);
    }
  }, [confirmDelete, item.id, onDelete, t]);

  const renderRightActions = useCallback(
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      // Animation for edit button
      const editTranslateX = dragX.interpolate({
        inputRange: [-SWIPE_ACTIONS_WIDTH, 0],
        outputRange: [0, SWIPE_ACTIONS_WIDTH],
        extrapolate: 'clamp',
      });

      const editScale = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 0.9, 1],
        extrapolate: 'clamp',
      });

      // Animation for delete button
      const deleteTranslateX = dragX.interpolate({
        inputRange: [-SWIPE_ACTIONS_WIDTH, 0],
        outputRange: [0, SWIPE_ACTIONS_WIDTH],
        extrapolate: 'clamp',
      });

      const deleteScale = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 0.9, 1],
        extrapolate: 'clamp',
      });

      const opacity = progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
      });

      return (
        <View className="flex-row items-stretch">
          {/* Edit Button */}
          <Animated.View
            style={{
              transform: [{ translateX: editTranslateX }, { scale: editScale }],
              opacity,
            }}
          >
            <RectButton
              style={{
                width: ACTION_WIDTH,
                height: '100%',
                backgroundColor: '#3B82F6', // blue-500
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleEdit}
            >
              <Edit size={22} color="white" />
              <Typography variant="caption" className="text-white mt-1 text-xs">
                {t('edit', 'Edit')}
              </Typography>
            </RectButton>
          </Animated.View>

          {/* Delete Button */}
          <Animated.View
            style={{
              transform: [{ translateX: deleteTranslateX }, { scale: deleteScale }],
              opacity,
            }}
          >
            <RectButton
              style={{
                width: ACTION_WIDTH,
                height: '100%',
                backgroundColor: '#EF4444', // red-500
                justifyContent: 'center',
                alignItems: 'center',
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }}
              onPress={handleDelete}
            >
              <Trash2 size={22} color="white" />
              <Typography variant="caption" className="text-white mt-1 text-xs">
                {t('delete', 'Delete')}
              </Typography>
            </RectButton>
          </Animated.View>
        </View>
      );
    },
    [handleEdit, handleDelete, t]
  );

  const getCategoryIcon = (category: string, type: string) => {
    // You can customize icons based on category
    if (type === 'income') {
      return '💰';
    }
    
    const categoryIcons: Record<string, string> = {
      food: '🍔',
      transport: '🚗',
      shopping: '🛒',
      entertainment: '🎮',
      health: '💊',
      education: '📚',
      bills: '📄',
      other: '💸',
    };
    
    return categoryIcons[category.toLowerCase()] || '💸';
  };

  return (
    <View className="rounded-2xl overflow-hidden bg-card">
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        onSwipeableOpen={() => {
          Haptics.impactAsync(ImpactFeedbackStyle.Light);
        }}
      >
        <Card className="flex-row items-center justify-between p-4 rounded-none border-0">
          <View className="flex-row items-center gap-4 flex-1">
            <View
              className={`h-12 w-12 rounded-full items-center justify-center ${
                item.type === 'income'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Typography variant="h4">
                {getCategoryIcon(item.category, item.type)}
              </Typography>
            </View>
            <View className="flex-1">
              <Typography variant="body" className="font-semibold" numberOfLines={1}>
                {item.title || item.category}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground" numberOfLines={1}>
                {item.note || t('noDescription', 'No description')}
              </Typography>
            </View>
          </View>
          <View className="items-end ml-4">
            <Typography
              variant="body"
              className={`font-bold ${
                item.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {item.type === 'income' ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {new Date(item.date).toLocaleDateString()}
            </Typography>
          </View>
        </Card>
      </Swipeable>
    </View>
  );
};

export default SwipeableTransactionItem;
