import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Sunrise, 
  Sunset, 
  Thermometer,
  Droplets,
  Wind,
  Calendar
} from 'lucide-react';
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
  if (code === 0) return <Sun className="h-8 w-8 text-yellow-500" />;
  if (code <= 3) return <Cloud className="h-8 w-8 text-muted-foreground" />;
  if (code <= 49) return <Cloud className="h-8 w-8 text-muted-foreground" />;
  if (code <= 69) return <CloudRain className="h-8 w-8 text-blue-500" />;
  if (code <= 79) return <CloudSnow className="h-8 w-8 text-blue-300" />;
  if (code <= 99) return <CloudLightning className="h-8 w-8 text-yellow-600" />;
  return <Sun className="h-8 w-8 text-yellow-500" />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
};

export function TodayWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: -27.4705, lon: 153.0260 }); // Brisbane default

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Use Brisbane as default if geolocation fails
          console.log('Using default location (Brisbane)');
        }
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
        setError(null);
      } catch (err) {
        setError('Unable to fetch weather');
        console.error('Weather error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const today = new Date();

  return (
    <Card className="glass-card border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Display */}
        <div className="text-center pb-3 border-b border-border/30">
          <p className="text-3xl font-bold text-foreground">
            {format(today, 'EEEE')}
          </p>
          <p className="text-lg text-muted-foreground">
            {format(today, 'd MMMM yyyy')}
          </p>
        </div>

        {/* Weather Display */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-muted-foreground">Loading weather...</div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {error}
          </div>
        ) : weather ? (
          <div className="space-y-4">
            {/* Main Weather */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.weatherCode)}
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.temperature}°C
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getWeatherDescription(weather.weatherCode)}
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Humidity</span>
                <Badge variant="secondary" className="ml-auto">{weather.humidity}%</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Wind</span>
                <Badge variant="secondary" className="ml-auto">{weather.windSpeed} km/h</Badge>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunrise</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(weather.sunrise), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Sunset</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(weather.sunset), 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
