import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Weather Card Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7">
        <div className="flex justify-between items-start">
          <div className="space-y-2.5">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          </div>
          <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>

        <div className="mt-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-12 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Insights Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="h-6 w-52 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-8 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-56 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
      </div>

      {/* 7-day skeleton */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="h-6 w-44 bg-zinc-200 dark:bg-zinc-800 rounded mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-44 bg-zinc-100 dark:bg-zinc-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
