import React, { useState, useRef } from 'react';
import {
  HourlyForecastItem,
  DailyForecastItem,
  TemperatureUnit,
} from '../types/weather';
import { formatTemperature } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { TrendingUp, Calendar, Clock, Droplets, CloudRain } from 'lucide-react';

interface WeatherChartProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ hourly, daily, unit }) => {
  const [viewMode, setViewMode] = useState<'hourly' | 'daily'>('hourly');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert celsius to chosen unit value for calculations
  const convert = (celsius: number) => {
    return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  };

  // Dimensions for SVG canvas
  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 35, right: 30, bottom: 45, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Hourly dataset calculations
  const hourlyData = hourly.slice(0, 24);
  const hourlyTemps = hourlyData.map((d) => convert(d.temperature));
  const hourlyMinTemp = hourlyTemps.length ? Math.min(...hourlyTemps) : 0;
  const hourlyMaxTemp = hourlyTemps.length ? Math.max(...hourlyTemps) : 30;
  const hourlyRange = Math.max(hourlyMaxTemp - hourlyMinTemp, 4);
  const hourlyYMin = Math.floor(hourlyMinTemp - 1);
  const hourlyYMax = Math.ceil(hourlyMaxTemp + 1.5);
  const hourlyYRange = hourlyYMax - hourlyYMin;

  const getHourlyX = (index: number) => {
    if (hourlyData.length <= 1) return padding.left;
    return padding.left + (index / (hourlyData.length - 1)) * graphWidth;
  };

  const getHourlyY = (tempVal: number) => {
    return (
      padding.top +
      graphHeight -
      ((tempVal - hourlyYMin) / hourlyYRange) * graphHeight
    );
  };

  // Generate smooth SVG curve path for hourly points
  const generateHourlyPath = () => {
    if (hourlyData.length === 0) return '';
    const points = hourlyData.map((d, i) => ({
      x: getHourlyX(i),
      y: getHourlyY(convert(d.temperature)),
    }));

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const hourlyLinePath = generateHourlyPath();
  const hourlyAreaPath = hourlyLinePath
    ? `${hourlyLinePath} L ${padding.left + graphWidth} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`
    : '';

  // Daily dataset calculations (Max & Min lines)
  const dailyData = daily.slice(0, 7);
  const dailyMaxTemps = dailyData.map((d) => convert(d.tempMax));
  const dailyMinTemps = dailyData.map((d) => convert(d.tempMin));
  const overallDailyMin = dailyMinTemps.length ? Math.min(...dailyMinTemps) : 0;
  const overallDailyMax = dailyMaxTemps.length ? Math.max(...dailyMaxTemps) : 30;
  const dailyYMin = Math.floor(overallDailyMin - 2);
  const dailyYMax = Math.ceil(overallDailyMax + 2);
  const dailyYRange = Math.max(dailyYMax - dailyYMin, 5);

  const getDailyX = (index: number) => {
    if (dailyData.length <= 1) return padding.left;
    return padding.left + (index / (dailyData.length - 1)) * graphWidth;
  };

  const getDailyY = (tempVal: number) => {
    return (
      padding.top +
      graphHeight -
      ((tempVal - dailyYMin) / dailyYRange) * graphHeight
    );
  };

  const generateDailyMaxPath = () => {
    if (dailyData.length === 0) return '';
    const points = dailyData.map((d, i) => ({
      x: getDailyX(i),
      y: getDailyY(convert(d.tempMax)),
    }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      path += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const generateDailyMinPath = () => {
    if (dailyData.length === 0) return '';
    const points = dailyData.map((d, i) => ({
      x: getDailyX(i),
      y: getDailyY(convert(d.tempMin)),
    }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      path += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  // Mouse scrub handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normalizedX = (clientX / rect.width) * svgWidth;

    const dataLength = viewMode === 'hourly' ? hourlyData.length : dailyData.length;
    if (dataLength <= 1) return;

    const relativeX = normalizedX - padding.left;
    const clampedRelativeX = Math.max(0, Math.min(graphWidth, relativeX));
    const step = graphWidth / (dataLength - 1);
    const closestIndex = Math.round(clampedRelativeX / step);

    if (closestIndex >= 0 && closestIndex < dataLength) {
      setHoverIndex(closestIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeHourlyItem =
    viewMode === 'hourly' && hoverIndex !== null ? hourlyData[hoverIndex] : null;
  const activeDailyItem =
    viewMode === 'daily' && hoverIndex !== null ? dailyData[hoverIndex] : null;

  return (
    <div
      id="weather-trend-chart-card"
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Interactive Temperature & Trend Analysis
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {viewMode === 'hourly'
                ? 'Chronological next 24-hour temperature progression & relative humidity'
                : '7-day daily maximum & minimum temperature range envelope'}
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setViewMode('hourly');
              setHoverIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'hourly'
                ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            24h Hourly
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('daily');
              setHoverIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            7-Day Outlook
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="hourlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="dailyMaxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y-Axis Labels */}
          {viewMode === 'hourly' ? (
            <>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const yVal = padding.top + ratio * graphHeight;
                const tempLabel = Math.round(hourlyYMax - ratio * hourlyYRange);
                return (
                  <g key={`grid-h-${ratio}`}>
                    <line
                      x1={padding.left}
                      y1={yVal}
                      x2={padding.left + graphWidth}
                      y2={yVal}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={yVal + 3.5}
                      textAnchor="end"
                      className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                    >
                      {tempLabel}°
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {[0, 0.33, 0.66, 1].map((ratio) => {
                const yVal = padding.top + ratio * graphHeight;
                const tempLabel = Math.round(dailyYMax - ratio * dailyYRange);
                return (
                  <g key={`grid-d-${ratio}`}>
                    <line
                      x1={padding.left}
                      y1={yVal}
                      x2={padding.left + graphWidth}
                      y2={yVal}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={yVal + 3.5}
                      textAnchor="end"
                      className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                    >
                      {tempLabel}°
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Render Hourly Curve */}
          {viewMode === 'hourly' && (
            <>
              {/* Shaded Area */}
              <path d={hourlyAreaPath} fill="url(#hourlyAreaGrad)" />

              {/* Main Curve Line */}
              <path
                d={hourlyLinePath}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points & X-axis labels */}
              {hourlyData.map((item, idx) => {
                const cx = getHourlyX(idx);
                const cy = getHourlyY(convert(item.temperature));
                const isEveryThird = idx % 3 === 0 || idx === hourlyData.length - 1;
                const isHovered = hoverIndex === idx;

                return (
                  <g key={`point-h-${idx}`}>
                    {/* Circle Node on key intervals or hover */}
                    {(isEveryThird || isHovered) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 5 : 3}
                        className={`transition-all ${
                          isHovered
                            ? 'fill-sky-500 stroke-white dark:stroke-zinc-900 stroke-2'
                            : 'fill-sky-500'
                        }`}
                      />
                    )}

                    {/* X-axis time label */}
                    {isEveryThird && (
                      <text
                        x={cx}
                        y={svgHeight - padding.bottom + 20}
                        textAnchor="middle"
                        className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-medium"
                      >
                        {item.formattedHour}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Active Hover Crosshair Line */}
              {hoverIndex !== null && hoverIndex < hourlyData.length && (
                <g>
                  <line
                    x1={getHourlyX(hoverIndex)}
                    y1={padding.top}
                    x2={getHourlyX(hoverIndex)}
                    y2={padding.top + graphHeight}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={getHourlyX(hoverIndex)}
                    cy={getHourlyY(convert(hourlyData[hoverIndex].temperature))}
                    r="6"
                    className="fill-sky-500 stroke-white dark:stroke-zinc-900 stroke-2 shadow-md"
                  />
                </g>
              )}
            </>
          )}

          {/* Render Daily Outlook Curves */}
          {viewMode === 'daily' && (
            <>
              {/* Daily Max Curve */}
              <path
                d={generateDailyMaxPath()}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Daily Min Curve */}
              <path
                d={generateDailyMinPath()}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 3"
              />

              {/* Data points & X-axis labels */}
              {dailyData.map((item, idx) => {
                const cx = getDailyX(idx);
                const cyMax = getDailyY(convert(item.tempMax));
                const cyMin = getDailyY(convert(item.tempMin));
                const isHovered = hoverIndex === idx;

                return (
                  <g key={`point-d-${idx}`}>
                    <circle
                      cx={cx}
                      cy={cyMax}
                      r={isHovered ? 5 : 3.5}
                      className="fill-rose-500 stroke-white dark:stroke-zinc-900 stroke-2"
                    />
                    <circle
                      cx={cx}
                      cy={cyMin}
                      r={isHovered ? 5 : 3.5}
                      className="fill-sky-500 stroke-white dark:stroke-zinc-900 stroke-2"
                    />

                    {/* Day label */}
                    <text
                      x={cx}
                      y={svgHeight - padding.bottom + 20}
                      textAnchor="middle"
                      className="text-[11px] fill-zinc-600 dark:fill-zinc-300 font-semibold"
                    >
                      {item.dayOfWeek}
                    </text>
                    <text
                      x={cx}
                      y={svgHeight - padding.bottom + 34}
                      textAnchor="middle"
                      className="text-[9px] fill-zinc-400 font-mono"
                    >
                      {item.shortDate}
                    </text>
                  </g>
                );
              })}

              {/* Active Hover Crosshair Line */}
              {hoverIndex !== null && hoverIndex < dailyData.length && (
                <line
                  x1={getDailyX(hoverIndex)}
                  y1={padding.top}
                  x2={getDailyX(hoverIndex)}
                  y2={padding.top + graphHeight}
                  stroke="#a1a1aa"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
            </>
          )}
        </svg>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            {viewMode === 'hourly' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Temperature ({unit === 'celsius' ? '°C' : '°F'})</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  <span>Humidity tracked</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Maximum High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Minimum Low</span>
                </div>
              </>
            )}
          </div>

          <span className="text-[11px] text-zinc-400 italic">
            Hover or touch chart line to inspect specific values
          </span>
        </div>

        {/* Floating Tooltip Card */}
        {activeHourlyItem && (
          <div
            className="absolute top-4 right-4 bg-zinc-900/95 dark:bg-zinc-950/95 text-white p-3 rounded-xl border border-zinc-700 shadow-xl backdrop-blur-md pointer-events-none text-xs space-y-1.5 transition-all"
            style={{ minWidth: '160px' }}
          >
            <div className="flex items-center justify-between font-semibold border-b border-zinc-800 pb-1">
              <span>{activeHourlyItem.formattedHour}</span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {activeHourlyItem.time.split('T')[0]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Temperature:</span>
              <span className="font-bold text-sky-400 font-mono">
                {formatTemperature(activeHourlyItem.temperature, unit)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Humidity:</span>
              <span className="font-medium text-emerald-400 font-mono">
                {Math.round(activeHourlyItem.humidity)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-zinc-300">
              <WeatherIcon
                name={activeHourlyItem.condition.iconName}
                className="w-3.5 h-3.5 text-sky-400"
              />
              <span className="truncate">{activeHourlyItem.condition.label}</span>
            </div>
          </div>
        )}

        {activeDailyItem && (
          <div
            className="absolute top-4 right-4 bg-zinc-900/95 dark:bg-zinc-950/95 text-white p-3 rounded-xl border border-zinc-700 shadow-xl backdrop-blur-md pointer-events-none text-xs space-y-1.5 transition-all"
            style={{ minWidth: '170px' }}
          >
            <div className="flex items-center justify-between font-semibold border-b border-zinc-800 pb-1">
              <span>{activeDailyItem.dayOfWeek}</span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {activeDailyItem.shortDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">High / Low:</span>
              <span className="font-bold font-mono">
                <span className="text-rose-400">
                  {formatTemperature(activeDailyItem.tempMax, unit)}
                </span>{' '}
                /{' '}
                <span className="text-sky-400">
                  {formatTemperature(activeDailyItem.tempMin, unit)}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Precipitation:</span>
              <span className="font-medium text-blue-400 font-mono flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                {activeDailyItem.precipitationSum.toFixed(1)} mm
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-zinc-300">
              <WeatherIcon
                name={activeDailyItem.condition.iconName}
                className="w-3.5 h-3.5 text-sky-400"
              />
              <span className="truncate">{activeDailyItem.condition.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
