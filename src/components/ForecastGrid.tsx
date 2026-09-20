import React from 'react';
import { DailyForecastItem, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { CalendarDays, CloudRain, Droplets } from 'lucide-react';

interface ForecastGridProps {
  forecast: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const ForecastGrid: React.FC<ForecastGridProps> = ({ forecast, unit }) => {
  // Find global min and max across all 7 days for the visual range bar
  const allMax = forecast.map((f) => f.tempMax);
  const allMin = forecast.map((f) => f.tempMin);
  const globalMin = allMin.length ? Math.min(...allMin) : 0;
  const globalMax = allMax.length ? Math.max(...allMax) : 35;
  const globalRange = Math.max(globalMax - globalMin, 1);

  return (
    <div id="seven-day-forecast-section" className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              7-Day Atmospheric Outlook
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Extended forecast trajectory with temperature ranges and anticipated precipitation
            </p>
          </div>
        </div>

        <span className="text-xs text-zinc-400 hidden sm:inline">
          Open-Meteo High-Resolution Model
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((item, index) => {
          const isToday = index === 0;

          // Compute bar position relative to week range
          const leftPercent = Math.max(0, ((item.tempMin - globalMin) / globalRange) * 100);
          const widthPercent = Math.max(
            15,
            ((item.tempMax - item.tempMin) / globalRange) * 100,
          );

          return (
            <div
              key={item.date}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                isToday
                  ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800 ring-1 ring-sky-400/30'
                  : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800/70'
              }`}
            >
              {/* Day & Date Header */}
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-700/40 pb-2 mb-3">
                <div>
                  <div
                    className={`text-sm font-bold ${
                      isToday
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {item.dayOfWeek}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">{item.shortDate}</div>
                </div>
                {isToday && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-sky-600 text-white">
                    Now
                  </span>
                )}
              </div>

              {/* Weather Icon & Condition */}
              <div className="my-2 flex flex-col items-center text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700/50 shadow-2xs mb-2">
                  <WeatherIcon
                    name={item.condition.iconName}
                    className="w-8 h-8 text-sky-600 dark:text-sky-400"
                  />
                </div>
                <div
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1"
                  title={item.condition.label}
                >
                  {item.condition.label}
                </div>
              </div>

              {/* Precipitation */}
              <div className="mt-2 mb-3 flex items-center justify-center gap-1 text-xs">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span
                  className={`font-mono text-[11px] ${
                    item.precipitationSum > 0
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {item.precipitationSum > 0 ? `${item.precipitationSum.toFixed(1)} mm` : '0 mm'}
                </span>
              </div>

              {/* Min - Max Temperature Spread */}
              <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    {formatTemperature(item.tempMin, unit)}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {formatTemperature(item.tempMax, unit)}
                  </span>
                </div>

                {/* Relative Range Thermometer Bar */}
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-rose-400 rounded-full"
                    style={{
                      marginLeft: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
