export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface GeocodingResponse {
  results?: GeoLocation[];
  generationtime_ms?: number;
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather?: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    weathercode: number[];
  };
  daily?: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

export interface WeatherConditionInfo {
  code: number;
  label: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  severity: 'normal' | 'moderate' | 'severe';
}

export interface DailyForecastItem {
  date: string;
  dayOfWeek: string;
  shortDate: string;
  weathercode: number;
  condition: WeatherConditionInfo;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
}

export interface HourlyForecastItem {
  time: string;
  formattedHour: string;
  temperature: number;
  humidity: number;
  weathercode: number;
  condition: WeatherConditionInfo;
  isCurrentHour?: boolean;
}

export interface WeatherInsight {
  id: string;
  title: string;
  category: 'umbrella' | 'outdoor' | 'driving' | 'clothing' | 'comfort';
  advice: string;
  type: 'info' | 'success' | 'warning' | 'caution';
  icon: string;
}

export interface ProcessedWeatherData {
  location: GeoLocation;
  current: {
    temperature: number;
    feelsLike?: number;
    weathercode: number;
    condition: WeatherConditionInfo;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    isDay: boolean;
    timestamp: string;
    todayMax: number;
    todayMin: number;
    todayPrecipitation: number;
  };
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  insights: WeatherInsight[];
  isFallback?: boolean;
  isCached?: boolean;
  cachedTime?: string;
  sourceNotice?: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeMode = 'light' | 'dark' | 'system';
