import React from 'react';
import { WeatherInsight } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Sparkles, Compass } from 'lucide-react';

interface InsightsCardProps {
  insights: WeatherInsight[];
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  const getBadgeStyle = (type: WeatherInsight['type']) => {
    switch (type) {
      case 'success':
        return {
          cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-800/60',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
          tagBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
        };
      case 'warning':
        return {
          cardBg: 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-800/60',
          iconBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
          tagBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200',
        };
      case 'caution':
        return {
          cardBg: 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-800/60',
          iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
          tagBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
        };
      case 'info':
      default:
        return {
          cardBg: 'bg-sky-50/70 dark:bg-sky-950/25 border-sky-200/80 dark:border-sky-800/60',
          iconBg: 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
          tagBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200',
        };
    }
  };

  return (
    <div id="weather-insights-section" className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Weather Intelligence & Daily Planning
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Dynamic situational recommendations tailored to current atmospheric readings
            </p>
          </div>
        </div>

        <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-zinc-400">
          <Compass className="w-3.5 h-3.5" />
          Auto-Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {insights.map((insight) => {
          const styles = getBadgeStyle(insight.type);
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border ${styles.cardBg} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${styles.iconBg}`}>
                  <WeatherIcon name={insight.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {insight.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.tagBg}`}
                    >
                      {insight.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {insight.advice}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
