import {
  DailyForecastItem,
  GeocodingResponse,
  GeoLocation,
  HourlyForecastItem,
  OpenMeteoForecastResponse,
  ProcessedWeatherData,
} from '../types/weather';
import { generateWeatherInsights } from '../utils/recommendations';
import { getWeatherCondition } from '../utils/weatherCodes';

export const POPULAR_CITIES: GeoLocation[] = [
  { id: 2643743, name: 'London', latitude: 51.50853, longitude: -0.12574, country: 'United Kingdom' },
  { id: 5128581, name: 'New York', latitude: 40.71427, longitude: -74.00597, country: 'United States', admin1: 'New York' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.69171, country: 'Japan' },
  { id: 2988507, name: 'Paris', latitude: 48.85341, longitude: 2.3488, country: 'France' },
  { id: 2147714, name: 'Sydney', latitude: -33.86785, longitude: 151.20732, country: 'Australia', admin1: 'New South Wales' },
  { id: 1880252, name: 'Singapore', latitude: 1.28967, longitude: 103.85007, country: 'Singapore' },
  { id: 2950159, name: 'Berlin', latitude: 52.52437, longitude: 13.41053, country: 'Germany' },
  { id: 6167865, name: 'Toronto', latitude: 43.70011, longitude: -79.4163, country: 'Canada', admin1: 'Ontario' },
  { id: 5368361, name: 'Los Angeles', latitude: 34.05223, longitude: -118.24368, country: 'United States', admin1: 'California' },
  { id: 292223, name: 'Dubai', latitude: 25.07725, longitude: 55.30927, country: 'United Arab Emirates' },
  { id: 3169070, name: 'Rome', latitude: 41.89193, longitude: 12.51133, country: 'Italy' },
  { id: 3117735, name: 'Madrid', latitude: 40.4165, longitude: -3.70256, country: 'Spain' },
  { id: 1835848, name: 'Seoul', latitude: 37.566, longitude: 126.9784, country: 'South Korea' },
  { id: 1275339, name: 'Mumbai', latitude: 19.07283, longitude: 72.88261, country: 'India' },
];

// In-flight request deduplication map to prevent double-firing in React 18 StrictMode
const inFlightRequests = new Map<string, Promise<ProcessedWeatherData>>();

// Cache keys
const CACHE_PREFIX = 'wi_forecast_cache_';
const LAST_SUCCESSFUL_KEY = 'wi_forecast_last_known';

function getCacheKey(lat: number, lon: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

function saveToCache(location: GeoLocation, data: ProcessedWeatherData) {
  try {
    const payload = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(getCacheKey(location.latitude, location.longitude), JSON.stringify(payload));
    localStorage.setItem(LAST_SUCCESSFUL_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

function getFromCache(location: GeoLocation): ProcessedWeatherData | null {
  try {
    const raw = localStorage.getItem(getCacheKey(location.latitude, location.longitude));
    if (raw) {
      const parsed = JSON.parse(raw);
      // Valid if less than 6 hours old
      if (Date.now() - parsed.timestamp < 6 * 3600 * 1000) {
        return parsed.data;
      }
    }

    // Check last successful cache as fallback
    const lastRaw = localStorage.getItem(LAST_SUCCESSFUL_KEY);
    if (lastRaw) {
      const parsed = JSON.parse(lastRaw);
      if (parsed.data && parsed.data.location.name.toLowerCase() === location.name.toLowerCase()) {
        return parsed.data;
      }
    }
  } catch {
    // Fallback on parse failure
  }
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with exponential backoff for 503 / 502 / 504 / 429 server congestion
 */
async function fetchForecastWithRetry(
  latitude: number,
  longitude: number,
  maxRetries: number = 3,
): Promise<OpenMeteoForecastResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Under high load, timezone=UTC bypasses Open-Meteo's timezone lookup table which often causes 503
    const tzParam = attempt >= 2 ? 'UTC' : 'auto';
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=${tzParam}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        return await response.json();
      }

      // Check for transient server congestion: 503 Service Unavailable, 429 Rate Limit, 502/504 Bad Gateway
      if ([503, 502, 504, 429].includes(response.status)) {
        lastError = new Error(`Open-Meteo server busy: HTTP ${response.status}`);
        if (attempt < maxRetries) {
          // Exponential backoff: 500ms, 1200ms
          const backoff = attempt * 600 + Math.floor(Math.random() * 200);
          await sleep(backoff);
          continue;
        }
      } else {
        throw new Error(`Open-Meteo error: HTTP ${response.status}`);
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await sleep(attempt * 600);
      }
    }
  }

  throw lastError || new Error('Failed to fetch weather forecast after retries.');
}

/**
 * Search cities using Open-Meteo Geocoding API with offline fallback
 */
export async function searchCities(query: string, count: number = 5): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed,
  )}&count=${count}&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data: GeocodingResponse = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Geocoding API network issue, using local catalog fallback:', err);
  }

  // Fallback to searching popular cities if Open-Meteo geocoding is unavailable or returned 503
  const qLower = trimmed.toLowerCase();
  const matched = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(qLower) ||
      c.country.toLowerCase().includes(qLower) ||
      (c.admin1 && c.admin1.toLowerCase().includes(qLower)),
  );

  return matched.slice(0, count);
}

/**
 * Generates a realistic meteorological fallback forecast when Open-Meteo is temporarily 503
 */
function createFallbackForecast(location: GeoLocation): ProcessedWeatherData {
  const now = new Date();
  const isDay = now.getHours() >= 6 && now.getHours() < 20;

  // Temperature approximation based on latitude (colder toward poles, warmer near equator)
  const absLat = Math.abs(location.latitude);
  const baseTemp = Math.round(Math.max(-5, Math.min(35, 30 - absLat * 0.45)));
  const weathercode = 1; // Mainly clear / partly cloudy
  const condition = getWeatherCondition(weathercode);

  const dailyItems: DailyForecastItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayOfWeek = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayVar = ((i * 3) % 5) - 2;

    dailyItems.push({
      date: dateStr,
      dayOfWeek,
      shortDate,
      weathercode: (weathercode + (i % 3)) % 4,
      condition: getWeatherCondition((weathercode + (i % 3)) % 4),
      tempMax: baseTemp + 3 + dayVar,
      tempMin: baseTemp - 4 + dayVar,
      precipitationSum: i % 3 === 0 ? 0.4 : 0,
    });
  }

  const hourlyItems: HourlyForecastItem[] = [];
  const currentHour = now.getHours();
  for (let i = 0; i < 24; i++) {
    const h = (currentHour + i) % 24;
    const diurnal = Math.sin(((h - 6) / 24) * 2 * Math.PI) * 4;
    const temp = Math.round((baseTemp + diurnal) * 10) / 10;
    const dateObj = new Date(now);
    dateObj.setHours(h, 0, 0, 0);

    hourlyItems.push({
      time: dateObj.toISOString(),
      formattedHour: dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: temp,
      humidity: Math.round(55 - diurnal * 3),
      weathercode: weathercode,
      condition: condition,
      isCurrentHour: i === 0,
    });
  }

  const insights = generateWeatherInsights({
    temperature: baseTemp,
    weathercode,
    condition,
    windSpeed: 12,
    humidity: 58,
    precipitationSum: 0,
  });

  return {
    location,
    current: {
      temperature: baseTemp,
      weathercode,
      condition,
      windSpeed: 12,
      windDirection: 210,
      humidity: 58,
      isDay,
      timestamp: now.toISOString(),
      todayMax: dailyItems[0].tempMax,
      todayMin: dailyItems[0].tempMin,
      todayPrecipitation: dailyItems[0].precipitationSum,
    },
    daily: dailyItems,
    hourly: hourlyItems,
    insights,
    isFallback: true,
    sourceNotice:
      'Open-Meteo servers are temporarily overloaded (HTTP 503). Showing estimated weather data while live connection reconnects.',
  };
}

/**
 * Parses raw Open-Meteo response into application state
 */
function parseOpenMeteoData(
  location: GeoLocation,
  data: OpenMeteoForecastResponse,
): ProcessedWeatherData {
  if (!data.current_weather) {
    throw new Error('Current weather data missing in API response.');
  }

  // Current humidity from hourly data
  let currentHumidity = 60;
  if (data.hourly && data.hourly.time && data.hourly.relative_humidity_2m) {
    const currentIsoHour = data.current_weather.time.slice(0, 13);
    const matchIndex = data.hourly.time.findIndex((t) => t.startsWith(currentIsoHour));
    if (matchIndex !== -1 && data.hourly.relative_humidity_2m[matchIndex] !== undefined) {
      currentHumidity = data.hourly.relative_humidity_2m[matchIndex];
    } else if (data.hourly.relative_humidity_2m.length > 0) {
      currentHumidity = data.hourly.relative_humidity_2m[0];
    }
  }

  // 7-day Daily forecast
  const dailyItems: DailyForecastItem[] = [];
  if (data.daily && data.daily.time) {
    const daysCount = Math.min(data.daily.time.length, 7);
    for (let i = 0; i < daysCount; i++) {
      const dateStr = data.daily.time[i];
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      const isToday = i === 0;
      const dayOfWeek = isToday
        ? 'Today'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const weathercode = data.daily.weathercode ? data.daily.weathercode[i] : 0;
      const tempMax = data.daily.temperature_2m_max ? data.daily.temperature_2m_max[i] : 0;
      const tempMin = data.daily.temperature_2m_min ? data.daily.temperature_2m_min[i] : 0;
      const precipitationSum = data.daily.precipitation_sum
        ? data.daily.precipitation_sum[i]
        : 0;

      dailyItems.push({
        date: dateStr,
        dayOfWeek,
        shortDate,
        weathercode,
        condition: getWeatherCondition(weathercode),
        tempMax,
        tempMin,
        precipitationSum,
      });
    }
  }

  // Hourly forecast
  const hourlyItems: HourlyForecastItem[] = [];
  if (data.hourly && data.hourly.time) {
    const currentTimeIso = data.current_weather.time;
    let startIndex = data.hourly.time.findIndex((t) => t >= currentTimeIso);
    if (startIndex === -1) startIndex = 0;

    const endIndex = Math.min(startIndex + 24, data.hourly.time.length);
    for (let i = startIndex; i < endIndex; i++) {
      const timeStr = data.hourly.time[i];
      const datePart = new Date(timeStr);
      const formattedHour = isNaN(datePart.getTime())
        ? timeStr.split('T')[1]?.slice(0, 5) || timeStr
        : datePart.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

      const temp = data.hourly.temperature_2m ? data.hourly.temperature_2m[i] : 0;
      const hum = data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[i] : 0;
      const wcode = data.hourly.weathercode ? data.hourly.weathercode[i] : 0;

      hourlyItems.push({
        time: timeStr,
        formattedHour,
        temperature: temp,
        humidity: hum,
        weathercode: wcode,
        condition: getWeatherCondition(wcode),
        isCurrentHour: i === startIndex,
      });
    }
  }

  const currentCondition = getWeatherCondition(data.current_weather.weathercode);
  const todayDaily = dailyItems[0] || {
    tempMax: data.current_weather.temperature,
    tempMin: data.current_weather.temperature,
    precipitationSum: 0,
  };

  const insights = generateWeatherInsights({
    temperature: data.current_weather.temperature,
    weathercode: data.current_weather.weathercode,
    condition: currentCondition,
    windSpeed: data.current_weather.windspeed,
    humidity: currentHumidity,
    precipitationSum: todayDaily.precipitationSum,
  });

  return {
    location,
    current: {
      temperature: data.current_weather.temperature,
      weathercode: data.current_weather.weathercode,
      condition: currentCondition,
      windSpeed: data.current_weather.windspeed,
      windDirection: data.current_weather.winddirection,
      humidity: currentHumidity,
      isDay: data.current_weather.is_day === 1,
      timestamp: data.current_weather.time,
      todayMax: todayDaily.tempMax,
      todayMin: todayDaily.tempMin,
      todayPrecipitation: todayDaily.precipitationSum,
    },
    daily: dailyItems,
    hourly: hourlyItems,
    insights,
  };
}

/**
 * Main function to fetch weather data with in-flight deduplication, exponential retry,
 * caching, and graceful 503 fallback.
 */
export async function fetchWeatherForLocation(
  location: GeoLocation,
): Promise<ProcessedWeatherData> {
  const { latitude, longitude } = location;
  const dedupKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

  // Return existing in-flight request if already pending (prevents React 18 double-mount API spam)
  if (inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const data = await fetchForecastWithRetry(latitude, longitude, 3);
      const parsed = parseOpenMeteoData(location, data);
      // Save successful data to localStorage cache
      saveToCache(location, parsed);
      return parsed;
    } catch (err: unknown) {
      console.warn('Forecast API live fetch failed, evaluating fallback cache...', err);

      // Check if we have cached forecast for this location
      const cached = getFromCache(location);
      if (cached) {
        return {
          ...cached,
          location,
          isCached: true,
          sourceNotice:
            'Open-Meteo servers are temporarily busy (HTTP 503). Showing cached forecast.',
        };
      }

      // If no cache and error is 503 or server congestion, provide graceful fallback data
      const is503OrUnavailable =
        err instanceof Error &&
        (err.message.includes('503') ||
          err.message.includes('502') ||
          err.message.includes('504') ||
          err.message.includes('429') ||
          err.message.includes('Failed to fetch'));

      if (is503OrUnavailable) {
        return createFallbackForecast(location);
      }

      // Re-throw if it's another critical error
      throw err;
    } finally {
      inFlightRequests.delete(dedupKey);
    }
  })();

  inFlightRequests.set(dedupKey, fetchPromise);
  return fetchPromise;
}
