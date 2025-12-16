import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useSettings } from '../../contexts/SettingsContext';

interface BudgetCardData {
  id: string;
  category: string;
  categoryColor: string;
  remaining: number;
  spent: number;
  total: number;
  isOverBudget: boolean;
}

interface BudgetCardListProps {
  budgets: BudgetCardData[];
}

export default function BudgetCardList({ budgets }: BudgetCardListProps) {
  const { isDarkMode } = useSettings();
  
  return (
    <View style={styles.container}>
      {budgets.map((card, index) => {
        const progress = Math.min((card.spent / card.total) * 100, 100);
        
        return (
          <View
            key={card.id}
            style={[
              styles.card,
              index === 0 && styles.firstCard,
              card.isOverBudget && styles.cardOverBudget,
              { backgroundColor: isDarkMode ? '#374151' : theme.colors.baseLightLight80 },
              { borderColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight60 },
            ]}
          >
            {/* Header with category and warning */}
            <View style={styles.header}>
              <View style={[
                styles.categoryBadge, 
                { 
                  backgroundColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight80,
                  borderColor: isDarkMode ? '#6B7280' : theme.colors.baseLightLight60 
                }
              ]}>
                <View style={[styles.categoryDot, { backgroundColor: card.categoryColor }]} />
                <Text style={[
                  styles.categoryText, 
                  { color: isDarkMode ? '#E5E7EB' : theme.colors.baseDarkDark50 }
                ]}>{card.category}</Text>
              </View>
              {card.isOverBudget && (
                <Ionicons name="warning" size={32} color={theme.colors.redRed100} />
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Remaining amount */}
              <Text
                style={[
                  styles.remaining,
                  { 
                    color: card.isOverBudget 
                      ? (isDarkMode ? '#F3F4F6' : theme.colors.baseDarkDark100)
                      : (isDarkMode ? '#D1D5DB' : theme.colors.baseDarkDark50)
                  },
                ]}
              >
                Remaining ${card.remaining}
              </Text>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={[
                  styles.progressBackground, 
                  { backgroundColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight60 }
                ]} />
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress}%`,
                      backgroundColor: card.isOverBudget
                        ? theme.colors.redRed100
                        : card.categoryColor,
                    },
                  ]}
                />
              </View>

              {/* Spent info */}
              <Text style={[
                styles.spentText,
                { color: isDarkMode ? '#9CA3AF' : theme.colors.baseLightLight20 }
              ]}>
                ${card.spent} of ${card.total}
              </Text>
            </View>

            {/* Over budget warning */}
            {card.isOverBudget && (
              <Text style={styles.warningText}>You've exceed the limit!</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 35,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: theme.colors.baseLightLight80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.baseLightLight60,
    padding: 16,
    gap: 10,
  },
  firstCard: {
    marginTop: 16,
  },
  cardOverBudget: {
    minHeight: 172,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.baseLightLight80,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.colors.baseLightLight60,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 14,
    color: theme.colors.baseDarkDark50,
  },
  content: {
    gap: 16,
  },
  remaining: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
  },
  progressContainer: {
    height: 12,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: 12,
    backgroundColor: theme.colors.baseLightLight60,
    borderRadius: 6,
  },
  progressBar: {
    position: 'absolute',
    height: 12,
    borderRadius: 6,
  },
  spentText: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 16,
    color: theme.colors.baseLightLight20,
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    fontSize: 14,
    color: theme.colors.redRed100,
  },
});