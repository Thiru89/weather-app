import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, MapPin, WifiOff, Clock } from 'lucide-react';
import { GeoLocation } from '../types/weather';
import { POPULAR_CITIES } from '../services/weatherApi';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  onSelectCity: (location: GeoLocation) => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onSelectCity,
}) => {
  const is503OrServerBusy =
    message.includes('503') ||
    message.includes('busy') ||
    message.includes('overloaded') ||
    message.includes('502') ||
    message.includes('504');

  const [countdown, setCountdown] = useState<number>(is503OrServerBusy ? 5 : 0);

  useEffect(() => {
    if (!is503OrServerBusy) return;

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [is503OrServerBusy, onRetry, message]);

  return (
    <div
      id="error-state-container"
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm"
    >
      <div
        className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
          is503OrServerBusy
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
        }`}
      >
        {is503OrServerBusy ? <WifiOff className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {is503OrServerBusy ? 'Weather Service Temporarily Busy' : 'Unable to Load Weather Data'}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
        {is503OrServerBusy
          ? 'Open-Meteo public servers are currently handling high traffic (HTTP 503). An automatic reconnect attempt is scheduled.'
          : message || 'City not found. Please try searching another city.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {countdown > 0 ? `Retry Now (Auto-retrying in ${countdown}s)` : 'Retry Now'}
        </button>
      </div>

      {countdown > 0 && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Automatic reconnection in progress...</span>
        </div>
      )}

      {/* Suggested cities */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 font-medium mb-3">
          Or switch to a major world capital:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.slice(0, 6).map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 transition-colors cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-sky-500" />
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
