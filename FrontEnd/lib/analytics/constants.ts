// Category colors mapping
export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ff6b6b',
  Shopping: '#4ecdc4',
  Transportation: '#45b7d1',
  Subscription: '#f7b731',
  Bills: '#5f27cd',
  Healthcare: '#ee5a6f',
  Salary: '#00d2d3',
  Freelance: '#1dd1a1',
  Investment: '#feca57',
  Gift: '#ff9ff3',
  Rental: '#54a0ff',
  Other: '#95a5a6',
};

// Period labels for display
export const PERIOD_LABELS: Record<string, string> = {
  week: '7 ngày qua',
  month: '30 ngày qua',
  year: '1 năm qua',
  all: 'Tất cả',
};

// Default chart colors
export const CHART_COLORS = {
  income: '#00d2d3',
  expense: '#ff6b6b',
  balance: '#45b7d1',
  profit: '#22c55e',
  loss: '#ef4444',
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
};