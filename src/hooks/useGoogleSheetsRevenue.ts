import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyRevenueData, type MonthlyRevenueData } from '@/services/googleSheetsService';

export function useGoogleSheetsRevenue() {
  return useQuery<MonthlyRevenueData | null>({
    queryKey: ['google-sheets-revenue'],
    queryFn: fetchMonthlyRevenueData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // auto-refresh every 10 minutes
    retry: 2,
  });
}

export function useGoogleSheetsStatus() {
  const { data, isLoading, isError, dataUpdatedAt } = useGoogleSheetsRevenue();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (dataUpdatedAt > 0 && data != null) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt, data]);

  return {
    isConnected: data != null && !isError,
    lastUpdated,
    isLoading,
  };
}
