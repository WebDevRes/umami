// CUSTOM: Utility functions for custom analytics interface
// Date: 2025-01-04

import { subDays, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import type { DomainMetrics, MetricType, SortOption, TimeSeriesDataPoint } from './types';

/**
 * CUSTOM: Convert FilterBar date range to actual Date objects
 * Uses timezone-aware calculation to ensure dates match the user's selected timezone.
 *
 * Problem: parseDateRange uses browser's local time, but toUtc expects timezone from store.
 * If browser timezone differs from store timezone, dates shift incorrectly.
 *
 * Solution: Use utcToZonedTime to get current time in target timezone first,
 * then apply startOfDay/endOfDay to that zoned time.
 */
export function getDateRangeForFilter(
  filter: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
  timezone: string,
): { startDate: Date; endDate: Date } {
  // Get current UTC time and convert to target timezone representation
  const utcNow = new Date();
  const nowInTz = utcToZonedTime(utcNow, timezone);

  // Apply startOfDay/endOfDay to the zoned time
  const todayStart = startOfDay(nowInTz);
  const todayEnd = endOfDay(nowInTz);

  switch (filter) {
    case 'today':
      return { startDate: todayStart, endDate: todayEnd };

    case 'yesterday': {
      const yesterdayInTz = subDays(nowInTz, 1);
      return {
        startDate: startOfDay(yesterdayInTz),
        endDate: endOfDay(yesterdayInTz),
      };
    }

    case '7d':
      // 7 days = today + 6 previous days
      return { startDate: subDays(todayStart, 6), endDate: todayEnd };

    case '28d':
      // 28 days = today + 27 previous days
      return { startDate: subDays(todayStart, 27), endDate: todayEnd };

    case '90d':
      // 90 days = today + 89 previous days
      return { startDate: subDays(todayStart, 89), endDate: todayEnd };

    default:
      // Default to 7 days
      return { startDate: subDays(todayStart, 6), endDate: todayEnd };
  }
}

/**
 * Format large numbers with K/M suffix
 * @example formatNumber(1234) => "1.2k"
 * @example formatNumber(1234567) => "1.2M"
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

/**
 * Format time in seconds to readable format
 * @example formatTime(65) => "1m 5s"
 * @example formatTime(45) => "45s"
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get color class for metric change (positive/negative/neutral)
 */
export function getChangeColorClass(change: number): string {
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
}

/**
 * Get arrow icon for metric change
 */
export function getChangeArrow(change: number): string {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '→';
}

/**
 * Format change percentage
 * @example formatChange(15.5) => "+15.5%"
 * @example formatChange(-5.2) => "-5.2%"
 */
export function formatChange(change: number): string {
  const formatted = Math.abs(change).toFixed(1);
  const sign = change > 0 ? '+' : change < 0 ? '-' : '';
  return `${sign}${formatted}%`;
}

/**
 * Sort domains by specified criteria
 */
export function sortDomains(domains: DomainMetrics[], sortBy: SortOption): DomainMetrics[] {
  const sorted = [...domains];

  switch (sortBy) {
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));

    case 'visitors_desc':
      return sorted.sort((a, b) => b.visitors.current - a.visitors.current);

    case 'visitors_asc':
      return sorted.sort((a, b) => a.visitors.current - b.visitors.current);

    case 'pageviews_desc':
      return sorted.sort((a, b) => b.pageviews.current - a.pageviews.current);

    default:
      return sorted;
  }
}

/**
 * Filter domains by search query (domain or name)
 */
export function filterDomainsBySearch(domains: DomainMetrics[], query: string): DomainMetrics[] {
  if (!query.trim()) {
    return domains;
  }

  const lowerQuery = query.toLowerCase();

  return domains.filter(
    domain =>
      domain.domain.toLowerCase().includes(lowerQuery) ||
      domain.name.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Filter domains by tags
 */
export function filterDomainsByTags(
  domains: DomainMetrics[],
  selectedTags: string[],
): DomainMetrics[] {
  if (selectedTags.length === 0) {
    return domains;
  }

  return domains.filter(domain => selectedTags.some(tag => domain.tags.includes(tag)));
}

/**
 * Separate favorites from regular domains
 */
export function separateFavorites(domains: DomainMetrics[]): {
  favorites: DomainMetrics[];
  regular: DomainMetrics[];
} {
  const favorites = domains.filter(d => d.isFavorite);
  const regular = domains.filter(d => !d.isFavorite);

  return { favorites, regular };
}

/**
 * Apply all filters and sorting
 */
export function applyFiltersAndSort(
  domains: DomainMetrics[],
  searchQuery: string,
  selectedTags: string[],
  sortBy: SortOption,
): DomainMetrics[] {
  let filtered = domains;

  // Apply search filter
  filtered = filterDomainsBySearch(filtered, searchQuery);

  // Apply tag filter
  filtered = filterDomainsByTags(filtered, selectedTags);

  // Apply sorting
  filtered = sortDomains(filtered, sortBy);

  return filtered;
}

/**
 * Get metric color CSS variable name
 */
export function getMetricColor(metric: MetricType): string {
  const colors: Record<MetricType, string> = {
    pageviews: 'var(--primary400)',
    visits: 'var(--purple500)',
    visitors: 'var(--orange500)',
    bounces: 'var(--red500)',
    avgTime: 'var(--teal500)',
  };

  return colors[metric];
}

/**
 * Get metric label
 */
export function getMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    pageviews: 'Pageviews',
    visits: 'Visits',
    visitors: 'Visitors',
    bounces: 'Bounces',
    avgTime: 'Avg. Time',
  };

  return labels[metric];
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Get date range in days
 */
export function getDateRangeDays(
  range: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
): number {
  switch (range) {
    case 'today':
    case 'yesterday':
      return 1; // CUSTOM: 1 day with hourly data
    case '7d':
      return 7;
    case '28d':
      return 28;
    case '90d':
      return 90;
    default:
      return 28;
  }
}

/**
 * Get date range value in umami format for parseDateRange
 * CUSTOM: Returns string format compatible with umami's parseDateRange function
 * Note: umami DEFAULT_DATE_RANGE is '24hour', not '1day'
 */
export function getDateRangeValue(
  range: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
): string {
  switch (range) {
    case 'today':
      return '24hour'; // CUSTOM: Match umami's default behavior (last 24 hours from current hour)
    case 'yesterday':
      return '24hour'; // TODO: Could add offset support for yesterday
    case '7d':
      return '7day';
    case '28d':
      return '28day';
    case '90d':
      return '90day';
    default:
      return '7day';
  }
}

/**
 * Filter time series by date range
 */
export function filterTimeSeriesByDateRange(
  timeSeries: TimeSeriesDataPoint[],
  dateRange: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
): TimeSeriesDataPoint[] {
  // CUSTOM: For today/yesterday with hourly data (dateRangeDays <= 2),
  // API already returns data for last 24h, so don't filter by date
  if (dateRange === 'today' || dateRange === 'yesterday') {
    // Return all hourly data (API already filtered to correct 24h period)
    return timeSeries;
  }

  // CUSTOM: For other ranges (7d/28d/90d), take last N days
  const days = getDateRangeDays(dateRange);
  // API returns daily data as "YYYY-MM-DD HH:MM:SS" (daily) or "YYYY-MM-DDTHH:MM" (hourly)
  // We consider "HH:MM:SS" pattern as daily, exclude only if it's actual hourly format
  const dailyData = timeSeries.filter(point => !point.date.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/));
  return dailyData.slice(-days);
}

/**
 * Recalculate domain metrics based on selected date range
 */
export function recalculateDomainMetricsForDateRange(
  domain: DomainMetrics,
  dateRange: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
): DomainMetrics {
  // CUSTOM: For ALL date ranges, API already returns correct aggregated metrics
  // for the requested period. We only need to filter timeSeries for the chart.
  // DO NOT recalculate pageviews/visits/visitors - they come from stats API!

  // For today/yesterday, return as-is (hourly data)
  if (dateRange === 'today' || dateRange === 'yesterday') {
    return domain;
  }

  // For 7d/28d/90d, only filter timeSeries for chart display
  // Keep the original metrics from API!
  const filteredTimeSeries = filterTimeSeriesByDateRange(domain.timeSeries, dateRange);

  return {
    ...domain,
    timeSeries: filteredTimeSeries,
    // pageviews, visits, visitors, bounces, avgTime remain UNCHANGED
    // (they are already correct from stats API)
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculate bounce rate percentage
 */
export function calculateBounceRate(bounces: number, visits: number): number {
  if (visits === 0) return 0;
  return Math.round((bounces / visits) * 100);
}

/**
 * Export data to CSV format
 */
export function exportToCSV(domains: DomainMetrics[], filename: string = 'analytics-export.csv') {
  const headers = [
    'Domain',
    'Name',
    'Pageviews',
    'Visits',
    'Visitors',
    'Bounce Rate',
    'Avg Time',
    'Tags',
  ];

  const rows = domains.map(domain => [
    domain.domain,
    domain.name,
    domain.pageviews.current.toString(),
    domain.visits.current.toString(),
    domain.visitors.current.toString(),
    calculateBounceRate(domain.bounces.current, domain.visits.current).toString() + '%',
    formatTime(domain.avgTime.current),
    domain.tags.join(';'),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * LocalStorage utility for custom analytics preferences
 */
const STORAGE_PREFIX = 'umami_custom_analytics_';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = window.localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error writing to localStorage:', error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing from localStorage:', error);
    }
  },
};

/**
 * Storage keys for preferences
 */
export const STORAGE_KEYS = {
  ACTIVE_METRICS: 'active_metrics',
  DATE_RANGE: 'date_range',
  SORT_BY: 'sort_by',
  FAVORITES: 'favorites',
} as const;

/**
 * Filter and sort domains based on filter state
 */
export function filterAndSortDomains(
  domains: DomainMetrics[],
  filterState: { searchQuery: string; selectedTags: string[]; sortBy: SortOption },
): DomainMetrics[] {
  return applyFiltersAndSort(
    domains,
    filterState.searchQuery,
    filterState.selectedTags,
    filterState.sortBy,
  );
}

/**
 * Calculate aggregated metrics from filtered domains
 */
export function calculateAggregatedMetrics(
  domains: DomainMetrics[],
  dateRange?: 'today' | 'yesterday' | '7d' | '28d' | '90d' | 'custom',
): {
  pageviews: number;
  visits: number;
  visitors: number;
  bounceRate: number;
  avgTime: number;
  realtimeTotal: number;
  timeSeries: Array<{
    date: string;
    pageviews: number;
    visits: number;
    visitors: number;
    bounces: number;
    avgTime: number;
  }>;
} {
  if (domains.length === 0) {
    return {
      pageviews: 0,
      visits: 0,
      visitors: 0,
      bounceRate: 0,
      avgTime: 0,
      realtimeTotal: 0,
      timeSeries: [],
    };
  }

  // Aggregate time series
  const timeSeriesMap = new Map<
    string,
    { pageviews: number; visits: number; visitors: number; bounces: number; avgTime: number }
  >();

  domains.forEach(domain => {
    // Filter time series by date range if provided
    const filteredTimeSeries = dateRange
      ? filterTimeSeriesByDateRange(domain.timeSeries, dateRange)
      : domain.timeSeries;

    filteredTimeSeries.forEach(point => {
      const existing = timeSeriesMap.get(point.date) || {
        pageviews: 0,
        visits: 0,
        visitors: 0,
        bounces: 0,
        avgTime: 0,
      };

      timeSeriesMap.set(point.date, {
        pageviews: existing.pageviews + point.pageviews,
        visits: existing.visits + point.visits,
        visitors: existing.visitors + point.visitors,
        bounces: existing.bounces + point.bounces,
        avgTime: existing.avgTime + point.avgTime,
      });
    });
  });

  // Convert map to sorted array and calculate average avgTime per day
  const timeSeries = Array.from(timeSeriesMap.entries())
    .map(([date, values]) => ({
      date,
      pageviews: values.pageviews,
      visits: values.visits,
      visitors: values.visitors,
      bounces: values.bounces,
      avgTime: Math.round(values.avgTime / domains.length), // Average time per day
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate pageviews/visits from time series (day-by-day data)
  const timeSeriesTotals = timeSeries.reduce(
    (acc, point) => ({
      pageviews: acc.pageviews + point.pageviews,
      visits: acc.visits + point.visits,
    }),
    { pageviews: 0, visits: 0 },
  );

  // Aggregate visitors/bounces/avgTime from domain stats (not available per-day)
  const domainTotals = domains.reduce(
    (acc, domain) => ({
      visitors: acc.visitors + domain.visitors.current,
      bounces: acc.bounces + domain.bounces.current,
      avgTime: acc.avgTime + domain.avgTime.current,
    }),
    { visitors: 0, bounces: 0, avgTime: 0 },
  );

  // Calculate average bounce rate (bounces / visits * 100)
  const bounceRate =
    timeSeriesTotals.visits > 0 ? (domainTotals.bounces / timeSeriesTotals.visits) * 100 : 0;

  // Calculate average time across all domains
  const avgTime = domains.length > 0 ? domainTotals.avgTime / domains.length : 0;

  // Get realtime total
  const realtimeTotal = domains.reduce((sum, d) => sum + d.realtimeVisitors, 0);

  return {
    pageviews: timeSeriesTotals.pageviews,
    visits: timeSeriesTotals.visits,
    visitors: domainTotals.visitors,
    bounceRate: Math.round(bounceRate * 10) / 10, // Round to 1 decimal
    avgTime: Math.round(avgTime),
    realtimeTotal,
    timeSeries,
  };
}
