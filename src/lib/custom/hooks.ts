// CUSTOM: React hooks for custom analytics interface
// Date: 2025-01-04

import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from './utils';
import type { MetricType, FilterState } from './types';

/**
 * Hook for debounced value
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for persisting active metrics to localStorage
 */
export function usePersistedMetrics(
  defaultMetrics: MetricType[] = ['pageviews', 'visits', 'visitors'],
): [MetricType[], (metrics: MetricType[]) => void] {
  const [metrics, setMetricsState] = useState<MetricType[]>(() =>
    storage.get(STORAGE_KEYS.ACTIVE_METRICS, defaultMetrics),
  );

  const setMetrics = (newMetrics: MetricType[]) => {
    setMetricsState(newMetrics);
    storage.set(STORAGE_KEYS.ACTIVE_METRICS, newMetrics);
  };

  return [metrics, setMetrics];
}

/**
 * Hook for persisting date range to localStorage
 */
export function usePersistedDateRange(
  defaultRange: FilterState['dateRange'] = '28d',
): [FilterState['dateRange'], (range: FilterState['dateRange']) => void] {
  const [dateRange, setDateRangeState] = useState<FilterState['dateRange']>(() =>
    storage.get(STORAGE_KEYS.DATE_RANGE, defaultRange),
  );

  const setDateRange = (newRange: FilterState['dateRange']) => {
    setDateRangeState(newRange);
    storage.set(STORAGE_KEYS.DATE_RANGE, newRange);
  };

  return [dateRange, setDateRange];
}

/**
 * Hook for persisting sort option to localStorage
 */
export function usePersistedSort(
  defaultSort: FilterState['sortBy'] = 'name_asc',
): [FilterState['sortBy'], (sort: FilterState['sortBy']) => void] {
  const [sortBy, setSortByState] = useState<FilterState['sortBy']>(() =>
    storage.get(STORAGE_KEYS.SORT_BY, defaultSort),
  );

  const setSortBy = (newSort: FilterState['sortBy']) => {
    setSortByState(newSort);
    storage.set(STORAGE_KEYS.SORT_BY, newSort);
  };

  return [sortBy, setSortBy];
}

/**
 * Hook for persisting favorites to localStorage
 */
export function usePersistedFavorites(
  defaultFavorites: string[] = [],
): [string[], (favorites: string[]) => void] {
  const [favorites, setFavoritesState] = useState<string[]>(() =>
    storage.get(STORAGE_KEYS.FAVORITES, defaultFavorites),
  );

  const setFavorites = (newFavorites: string[]) => {
    setFavoritesState(newFavorites);
    storage.set(STORAGE_KEYS.FAVORITES, newFavorites);
  };

  return [favorites, setFavorites];
}

/**
 * Hook for managing window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

/**
 * Hook for throttling a value (useful for scroll/resize events)
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useState(Date.now())[0];

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
}
