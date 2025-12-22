import { useState, useCallback } from 'react';
import {
  reportService,
  MonthlyReportResponse,
  YearlyReportResponse,
  CategoryReportResponse,
  TrendReportResponse,
} from '../services/api';

interface UseReportsReturn {
  // Monthly Report
  monthlyReport: MonthlyReportResponse | null;
  loadMonthlyReport: (year?: number, month?: number) => Promise<void>;
  
  // Yearly Report
  yearlyReport: YearlyReportResponse | null;
  loadYearlyReport: (year?: number) => Promise<void>;
  
  // Category Report
  categoryReport: CategoryReportResponse | null;
  loadCategoryReport: (year?: number, month?: number, category?: string) => Promise<void>;
  
  // Trend Report
  trendReport: TrendReportResponse | null;
  loadTrendReport: (year?: number) => Promise<void>;
  
  // Status
  loading: boolean;
  error: string | null;
}

/**
 * Hook để lấy các loại báo cáo
 */
export function useReports(): UseReportsReturn {
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportResponse | null>(null);
  const [yearlyReport, setYearlyReport] = useState<YearlyReportResponse | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReportResponse | null>(null);
  const [trendReport, setTrendReport] = useState<TrendReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonthlyReport = useCallback(async (year?: number, month?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getMonthlyReport({ year, month });
      if (response.success && response.data) {
        setMonthlyReport(response.data);
      } else {
        setError(response.message || 'Không thể tải báo cáo tháng');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadYearlyReport = useCallback(async (year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getYearlyReport(year);
      if (response.success && response.data) {
        setYearlyReport(response.data);
      } else {
        setError(response.message || 'Không thể tải báo cáo năm');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategoryReport = useCallback(async (year?: number, month?: number, category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getCategoryReport({ year, month, category });
      if (response.success && response.data) {
        setCategoryReport(response.data);
      } else {
        setError(response.message || 'Không thể tải báo cáo danh mục');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrendReport = useCallback(async (year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getTrendReport(year);
      if (response.success && response.data) {
        setTrendReport(response.data);
      } else {
        setError(response.message || 'Không thể tải báo cáo xu hướng');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    monthlyReport,
    loadMonthlyReport,
    yearlyReport,
    loadYearlyReport,
    categoryReport,
    loadCategoryReport,
    trendReport,
    loadTrendReport,
    loading,
    error,
  };
}
