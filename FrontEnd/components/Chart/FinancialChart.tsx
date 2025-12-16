import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, ui } from '../../constants/theme';
import { useSettings } from '../../contexts/SettingsContext';

type ChartView = 'line' | 'pie';

interface FinancialChartProps {
  amount: number;
  period?: string;
  defaultView?: ChartView;
}

export default function FinancialChart({
  amount,
  period = 'Month',
  defaultView = 'line',
}: FinancialChartProps) {
  const [chartView, setChartView] = useState<ChartView>(defaultView);
  const { isDarkMode } = useSettings();
  
  const dynamicStyles = createDynamicStyles(isDarkMode);

  return (
    <View style={dynamicStyles.container}>
      {/* Header with period selector and chart toggle */}
      <View style={dynamicStyles.header}>
        {/* Period selector */}
        <TouchableOpacity style={dynamicStyles.periodButton} activeOpacity={0.7}>
          <Ionicons name="chevron-down" size={24} color={isDarkMode ? '#E5E7EB' : theme.colors.baseDarkDark50} />
          <Text style={dynamicStyles.periodText}>{period}</Text>
        </TouchableOpacity>

        {/* Chart view toggle */}
        <View style={dynamicStyles.toggleContainer}>
          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              dynamicStyles.toggleLeft,
              chartView === 'line' && dynamicStyles.toggleActive,
            ]}
            onPress={() => setChartView('line')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="stats-chart"
              size={32}
              color={chartView === 'line' ? ui.onPrimary : (isDarkMode ? '#8B5CF6' : ui.primary)}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.toggleButton,
              dynamicStyles.toggleRight,
              chartView === 'pie' && dynamicStyles.toggleActive,
            ]}
            onPress={() => setChartView('pie')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="pie-chart"
              size={32}
              color={chartView === 'pie' ? ui.onPrimary : (isDarkMode ? '#8B5CF6' : ui.primary)}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount display */}
      <View style={dynamicStyles.amountContainer}>
        <Text style={dynamicStyles.amount}>$ {amount.toLocaleString()}</Text>
      </View>

      {/* Chart area */}
      <View style={dynamicStyles.chartContainer}>
        {chartView === 'line' ? (
          <View style={dynamicStyles.lineChartPlaceholder}>
            <Ionicons name="trending-up" size={80} color={isDarkMode ? '#4B5563' : theme.colors.baseLightLight40} />
            <Text style={dynamicStyles.placeholderText}>Line Chart</Text>
          </View>
        ) : (
          <View style={dynamicStyles.pieChartPlaceholder}>
            <View style={dynamicStyles.pieCenter}>
              <Text style={dynamicStyles.pieAmount}>$ {amount.toLocaleString()}</Text>
            </View>
            <Ionicons name="pie-chart-outline" size={120} color={isDarkMode ? '#4B5563' : theme.colors.baseLightLight40} />
          </View>
        )}
      </View>
    </View>
  );
}

const createDynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDarkMode ? '#1F2937' : ui.surface,
    paddingVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight60,
    backgroundColor: isDarkMode ? '#374151' : 'transparent',
  },
  periodText: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    fontSize: 14,
    color: isDarkMode ? '#E5E7EB' : theme.colors.baseDarkDark50,
  },
  toggleContainer: {
    flexDirection: 'row',
  },
  toggleButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: isDarkMode ? '#4B5563' : theme.colors.baseLightLight60,
    backgroundColor: isDarkMode ? '#374151' : ui.surface,
  },
  toggleLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0.5,
  },
  toggleRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0.5,
  },
  toggleActive: {
    backgroundColor: isDarkMode ? '#7C3AED' : ui.primary,
    borderColor: isDarkMode ? '#7C3AED' : ui.primary,
  },
  amountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  amount: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontSize: 32,
    color: isDarkMode ? '#F9FAFB' : theme.colors.baseDarkDark100,
    textAlign: 'center',
  },
  chartContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineChartPlaceholder: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? '#374151' : theme.colors.baseLightLight80,
    borderRadius: 12,
  },
  pieChartPlaceholder: {
    width: 216,
    height: 216,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieAmount: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontSize: 32,
    color: isDarkMode ? '#F9FAFB' : theme.colors.baseDarkDark100,
  },
  placeholderText: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: isDarkMode ? '#9CA3AF' : theme.colors.baseLightLight20,
  },
});