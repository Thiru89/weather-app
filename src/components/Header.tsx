import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Sun,
  Moon,
  Loader2,
  X,
  Navigation,
} from 'lucide-react';
import { GeoLocation, TemperatureUnit, ThemeMode } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/weatherApi';

interface HeaderProps {
  onSelectCity: (location: GeoLocation) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation: boolean;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentCityName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLoadingLocation,
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  currentCityName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced auto-search for suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchCities(searchQuery, 5);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching suggestions', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocation) => {
    onSelectCity(city);
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      setIsSearching(true);
      try {
        const results = await searchCities(searchQuery, 1);
        if (results.length > 0) {
          handleSelect(results[0]);
        } else {
          // Pass a synthetic location or let the app know city was not found
          onSelectCity({
            id: -1,
            name: searchQuery.trim(),
            latitude: 0,
            longitude: 0,
            country: '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
        setIsOpen(false);
      }
    }
  };

  return (
    <header id="app-header" className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Brand & Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  Weather Intelligence
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Live Open-Meteo
                  </span>
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Precision atmospheric forecast & planning insights
                </p>
              </div>
            </div>

            {/* Mobile Actions: Unit & Theme */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                id="unit-toggle-mobile"
                type="button"
                onClick={onToggleUnit}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Toggle temperature unit"
              >
                {unit === 'celsius' ? '°C' : '°F'}
              </button>
              <button
                id="theme-toggle-mobile"
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
              </button>
            </div>
          </div>

          {/* Search bar & Controls */}
          <div className="flex flex-1 max-w-2xl items-center gap-2 relative">
            <div ref={dropdownRef} className="relative flex-1">
              <form onSubmit={handleManualSubmit} className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>

                <input
                  id="city-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsOpen(true);
                  }}
                  placeholder="Search city (e.g., Paris, Tokyo, San Francisco)..."
                  className="w-full pl-10 pr-24 py-2.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                    }}
                    className="absolute right-14 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id="city-search-submit-btn"
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {isOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 text-[11px] font-medium text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    City Suggestions
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {suggestions.map((city) => (
                      <li key={`${city.id}-${city.latitude}-${city.longitude}`}>
                        <button
                          type="button"
                          onClick={() => handleSelect(city)}
                          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-sky-50/70 dark:hover:bg-sky-950/40 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-sky-500 transition-colors" />
                            <div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                                {city.name}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {[city.admin1, city.country].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Geolocation Button */}
            <button
              id="locate-me-btn"
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLoadingLocation}
              title="Use current location"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-98 transition-all shrink-0"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              )}
              <span className="hidden sm:inline">My Location</span>
            </button>

            {/* Desktop Actions: Unit & Theme */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <button
                id="unit-toggle-desktop"
                type="button"
                onClick={onToggleUnit}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Toggle between Celsius and Fahrenheit"
              >
                {unit === 'celsius' ? '°C Metric' : '°F Imperial'}
              </button>
              <button
                id="theme-toggle-desktop"
                type="button"
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Toggle dark/light theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Popular Cities Pills */}
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-zinc-400 font-medium shrink-0 flex items-center gap-1 text-[11px]">
            <MapPin className="w-3 h-3" /> Quick Cities:
          </span>
          <div className="flex items-center gap-1.5">
            {POPULAR_CITIES.map((city) => {
              const isActive = currentCityName?.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
