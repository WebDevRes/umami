// Custom Analytics Interface - Type Definitions
// CUSTOM: New types for custom analytics dashboard
// Date: 2025-01-04

export interface MetricValue {
  current: number;
  previous: number;
  change: number; // Percentage change (-100 to +Infinity)
}

export interface TimeSeriesDataPoint {
  date: string; // ISO format: 'YYYY-MM-DD'
  pageviews: number;
  visits: number;
  visitors: number;
  bounces: number;
  avgTime: number; // in seconds
}

export interface DomainMetrics {
  id: string; // Unique identifier
  domain: string; // e.g., 'example.com'
  name: string; // Display name (can be custom)
  favicon?: string; // URL to favicon

  // Core metrics with comparison to previous period
  pageviews: MetricValue;
  visits: MetricValue;
  visitors: MetricValue;
  bounces: MetricValue;
  avgTime: MetricValue;

  // Time series data for mini charts
  timeSeries: TimeSeriesDataPoint[];

  // Metadata
  isFavorite: boolean;
  tags: string[];
  realtimeVisitors: number; // Current active visitors
  lastUpdate: Date;
}

export interface AggregatedMetrics {
  pageviews: number;
  visits: number;
  visitors: number;
  realtimeTotal: number;

  // Time series for aggregated chart
  timeSeries: TimeSeriesDataPoint[];
}

export interface DashboardData {
  domains: DomainMetrics[];
  totals: AggregatedMetrics;
  availableTags: string[];
}

export type MetricType = 'pageviews' | 'visits' | 'visitors' | 'bounces' | 'avgTime';

export type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'visitors_desc'
  | 'visitors_asc'
  | 'pageviews_desc';

export interface MetricConfig {
  key: MetricType;
  label: string;
  icon: string;
  color: string;
  unit?: string;
}

export interface FilterState {
  dateRange: '7d' | '28d' | '90d' | 'custom';
  searchQuery: string;
  sortBy: SortOption;
  selectedTags: string[];
  activeMetrics: MetricType[];
}
