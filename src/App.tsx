import React, { useState, useEffect, useCallback } from 'react';
import { GeoLocation, ProcessedWeatherData, TemperatureUnit, ThemeMode } from './types/weather';
import { fetchWeatherForLocation, searchCities, POPULAR_CITIES } from './services/weatherApi';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { InsightsCard } from './components/InsightsCard';
import { WeatherChart } from './components/WeatherChart';
import { ForecastGrid } from './components/ForecastGrid';
import { WeatherHighlights } from './components/WeatherHighlights';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { RotateCw, Sparkles, CloudSun } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('wi-theme') as ThemeMode;
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Temperature unit state: default Celsius as requested
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('wi-unit') as TemperatureUnit) || 'celsius';
  });

  // Current active location: default to London
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(POPULAR_CITIES[0]);

  // Weather data & loading/error states
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync theme with document element
  useEffect(() => {
    localStorage.setItem('wi-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync unit in localStorage
  useEffect(() => {
    localStorage.setItem('wi-unit', unit);
  }, [unit]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  // Fetch forecast whenever currentLocation changes
  const loadWeatherData = useCallback(async (location: GeoLocation) => {
    // If synthetic invalid location from failed search
    if (location.id === -1) {
      setErrorMessage(`City "${location.name}" not found. Please try searching another city.`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchWeatherForLocation(location);
      setWeatherData(data);
    } catch (err: unknown) {
      console.error('Forecast retrieval error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to retrieve forecast data from Open-Meteo. Please check your network connection.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData(currentLocation);
  }, [currentLocation, loadWeatherData]);

  // Auto background retry when showing fallback data to reconnect to live Open-Meteo API
  useEffect(() => {
    if (weatherData?.isFallback) {
      const timer = setTimeout(() => {
        loadWeatherData(currentLocation);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [weatherData?.isFallback, currentLocation, loadWeatherData]);

  // Handle City Selection from search bar or pills
  const handleSelectCity = (location: GeoLocation) => {
    setCurrentLocation(location);
  };

  // Handle "Use My Location" via browser geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt reverse geocoding via BigDataCloud client-side free endpoint or fallback
          let resolvedName = 'Current Location';
          let country = '';

          try {
            const revRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              resolvedName = revData.city || revData.locality || revData.principalSubdivision || 'My Location';
              country = revData.countryName || '';
            }
          } catch {
            // Non-critical fallback
          }

          const userLocation: GeoLocation = {
            id: Math.round(latitude * 10000),
            name: resolvedName,
            latitude,
            longitude,
            country,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };

          setCurrentLocation(userLocation);
        } catch (err) {
          console.error(err);
          setErrorMessage('Could not determine current location. Please try entering your city.');
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        console.warn('Geolocation denied or failed', geoError);
        setErrorMessage(
          'Location access was denied or unavailable. Please search for your city in the search bar above.',
        );
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-400 transition-colors">
      {/* Top Navigation & Global Search Header */}
      <Header
        onSelectCity={handleSelectCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLoadingLocation={isLocating}
        unit={unit}
        onToggleUnit={toggleUnit}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentCityName={currentLocation.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Status Bar / Refresh Action */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Live Weather Dashboard
            </span>
            <span className="hidden sm:inline text-zinc-400">• Open-Meteo Direct API</span>
          </div>

          <button
            id="refresh-forecast-btn"
            type="button"
            onClick={() => loadWeatherData(currentLocation)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-50 text-xs"
            title="Refresh current weather data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Conditional Rendering: Loading, Error, or Dashboard View */}
        {isLoading && !weatherData ? (
          <LoadingSkeleton />
        ) : errorMessage && !weatherData ? (
          <ErrorMessage
            message={errorMessage}
            onRetry={() => loadWeatherData(currentLocation)}
            onSelectCity={handleSelectCity}
          />
        ) : weatherData ? (
          <div className="space-y-6">
            {/* If data is from cache or estimated fallback due to 503, show polite banner */}
            {weatherData.sourceNotice && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                  <span>{weatherData.sourceNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => loadWeatherData(currentLocation)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-medium text-xs transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Retry Live Sync
                </button>
              </div>
            )}

            {/* If error occurred during refresh, show banner but keep existing data */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="font-semibold underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 1. Primary Current Weather Hero Card */}
            <CurrentWeatherCard data={weatherData} unit={unit} />

            {/* 2. Simple Dynamic Recommendations / Weather Intelligence Insights */}
            <InsightsCard insights={weatherData.insights} />

            {/* 3. Interactive Temperature Trend Visual Chart (Hourly & 7-Day) */}
            <WeatherChart
              hourly={weatherData.hourly}
              daily={weatherData.daily}
              unit={unit}
            />

            {/* 4. 7-Day Daily Forecast Grid */}
            <ForecastGrid forecast={weatherData.daily} unit={unit} />

            {/* 5. Atmospheric Highlights & Comfort Index */}
            <WeatherHighlights data={weatherData} unit={unit} />
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-sky-500" />
            <span>Weather Intelligence Web Application</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Data: Open-Meteo Public API</span>
            <span>•</span>
            <span>WMO Weather Interpretation Standards</span>
            <span>•</span>
            <span>Zero API Key Required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
