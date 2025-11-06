// Custom Analytics API Integration
// CUSTOM: Real data fetching from Umami API
// Date: 2025-11-06

import { getClientAuthToken } from '@/lib/client';
import type { DomainMetrics, TimeSeriesDataPoint, DashboardData } from './types';

/**
 * Fetch user's teams
 */
async function fetchUserTeams(token: string): Promise<any[]> {
  const response = await fetch('/api/me/teams', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch teams: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch all websites from user's teams and personal websites
 * CUSTOM: Modified to support team websites
 */
export async function fetchUserWebsites(): Promise<any[]> {
  const token = getClientAuthToken();

  // CUSTOM: Debug token availability
  if (!token) {
    // eslint-disable-next-line no-console
    console.error('[Custom Analytics] No auth token found in localStorage');
    throw new Error('Authentication token not found. Please log in again.');
  }

  try {
    // Fetch personal websites
    const personalResponse = await fetch('/api/me/websites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let personalWebsites: any[] = [];
    if (personalResponse.ok) {
      const personalData = await personalResponse.json();
      personalWebsites = personalData.data || [];
    }

    // Fetch teams
    const teams = await fetchUserTeams(token);

    // Fetch websites from all teams
    const teamWebsitesPromises = teams.map(async team => {
      const response = await fetch(`/api/teams/${team.id}/websites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to fetch websites for team ${team.name}`);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    });

    const teamWebsitesArrays = await Promise.all(teamWebsitesPromises);
    const teamWebsites = teamWebsitesArrays.flat();

    // Combine personal and team websites, remove duplicates by id
    const allWebsites = [...personalWebsites, ...teamWebsites];
    const uniqueWebsites = Array.from(
      new Map(allWebsites.map(w => [w.id || w.website_id, w])).values(),
    );

    return uniqueWebsites;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Custom Analytics] Failed to fetch websites:', error);
    throw error;
  }
}

/**
 * Fetch website stats (pageviews, visits, visitors, bounces)
 */
export async function fetchWebsiteStats(
  websiteId: string,
  startAt: number,
  endAt: number,
): Promise<any> {
  const token = getClientAuthToken();
  const url = `/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch stats for ${websiteId}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch website pageviews time series
 */
export async function fetchWebsitePageviews(
  websiteId: string,
  startAt: number,
  endAt: number,
  unit: 'hour' | 'day' = 'day',
): Promise<any> {
  const token = getClientAuthToken();
  const url = `/api/websites/${websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=${unit}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch pageviews for ${websiteId}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Convert Umami stats to DomainMetrics format
 */
function convertStatsToMetrics(
  website: any,
  currentStats: any,
  previousStats: any,
  timeSeries: TimeSeriesDataPoint[],
): DomainMetrics {
  // Calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const pageviewsCurrent = currentStats.pageviews?.value || 0;
  const pageviewsPrevious = previousStats.pageviews?.value || 0;

  const visitsCurrent = currentStats.visits?.value || 0;
  const visitsPrevious = previousStats.visits?.value || 0;

  const visitorsCurrent = currentStats.visitors?.value || 0;
  const visitorsPrevious = previousStats.visitors?.value || 0;

  const bouncesCurrent = currentStats.bounces?.value || 0;
  const bouncesPrevious = previousStats.bounces?.value || 0;

  // Calculate average time from totaltime / visits
  const totalTimeCurrent = currentStats.totaltime?.value || 0;
  const avgTimeCurrent = visitsCurrent > 0 ? Math.round(totalTimeCurrent / visitsCurrent) : 0;

  const totalTimePrevious = previousStats.totaltime?.value || 0;
  const avgTimePrevious = visitsPrevious > 0 ? Math.round(totalTimePrevious / visitsPrevious) : 0;

  return {
    id: website.id,
    domain: website.domain || website.name,
    name: website.name,
    favicon: website.domain
      ? `https://www.google.com/s2/favicons?domain=${website.domain}&sz=32`
      : undefined,

    pageviews: {
      current: pageviewsCurrent,
      previous: pageviewsPrevious,
      change: calculateChange(pageviewsCurrent, pageviewsPrevious),
    },
    visits: {
      current: visitsCurrent,
      previous: visitsPrevious,
      change: calculateChange(visitsCurrent, visitsPrevious),
    },
    visitors: {
      current: visitorsCurrent,
      previous: visitorsPrevious,
      change: calculateChange(visitorsCurrent, visitorsPrevious),
    },
    bounces: {
      current: bouncesCurrent,
      previous: bouncesPrevious,
      change: calculateChange(bouncesCurrent, bouncesPrevious),
    },
    avgTime: {
      current: avgTimeCurrent,
      previous: avgTimePrevious,
      change: calculateChange(avgTimeCurrent, avgTimePrevious),
    },

    timeSeries,

    isFavorite: false, // Will be loaded from localStorage
    tags: [], // Tags disabled for now
    realtimeVisitors: 0, // TODO: Fetch from realtime API
    lastUpdate: new Date(),
  };
}

/**
 * Convert pageviews API response to time series
 */
function convertPageviewsToTimeSeries(pageviewsData: any): TimeSeriesDataPoint[] {
  if (!pageviewsData?.pageviews || !Array.isArray(pageviewsData.pageviews)) {
    return [];
  }

  return pageviewsData.pageviews.map((item: any) => ({
    date: item.t || item.x, // t = timestamp label, x = date string
    pageviews: item.y || 0,
    visits: 0, // Not provided by pageviews endpoint
    visitors: 0,
    bounces: 0,
    avgTime: 0,
  }));
}

/**
 * Fetch complete dashboard data with real API calls
 */
export async function fetchDashboardData(dateRangeDays: number = 7): Promise<DashboardData> {
  try {
    // Calculate date range
    const endAt = Math.floor(Date.now());
    const startAt = endAt - dateRangeDays * 24 * 60 * 60 * 1000;

    // Calculate previous period for comparison
    const previousEndAt = startAt;
    const previousStartAt = previousEndAt - dateRangeDays * 24 * 60 * 60 * 1000;

    // Fetch all websites
    const websites = await fetchUserWebsites();

    // Fetch stats for all websites (parallel)
    const domainsData = await Promise.all(
      websites.map(async website => {
        try {
          // Fetch current period stats
          const currentStats = await fetchWebsiteStats(website.id, startAt, endAt);

          // Fetch previous period stats
          const previousStats = await fetchWebsiteStats(website.id, previousStartAt, previousEndAt);

          // Fetch time series data
          const pageviewsData = await fetchWebsitePageviews(
            website.id,
            startAt,
            endAt,
            dateRangeDays <= 2 ? 'hour' : 'day',
          );
          const timeSeries = convertPageviewsToTimeSeries(pageviewsData);

          // Convert to DomainMetrics format
          return convertStatsToMetrics(website, currentStats, previousStats, timeSeries);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch data for website ${website.id}:`, error);
          // Return minimal data on error
          return {
            id: website.id,
            domain: website.domain || website.name,
            name: website.name,
            favicon: website.domain
              ? `https://www.google.com/s2/favicons?domain=${website.domain}&sz=32`
              : undefined,
            pageviews: { current: 0, previous: 0, change: 0 },
            visits: { current: 0, previous: 0, change: 0 },
            visitors: { current: 0, previous: 0, change: 0 },
            bounces: { current: 0, previous: 0, change: 0 },
            avgTime: { current: 0, previous: 0, change: 0 },
            timeSeries: [],
            isFavorite: false,
            tags: [],
            realtimeVisitors: 0,
            lastUpdate: new Date(),
          } as DomainMetrics;
        }
      }),
    );

    // Calculate aggregated totals
    const totals = {
      pageviews: domainsData.reduce((sum, d) => sum + d.pageviews.current, 0),
      visits: domainsData.reduce((sum, d) => sum + d.visits.current, 0),
      visitors: domainsData.reduce((sum, d) => sum + d.visitors.current, 0),
      bounceRate:
        (domainsData.reduce((sum, d) => sum + d.bounces.current, 0) /
          Math.max(
            domainsData.reduce((sum, d) => sum + d.visits.current, 0),
            1,
          )) *
        100,
      avgTime: Math.round(
        domainsData.reduce((sum, d) => sum + d.avgTime.current, 0) /
          Math.max(domainsData.length, 1),
      ),
      realtimeTotal: 0,
      timeSeries: [], // TODO: Aggregate time series from all domains
    };

    return {
      domains: domainsData,
      totals,
      availableTags: [], // Tags disabled
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
