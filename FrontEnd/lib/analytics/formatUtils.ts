import { PERIOD_LABELS } from './constants';

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, showSign: boolean = false): string => {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Math.abs(amount));

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }

  return formatted;
};

/**
 * Format currency with compact notation
 */
export const formatCurrencyCompact = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Get period label
 */
export const getPeriodLabel = (period: 'week' | 'month' | 'year' | 'all'): string => {
  return PERIOD_LABELS[period] || period;
};

/**
 * Format amount for chart display
 */
export const formatAmountForChart = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString('vi-VN');
};

/**
 * Format date range for display
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit' 
  });
  const end = endDate.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  return `${start} - ${end}`;
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần trước`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} năm trước`;
  }
};

/**
 * Format transaction count
 */
export const formatTransactionCount = (count: number): string => {
  if (count === 0) return 'Không có giao dịch';
  if (count === 1) return '1 giao dịch';
  return `${count} giao dịch`;
};

/**
 * Format savings rate with color indication
 */
export const formatSavingsRate = (rate: number): { 
  text: string; 
  color: 'green' | 'yellow' | 'red' 
} => {
  const text = `${rate.toFixed(1)}%`;
  
  if (rate >= 20) {
    return { text, color: 'green' };
  } else if (rate >= 10) {
    return { text, color: 'yellow' };
  } else {
    return { text, color: 'red' };
  }
};