import { WeatherConditionInfo } from '../types/weather';

/**
 * WMO Weather interpretation codes (WW)
 * Reference: Open-Meteo Documentation
 */
export const WMO_WEATHER_CODES: Record<number, WeatherConditionInfo> = {
  0: {
    code: 0,
    label: 'Clear Sky',
    iconName: 'Sun',
    category: 'clear',
    severity: 'normal',
  },
  1: {
    code: 1,
    label: 'Mainly Clear',
    iconName: 'SunDim',
    category: 'clear',
    severity: 'normal',
  },
  2: {
    code: 2,
    label: 'Partly Cloudy',
    iconName: 'CloudSun',
    category: 'cloudy',
    severity: 'normal',
  },
  3: {
    code: 3,
    label: 'Overcast',
    iconName: 'Cloud',
    category: 'cloudy',
    severity: 'normal',
  },
  45: {
    code: 45,
    label: 'Foggy',
    iconName: 'CloudFog',
    category: 'fog',
    severity: 'moderate',
  },
  48: {
    code: 48,
    label: 'Depositing Rime Fog',
    iconName: 'CloudFog',
    category: 'fog',
    severity: 'moderate',
  },
  51: {
    code: 51,
    label: 'Light Drizzle',
    iconName: 'CloudDrizzle',
    category: 'drizzle',
    severity: 'normal',
  },
  53: {
    code: 53,
    label: 'Moderate Drizzle',
    iconName: 'CloudDrizzle',
    category: 'drizzle',
    severity: 'moderate',
  },
  55: {
    code: 55,
    label: 'Dense Drizzle',
    iconName: 'CloudDrizzle',
    category: 'drizzle',
    severity: 'moderate',
  },
  56: {
    code: 56,
    label: 'Freezing Light Drizzle',
    iconName: 'CloudSnow',
    category: 'drizzle',
    severity: 'moderate',
  },
  57: {
    code: 57,
    label: 'Dense Freezing Drizzle',
    iconName: 'CloudSnow',
    category: 'drizzle',
    severity: 'severe',
  },
  61: {
    code: 61,
    label: 'Slight Rain',
    iconName: 'CloudRain',
    category: 'rain',
    severity: 'normal',
  },
  63: {
    code: 63,
    label: 'Moderate Rain',
    iconName: 'CloudRain',
    category: 'rain',
    severity: 'moderate',
  },
  65: {
    code: 65,
    label: 'Heavy Rain',
    iconName: 'CloudRain',
    category: 'rain',
    severity: 'severe',
  },
  66: {
    code: 66,
    label: 'Freezing Rain',
    iconName: 'CloudSnow',
    category: 'rain',
    severity: 'severe',
  },
  67: {
    code: 67,
    label: 'Heavy Freezing Rain',
    iconName: 'CloudSnow',
    category: 'rain',
    severity: 'severe',
  },
  71: {
    code: 71,
    label: 'Slight Snow Fall',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'moderate',
  },
  73: {
    code: 73,
    label: 'Moderate Snow Fall',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'moderate',
  },
  75: {
    code: 75,
    label: 'Heavy Snow Fall',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'severe',
  },
  77: {
    code: 77,
    label: 'Snow Grains',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'moderate',
  },
  80: {
    code: 80,
    label: 'Slight Rain Showers',
    iconName: 'CloudRain',
    category: 'rain',
    severity: 'normal',
  },
  81: {
    code: 81,
    label: 'Moderate Rain Showers',
    iconName: 'CloudRain',
    category: 'rain',
    severity: 'moderate',
  },
  82: {
    code: 82,
    label: 'Violent Rain Showers',
    iconName: 'CloudLightning',
    category: 'rain',
    severity: 'severe',
  },
  85: {
    code: 85,
    label: 'Slight Snow Showers',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'moderate',
  },
  86: {
    code: 86,
    label: 'Heavy Snow Showers',
    iconName: 'Snowflake',
    category: 'snow',
    severity: 'severe',
  },
  95: {
    code: 95,
    label: 'Thunderstorm',
    iconName: 'CloudLightning',
    category: 'thunderstorm',
    severity: 'severe',
  },
  96: {
    code: 96,
    label: 'Thunderstorm with Hail',
    iconName: 'CloudLightning',
    category: 'thunderstorm',
    severity: 'severe',
  },
  99: {
    code: 99,
    label: 'Severe Thunderstorm with Hail',
    iconName: 'CloudLightning',
    category: 'thunderstorm',
    severity: 'severe',
  },
};

export function getWeatherCondition(code?: number): WeatherConditionInfo {
  if (code === undefined || code === null) {
    return {
      code: 0,
      label: 'Clear Sky',
      iconName: 'Sun',
      category: 'clear',
      severity: 'normal',
    };
  }

  return (
    WMO_WEATHER_CODES[code] || {
      code,
      label: 'Moderate Conditions',
      iconName: 'CloudSun',
      category: 'cloudy',
      severity: 'normal',
    }
  );
}

export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}
