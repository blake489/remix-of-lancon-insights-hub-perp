import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sunrise, Sunset, Droplets, Wind, Cloud, Sun, CloudRain } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="h-6 w-6 text-warning" />;
  if (code <= 3) return <Cloud className="h-6 w-6 text-muted-foreground" />;
  if (code <= 69) return <CloudRain className="h-6 w-6 text-primary" />;
  return <Sun className="h-6 w-6 text-warning" />;
};

export function TodayWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: -27.4705, lon: 153.0260 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => console.log('Using default location')
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=auto`
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
        });
      } catch (err) {
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  const today = new Date();

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-5 space-y-4">
        {/* Date */}
        <div className="text-center pb-3 border-b border-border/30">
          <p className="text-2xl font-bold text-foreground">{format(today, 'EEEE')}</p>
          <p className="text-sm text-muted-foreground">{format(today, 'd MMM yyyy')}</p>
        </div>

        {/* Weather */}
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : weather ? (
          <div className="space-y-4">
            {/* Temperature */}
            <div className="flex items-center justify-between">
              {getWeatherIcon(weather.weatherCode)}
              <span className="text-2xl font-bold text-foreground">{weather.temperature}°C</span>
            </div>

            {/* Details */}
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

            {/* Sun times */}
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
