import { useState, useEffect, useCallback } from 'react';
import { Alert, WeatherAlert } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';

const OFFICE_LOCATION = { lat: -27.4527, lon: 153.0964 };
const RAIN_THRESHOLD = 25; // Percentage for EOT consideration

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const logEOTForActiveProjects = useCallback(async (weatherAlerts: WeatherAlert[]) => {
    if (!weatherAlerts.length) return;
    try {
      // Get active project IDs
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'Active');
      if (!projects?.length) return;

      // Build entries for each project × each alert date
      const entries = projects.flatMap(p =>
        weatherAlerts.map(a => ({
          project_id: p.id,
          log_date: a.metadata.date,
          rain_chance: a.metadata.rainChance,
          rain_amount: a.metadata.rainAmount,
          severity: a.severity,
        }))
      );

      await supabase
        .from('weather_eot_logs')
        .upsert(entries, { onConflict: 'project_id,log_date', ignoreDuplicates: true });
    } catch (err) {
      console.error('Failed to log weather EOTs:', err);
    }
  }, []);

  const fetchWeatherAlerts = useCallback(async (): Promise<WeatherAlert[]> => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${OFFICE_LOCATION.lat}&longitude=${OFFICE_LOCATION.lon}&daily=precipitation_probability_max,precipitation_sum,weather_code&timezone=auto&forecast_days=7`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      const weatherAlerts: WeatherAlert[] = [];
      
      data.daily.time.forEach((date: string, index: number) => {
        const rainChance = data.daily.precipitation_probability_max[index] || 0;
        const rainAmount = data.daily.precipitation_sum[index] || 0;
        
        if (rainChance > RAIN_THRESHOLD) {
          const dateObj = new Date(date);
          const isToday = new Date().toDateString() === dateObj.toDateString();
          const isTomorrow = new Date(Date.now() + 86400000).toDateString() === dateObj.toDateString();
          
          let dayLabel = dateObj.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
          if (isToday) dayLabel = 'Today';
          if (isTomorrow) dayLabel = 'Tomorrow';
          
          weatherAlerts.push({
            id: `weather-rain-${date}`,
            type: 'weather',
            severity: rainChance >= 70 ? 'critical' : rainChance >= 50 ? 'warning' : 'info',
            title: `Potential EOT - ${dayLabel}`,
            message: `${rainChance}% chance of rain${rainAmount > 0 ? ` (${rainAmount}mm expected)` : ''}. Consider issuing Extension of Time notices.`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/weather',
            actionLabel: 'View Forecast',
            metadata: {
              date,
              rainChance,
              rainAmount,
            },
          });
        }
      });
      
      return weatherAlerts;
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      return [];
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const weatherAlerts = await fetchWeatherAlerts();
      setAlerts(weatherAlerts);
      // Auto-log EOT entries for all active projects
      await logEOTForActiveProjects(weatherAlerts);
    } finally {
      setLoading(false);
    }
  }, [fetchWeatherAlerts, logEOTForActiveProjects]);

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAlerts]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  return {
    alerts,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    refreshAlerts,
  };
}
