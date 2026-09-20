import React from 'react';
import { ProcessedWeatherData, TemperatureUnit } from '../types/weather';
import {
  Gauge,
  SunMedium,
  Wind,
  Droplets,
  Eye,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { formatTemperature } from '../utils/weatherCodes';

interface WeatherHighlightsProps {
  data: ProcessedWeatherData;
  unit: TemperatureUnit;
}

export const WeatherHighlights: React.FC<WeatherHighlightsProps> = ({ data, unit }) => {
  const { current, daily } = data;

  // Approximate dew point using Magnus formula
  const tempC = current.temperature;
  const rh = current.humidity;
  const dewPointC =
    tempC - ((100 - rh) / 5); // simple approximation accurate within 1°C for RH > 50%

  // Wind classification
  const getWindClassification = (speedKmH: number) => {
    if (speedKmH < 5) return { label: 'Light Air / Calm', color: 'text-emerald-500' };
    if (speedKmH < 20) return { label: 'Gentle Breeze', color: 'text-emerald-500' };
    if (speedKmH < 38) return { label: 'Moderate Wind', color: 'text-sky-500' };
    if (speedKmH < 50) return { label: 'Strong Breeze', color: 'text-amber-500' };
    return { label: 'High Wind / Gale', color: 'text-rose-500' };
  };

  const windClass = getWindClassification(current.windSpeed);

  // Comfort score calculation (0 - 100)
  const calculateComfortScore = () => {
    let score = 100;
    // Ideal temp 20 - 24
    if (tempC < 20) score -= Math.min(40, (20 - tempC) * 2.5);
    if (tempC > 24) score -= Math.min(40, (tempC - 24) * 3);
    // Ideal humidity 40 - 60%
    if (rh < 40) score -= (40 - rh) * 0.8;
    if (rh > 60) score -= (rh - 60) * 0.8;
    // Wind factor
    if (current.windSpeed > 25) score -= (current.windSpeed - 25) * 0.5;
    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const comfortScore = calculateComfortScore();

  return (
    <div id="atmospheric-highlights" className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Atmospheric Highlights & Comfort Index
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Derived meteorological metrics & sensory thermal indicators
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-zinc-400">Station Lat: {data.location.latitude.toFixed(2)}°</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thermal Comfort Score */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Comfort Index
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {comfortScore}/100
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  comfortScore >= 75
                    ? 'bg-emerald-500'
                    : comfortScore >= 50
                    ? 'bg-sky-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${comfortScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
              {comfortScore >= 80
                ? 'Ideal thermal comfort conditions.'
                : comfortScore >= 60
                ? 'Pleasant atmospheric balance.'
                : 'Noticeable heat or chill discomfort.'}
            </p>
          </div>
        </div>

        {/* Dew Point & Vapor pressure */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Dew Point
            </span>
            <span className="font-mono text-zinc-400">Condensation</span>
          </div>

          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {formatTemperature(dewPointC, unit)}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {dewPointC < 10
                ? 'Dry, crisp air sensation.'
                : dewPointC < 16
                ? 'Very comfortable moisture level.'
                : dewPointC < 21
                ? 'Humid, sticky feel in the air.'
                : 'Oppressively muggy.'}
            </p>
          </div>
        </div>

        {/* Wind Beaufort & Gust Dynamics */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Wind className="w-3.5 h-3.5 text-sky-500" />
              Wind Force
            </span>
            <span className={`text-[11px] font-semibold ${windClass.color}`}>
              {windClass.label}
            </span>
          </div>

          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-baseline gap-1">
              <span>{current.windSpeed.toFixed(1)}</span>
              <span className="text-xs font-sans text-zinc-400">km/h</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Bearing {Math.round(current.windDirection)}° with steady laminar airflow.
            </p>
          </div>
        </div>

        {/* Diurnal Thermal Range (Day vs Night Spread) */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <SunMedium className="w-3.5 h-3.5 text-amber-500" />
              Diurnal Delta
            </span>
            <span className="font-mono text-zinc-400">Day/Night</span>
          </div>

          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              Δ {Math.abs(Math.round(current.todayMax - current.todayMin))}°
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Variance between daytime peak ({formatTemperature(current.todayMax, unit)}) and overnight low.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
