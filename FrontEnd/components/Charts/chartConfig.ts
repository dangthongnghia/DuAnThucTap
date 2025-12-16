import { Dimensions } from 'react-native';

export const screenWidth = Dimensions.get('window').width;

export const getChartConfig = (color?: (opacity?: number) => string) => ({
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: color || ((opacity = 1) => `rgba(127, 61, 255, ${opacity})`),
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
});

export const CHART_COLORS = {
  income: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green
  expense: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red  
  balance: (opacity = 1) => `rgba(127, 61, 255, ${opacity})`, // Purple
  primary: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
};