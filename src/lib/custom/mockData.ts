// Custom Analytics Interface - Mock Data Generator
// CUSTOM: Mock data for development and prototyping
// Date: 2025-01-04

import type { DashboardData, DomainMetrics, TimeSeriesDataPoint } from './types';

// Sample domains for testing (10 domains for initial prototype)
const SAMPLE_DOMAINS = [
  { domain: 'casino-royal.com', name: 'Casino Royal', tags: ['casino', 'gaming'] },
  { domain: 'betonline.io', name: 'Bet Online', tags: ['betting', 'sports'] },
  { domain: 'pokerstars.net', name: 'Poker Stars', tags: ['casino', 'poker'] },
  { domain: 'shopify-store.com', name: 'E-Shop Pro', tags: ['ecommerce'] },
  { domain: 'crypto-exchange.io', name: 'Crypto Exchange', tags: ['crypto', 'finance'] },
  { domain: 'news-portal.com', name: 'News Portal', tags: ['media', 'news'] },
  { domain: 'fitness-tracker.app', name: 'Fitness App', tags: ['health', 'mobile'] },
  { domain: 'learning-platform.edu', name: 'EduLearn', tags: ['education', 'saas'] },
  { domain: 'social-network.social', name: 'SocialHub', tags: ['social', 'community'] },
  { domain: 'analytics-dashboard.io', name: 'Analytics Pro', tags: ['saas', 'b2b'] },
];

const AVAILABLE_TAGS = [
  'casino',
  'betting',
  'gaming',
  'poker',
  'sports',
  'ecommerce',
  'crypto',
  'finance',
  'media',
  'news',
  'health',
  'mobile',
  'education',
  'saas',
  'social',
  'community',
  'b2b',
];

/**
 * Generates random number within range
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates random change percentage (-50% to +100%)
 */
function randomChange(): number {
  return Math.round((Math.random() * 150 - 50) * 10) / 10;
}

/**
 * Generates hourly data for a specific day
 * CUSTOM: For today/yesterday filters
 */
function generateHourlyData(date: Date): TimeSeriesDataPoint[] {
  const series: TimeSeriesDataPoint[] = [];
  const dateStr = date.toISOString().split('T')[0];

  // Generate 24 hours of data
  for (let hour = 0; hour < 24; hour++) {
    series.push({
      date: `${dateStr} ${hour.toString().padStart(2, '0')}:00`,
      pageviews: randomInt(50, 300),
      visits: randomInt(40, 200),
      visitors: randomInt(30, 150),
      bounces: randomInt(10, 40),
      avgTime: randomInt(20, 180),
    });
  }

  return series;
}

/**
 * Generates time series data for given number of days
 */
function generateTimeSeries(days: number): TimeSeriesDataPoint[] {
  const series: TimeSeriesDataPoint[] = [];
  const today = new Date();

  // Generate daily data for the past
  for (let i = days - 1; i >= 2; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    series.push({
      date: date.toISOString().split('T')[0],
      pageviews: randomInt(100, 5000),
      visits: randomInt(80, 3000),
      visitors: randomInt(50, 2000),
      bounces: randomInt(20, 60),
      avgTime: randomInt(30, 300),
    });
  }

  // CUSTOM: Add hourly data for yesterday and today
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  series.push(...generateHourlyData(yesterday));
  series.push(...generateHourlyData(today));

  return series;
}

/**
 * Generates mock domain metrics
 */
function generateDomainMetrics(
  domainConfig: { domain: string; name: string; tags: string[] },
  index: number,
): DomainMetrics {
  // Generate 90 days of data to support all date ranges
  const timeSeries = generateTimeSeries(90);

  // Calculate current metrics from time series (last 7 days average)
  const last7Days = timeSeries.slice(-7);
  const currentPageviews = Math.round(
    last7Days.reduce((sum, d) => sum + d.pageviews, 0) / last7Days.length,
  );
  const currentVisits = Math.round(
    last7Days.reduce((sum, d) => sum + d.visits, 0) / last7Days.length,
  );
  const currentVisitors = Math.round(
    last7Days.reduce((sum, d) => sum + d.visitors, 0) / last7Days.length,
  );
  const currentBounces = Math.round(
    last7Days.reduce((sum, d) => sum + d.bounces, 0) / last7Days.length,
  );
  const currentAvgTime = Math.round(
    last7Days.reduce((sum, d) => sum + d.avgTime, 0) / last7Days.length,
  );

  return {
    id: `domain-${index + 1}`,
    domain: domainConfig.domain,
    name: domainConfig.name,
    favicon: `https://www.google.com/s2/favicons?domain=${domainConfig.domain}&sz=32`,

    pageviews: {
      current: currentPageviews,
      previous: Math.round(currentPageviews * (1 - randomChange() / 100)),
      change: randomChange(),
    },
    visits: {
      current: currentVisits,
      previous: Math.round(currentVisits * (1 - randomChange() / 100)),
      change: randomChange(),
    },
    visitors: {
      current: currentVisitors,
      previous: Math.round(currentVisitors * (1 - randomChange() / 100)),
      change: randomChange(),
    },
    bounces: {
      current: currentBounces,
      previous: Math.round(currentBounces * (1 - randomChange() / 100)),
      change: randomChange(),
    },
    avgTime: {
      current: currentAvgTime,
      previous: Math.round(currentAvgTime * (1 - randomChange() / 100)),
      change: randomChange(),
    },

    timeSeries,

    isFavorite: index < 2, // First 2 domains are favorites
    tags: domainConfig.tags,
    realtimeVisitors: randomInt(0, 50),
    lastUpdate: new Date(),
  };
}

/**
 * Generates aggregated metrics from all domains
 */
function generateAggregatedMetrics(domains: DomainMetrics[]) {
  const allTimeSeries: TimeSeriesDataPoint[] = [];

  // Aggregate time series from all domains
  const daysCount = domains[0]?.timeSeries.length || 90;

  for (let i = 0; i < daysCount; i++) {
    const dateStr = domains[0].timeSeries[i].date;

    const aggregated: TimeSeriesDataPoint = {
      date: dateStr,
      pageviews: 0,
      visits: 0,
      visitors: 0,
      bounces: 0,
      avgTime: 0,
    };

    domains.forEach(domain => {
      const point = domain.timeSeries[i];
      aggregated.pageviews += point.pageviews;
      aggregated.visits += point.visits;
      aggregated.visitors += point.visitors;
      aggregated.bounces += point.bounces;
      aggregated.avgTime += point.avgTime;
    });

    // Average for avgTime and bounces
    aggregated.avgTime = Math.round(aggregated.avgTime / domains.length);
    aggregated.bounces = Math.round(aggregated.bounces / domains.length);

    allTimeSeries.push(aggregated);
  }

  // Calculate totals from all days (will be filtered by dateRange later)
  const totalPageviews = allTimeSeries.reduce((sum, d) => sum + d.pageviews, 0);
  const totalVisits = allTimeSeries.reduce((sum, d) => sum + d.visits, 0);
  const totalVisitors = allTimeSeries.reduce((sum, d) => sum + d.visitors, 0);
  const totalBounces = allTimeSeries.reduce((sum, d) => sum + d.bounces, 0);
  const avgTime = Math.round(
    allTimeSeries.reduce((sum, d) => sum + d.avgTime, 0) / allTimeSeries.length,
  );

  const bounceRate = totalVisits > 0 ? (totalBounces / totalVisits) * 100 : 0;

  return {
    pageviews: totalPageviews,
    visits: totalVisits,
    visitors: totalVisitors,
    bounceRate: Math.round(bounceRate * 10) / 10,
    avgTime,
    realtimeTotal: domains.reduce((sum, d) => sum + d.realtimeVisitors, 0),
    timeSeries: allTimeSeries,
  };
}

/**
 * Main function to generate complete dashboard data
 */
export function generateMockData(): DashboardData {
  const domains = SAMPLE_DOMAINS.map((config, index) => generateDomainMetrics(config, index));

  const totals = generateAggregatedMetrics(domains);

  return {
    domains,
    totals,
    availableTags: AVAILABLE_TAGS,
  };
}

/**
 * Get mock data singleton (generates once, reuses on subsequent calls)
 */
let cachedMockData: DashboardData | null = null;

export function getMockData(): DashboardData {
  if (!cachedMockData) {
    cachedMockData = generateMockData();
  }
  return cachedMockData;
}

/**
 * Regenerate mock data (useful for testing with fresh data)
 */
export function regenerateMockData(): DashboardData {
  cachedMockData = generateMockData();
  return cachedMockData;
}
