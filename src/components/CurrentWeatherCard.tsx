import React from 'react';
import {
  Wind,
  Droplets,
  CloudRain,
  ArrowUp,
  ArrowDown,
  Clock,
  Compass,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { ProcessedWeatherData, TemperatureUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, getWindDirection } from '../utils/weatherCodes';

interface CurrentWeatherCardProps {
  data: ProcessedWeatherData;
  unit: TemperatureUnit;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ data, unit }) => {
  const { current, location } = data;

  const getThemeGradient = (category: string) => {
    switch (category) {
      case 'clear':
        return 'from-amber-500/10 via-sky-500/5 to-transparent border-amber-500/30';
      case 'rain':
      case 'drizzle':
        return 'from-blue-600/15 via-sky-600/5 to-transparent border-blue-500/30';
      case 'thunderstorm':
        return 'from-purple-600/20 via-amber-600/10 to-transparent border-purple-500/30';
      case 'snow':
        return 'from-cyan-500/15 via-blue-400/5 to-transparent border-cyan-500/30';
      case 'fog':
        return 'from-zinc-500/15 via-zinc-400/5 to-transparent border-zinc-500/30';
      default:
        return 'from-sky-500/10 via-indigo-500/5 to-transparent border-sky-500/25';
    }
  };

  const formattedTime = (() => {
    try {
      const date = new Date(current.timestamp);
      return isNaN(date.getTime())
        ? current.timestamp.replace('T', ' ')
        : date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
    } catch {
      return current.timestamp;
    }
  })();

  const windDirLabel = getWindDirection(current.windDirection);

  return (
    <div
      id="current-weather-card"
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border ${getThemeGradient(
        current.condition.category,
      )} shadow-sm p-6 lg:p-7 transition-all`}
    >
      {/* Ambient background decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-sky-400/10 to-indigo-500/10 blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <MapPin className="w-4 h-4" />
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {location.name}
            </h2>
            {location.country && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {location.country}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {location.admin1 && <span>{location.admin1} •</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Observed {formattedTime}
            </span>
            <span>• Timezone: {data.location.timezone || 'Local'}</span>
          </div>
        </div>

        {/* Severe alert badge if applicable */}
        {current.condition.severity === 'severe' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Severe Weather Advisory</span>
          </div>
        )}
      </div>

      {/* Center Hero: Temperature & Condition */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <WeatherIcon
              name={current.condition.iconName}
              className="w-14 h-14 text-sky-600 dark:text-sky-400"
            />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono">
                {formatTemperature(current.temperature, unit)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {current.condition.label}
              </span>
              <span className="text-xs text-zinc-400">
                • {current.isDay ? 'Daytime' : 'Night'}
              </span>
            </div>
          </div>
        </div>

        {/* High / Low Today pill */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium mb-1">Today's Range</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold font-mono">
              <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
              {formatTemperature(current.todayMax, unit)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="flex items-center text-sky-600 dark:text-sky-400 font-semibold font-mono">
              <ArrowDown className="w-3.5 h-3.5 mr-0.5" />
              {formatTemperature(current.todayMin, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Strip */}
      <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {/* Wind Speed */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
            <Wind className="w-4 h-4 text-sky-500" />
            <span>Wind Speed</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {current.windSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-500">km/h</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
            <Compass className="w-3 h-3" />
            <span>{windDirLabel} ({Math.round(current.windDirection)}°)</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>Relative Humidity</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {Math.round(current.humidity)}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            {current.humidity > 70 ? 'Humid' : current.humidity < 35 ? 'Dry air' : 'Comfortable'}
          </div>
        </div>

        {/* Precipitation Today */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
            <CloudRain className="w-4 h-4 text-blue-500" />
            <span>Precipitation Today</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {current.todayPrecipitation.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-500">mm</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            {current.todayPrecipitation > 0 ? 'Precipitation recorded' : 'Zero rainfall'}
          </div>
        </div>

        {/* Weather Code Category */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Atmospheric State</span>
          </div>
          <div className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
            {current.condition.category}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            WMO Code #{current.weathercode}
          </div>
        </div>
      </div>
    </div>
  );
};
