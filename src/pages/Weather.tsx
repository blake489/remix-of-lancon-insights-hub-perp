import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sun, Cloud, CloudRain, Droplets, Wind, Thermometer, 
  Sunrise, Sunset, Umbrella, MapPin, Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  apparentTemperature: number;
}

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  rainChance: number;
  rainAmount: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  uvIndexMax: number;
}

const OFFICE_LOCATION = { 
  lat: -27.4527, 
  lon: 153.0964,
  name: '21/8 Metroplex Ave, Murarrie QLD 4172'
};

const getWeatherIcon = (code: number, size: 'sm' | 'lg' = 'sm') => {
  const sizeClass = size === 'lg' ? 'h-12 w-12' : 'h-6 w-6';
  if (code === 0) return <Sun className={`${sizeClass} text-warning`} />;
  if (code <= 3) return <Cloud className={`${sizeClass} text-muted-foreground`} />;
  if (code <= 69) return <CloudRain className={`${sizeClass} text-primary`} />;
  return <Sun className={`${sizeClass} text-warning`} />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

export default function Weather() {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${OFFICE_LOCATION.lat}&longitude=${OFFICE_LOCATION.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto`
        );
        
        if (!response.ok) throw new Error('Failed to fetch weather data');
        
        const data = await response.json();
        
        setCurrent({
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          apparentTemperature: Math.round(data.current.apparent_temperature),
        });
        
        const dailyData: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weather_code[i],
          rainChance: data.daily.precipitation_probability_max[i] || 0,
          rainAmount: data.daily.precipitation_sum[i] || 0,
          sunrise: data.daily.sunrise[i],
          sunset: data.daily.sunset[i],
          windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
          uvIndexMax: Math.round(data.daily.uv_index_max[i]),
        }));
        
        setForecast(dailyData);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to load weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, []);

  const today = forecast[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Weather</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{OFFICE_LOCATION.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(), 'EEEE, d MMMM yyyy')}</span>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* Current Weather */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : current && today ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(current.weatherCode, 'lg')}
                      <div>
                        <p className="text-5xl font-bold text-foreground">{current.temperature}°C</p>
                        <p className="text-muted-foreground">{getWeatherDescription(current.weatherCode)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Feels like</p>
                      <p className="text-2xl font-semibold text-foreground">{current.apparentTemperature}°C</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Thermometer className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">High / Low</p>
                        <p className="font-semibold">{today.tempMax}° / {today.tempMin}°</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Droplets className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Humidity</p>
                        <p className="font-semibold">{current.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Wind className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Wind</p>
                        <p className="font-semibold">{current.windSpeed} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Umbrella className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Rain Chance</p>
                        <p className="font-semibold">{today.rainChance}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Sun Times */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sun & UV</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : today ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <Sunrise className="h-6 w-6 text-warning" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sunrise</p>
                        <p className="font-semibold">{format(parseISO(today.sunrise), 'h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <Sunset className="h-6 w-6 text-warning" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sunset</p>
                        <p className="font-semibold">{format(parseISO(today.sunset), 'h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">UV Index</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                          style={{ width: `${Math.min(today.uvIndexMax / 11 * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-sm">{today.uvIndexMax}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {today.uvIndexMax <= 2 ? 'Low' : today.uvIndexMax <= 5 ? 'Moderate' : today.uvIndexMax <= 7 ? 'High' : 'Very High'}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* 7-Day Forecast */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">7-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {forecast.map((day, index) => (
                  <div 
                    key={day.date}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-[140px]">
                      <div className="w-24">
                        <p className="font-semibold text-foreground">
                          {index === 0 ? 'Today' : format(parseISO(day.date), 'EEEE')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(day.date), 'd MMM')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(day.weatherCode)}
                      <span className="text-sm text-muted-foreground hidden sm:inline w-24">
                        {getWeatherDescription(day.weatherCode)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Umbrella className="h-4 w-4 text-primary" />
                      <span className="w-10 text-right">{day.rainChance}%</span>
                      {day.rainAmount > 0 && (
                        <span className="text-xs text-muted-foreground">({day.rainAmount}mm)</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span className="w-16 text-right">{day.windSpeedMax} km/h</span>
                    </div>
                    
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="text-foreground">{day.tempMax}°</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{day.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
