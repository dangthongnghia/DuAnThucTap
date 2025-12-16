import React from 'react';
import { 
  TrendLineChart as TrendChart,
  CategoryPieChart as PieChart,
  CategoryBarChart as BarChartComponent,
  ComparisonBarChart as ComparisonChart,
  MonthlyTrendChart,
  IncomeExpenseComparison,
  type TrendData,
  type CategoryBreakdown
} from '../Charts';

// Re-export components with original names for backward compatibility
export const TrendLineChart: React.FC<{ data: TrendData[]; title?: string }> = ({ data, title }) => {
  return <TrendChart data={data} title={title} />;
};

export const CategoryPieChart: React.FC<{ data: CategoryBreakdown[]; title?: string }> = ({ data, title }) => {
  return <PieChart data={data} title={title} />;
};

export const CategoryBarChart: React.FC<{ 
  data: CategoryBreakdown[]; 
  title?: string; 
  type: 'income' | 'expense' 
}> = ({ data, title, type }) => {
  return <BarChartComponent data={data.slice(0, 5)} title={title} type={type} />;
};

export const ComparisonBarChart: React.FC<{
  current: number;
  previous: number;
  title: string;
  type: 'income' | 'expense' | 'balance';
}> = ({ current, previous, title, type }) => {
  // Create proper CategoryBreakdown format
  const chartData: CategoryBreakdown[] = [
    { 
      category: 'Kỳ trước', 
      amount: previous, 
      percentage: previous === 0 ? 0 : (previous / (previous + current)) * 100, 
      count: 1,
      color: '#9ca3af' 
    },
    { 
      category: 'Kỳ này', 
      amount: current, 
      percentage: current === 0 ? 0 : (current / (previous + current)) * 100, 
      count: 1,
      color: type === 'income' ? '#22c55e' : type === 'expense' ? '#ef4444' : '#3b82f6' 
    }
  ];
  
  return <BarChartComponent data={chartData} title={title} type={type === 'balance' ? 'income' : type} />;
};

// Export new enhanced components
export { MonthlyTrendChart, IncomeExpenseComparison };

// Re-export types
export type { TrendData, CategoryBreakdown };
