import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sunrise, Sunset, Droplets, Wind, Cloud, Sun, CloudRain, Umbrella } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  rainChance: number;
  rainAmount: number;
}

interface TodayWidgetProps {
  variant?: 'card' | 'inline';
}

const getWeatherIcon = (code: number, className = "h-6 w-6") => {
  if (code === 0) return <Sun className={`${className} text-warning`} />;
  if (code <= 3) return <Cloud className={`${className} text-muted-foreground`} />;
  if (code <= 69) return <CloudRain className={`${className} text-primary`} />;
  return <Sun className={`${className} text-warning`} />;
};

function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const OFFICE_LOCATION = { lat: -27.4527, lon: 153.0964 };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${OFFICE_LOCATION.lat}&longitude=${OFFICE_LOCATION.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`
        );
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.json();
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],
          rainChance: data.daily.precipitation_probability_max?.[0] || 0,
          rainAmount: data.daily.precipitation_sum?.[0] || 0,
        });
      } catch (err) {
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return { weather, loading };
}

function InlineWidget() {
  const { weather, loading } = useWeather();
  const today = new Date();

  if (loading) {
    return <span className="text-xs text-muted-foreground">Loading weather...</span>;
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-1.5 text-sm">
      <span className="font-medium text-muted-foreground">{format(today, 'EEE d MMM')}</span>
      <span className="h-4 w-px bg-border/60" />
      {getWeatherIcon(weather.weatherCode, "h-4 w-4")}
      <span className="font-semibold text-foreground">{weather.temperature}°C</span>
      {weather.rainChance > 0 && (
        <>
          <span className="h-4 w-px bg-border/60" />
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            <Umbrella className="h-3 w-3" />
            {weather.rainChance}%
            {weather.rainAmount > 0 && (
              <span className="text-muted-foreground">({weather.rainAmount}mm)</span>
            )}
          </span>
        </>
      )}
      <span className="h-4 w-px bg-border/60" />
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Droplets className="h-3 w-3" />
        {weather.humidity}%
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Wind className="h-3 w-3" />
        {weather.windSpeed} km/h
      </span>
      <span className="h-4 w-px bg-border/60" />
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sunrise className="h-3 w-3 text-warning" />
        {format(new Date(weather.sunrise), 'h:mm a')}
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Sunset className="h-3 w-3 text-warning" />
        {format(new Date(weather.sunset), 'h:mm a')}
      </span>
    </div>
  );
}

export function TodayWidget({ variant = 'card' }: TodayWidgetProps) {
  const { weather, loading } = useWeather();
  const today = new Date();

  if (variant === 'inline') {
    return <InlineWidget />;
  }

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-5 space-y-4">
        <div className="text-center pb-3 border-b border-border/30">
          <p className="text-2xl font-bold text-foreground">{format(today, 'EEEE')}</p>
          <p className="text-sm text-muted-foreground">{format(today, 'd MMM yyyy')}</p>
        </div>
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : weather ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {getWeatherIcon(weather.weatherCode)}
              <span className="text-2xl font-bold text-foreground">{weather.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2">
                <Umbrella className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Rain</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-foreground">{weather.rainChance}%</span>
                {weather.rainAmount > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">({weather.rainAmount}mm)</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wind className="h-3.5 w-3.5" />
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/30 text-xs">
              <div className="flex items-center gap-1.5">
                <Sunrise className="h-3.5 w-3.5 text-warning" />
                <span className="text-muted-foreground">{format(new Date(weather.sunrise), 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sunset className="h-3.5 w-3.5 text-warning" />
                <span className="text-muted-foreground">{format(new Date(weather.sunset), 'h:mm a')}</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
