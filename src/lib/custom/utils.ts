// CUSTOM: Utility functions for custom analytics interface
// Date: 2025-01-04

import type { DomainMetrics, MetricType, SortOption } from './types';

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
export function getDateRangeDays(range: '7d' | '28d' | '90d' | 'custom'): number {
  switch (range) {
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
