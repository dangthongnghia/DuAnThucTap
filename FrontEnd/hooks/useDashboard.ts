import { useState, useEffect, useCallback } from 'react';
import {
  dashboardService,
  DashboardData,
  Period,
} from '../services/api';

interface UseDashboardOptions {
  period?: Period;
  timezone?: string;
  autoFetch?: boolean;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPeriod: (period: Period) => void;
}

/**
 * Hook để lấy dữ liệu dashboard
 */
export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { period: initialPeriod = 'month', timezone, autoFetch = true } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getDashboardData({ period, timezone });
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Không thể tải dữ liệu dashboard');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [period, timezone]);

  useEffect(() => {
    if (autoFetch) {
      fetchDashboard();
    }
  }, [fetchDashboard, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
    setPeriod,
  };
}
