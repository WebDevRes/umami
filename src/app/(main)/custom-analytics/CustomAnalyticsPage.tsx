'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/custom/FilterBar';
import StatsOverview from '@/components/custom/StatsOverview';
// DISABLED: Tags functionality (commented out for now)
// import TagsSection from '@/components/custom/TagsSection';
import DomainsGrid from '@/components/custom/DomainsGrid';
// DISABLED: Mock data - replaced with real API
// import { generateMockData } from '@/lib/custom/mockData';
import { fetchDashboardData } from '@/lib/custom/api';
import {
  filterAndSortDomains,
  calculateAggregatedMetrics,
  recalculateDomainMetricsForDateRange,
  getDateRangeDays,
} from '@/lib/custom/utils';
import type { DomainMetrics, MetricType, FilterState } from '@/lib/custom/types';
import styles from './CustomAnalyticsPage.module.css';

// DISABLED: Tags storage
// const STORAGE_KEY_TAGS = 'custom-analytics-tags';
const STORAGE_KEY_FAVORITES = 'custom-analytics-favorites';

export function CustomAnalyticsPage() {
  const router = useRouter();

  // Loading and error state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    dateRange: '7d',
    searchQuery: '',
    sortBy: 'visitors_desc',
    selectedTags: [], // DISABLED: Tags not used
    activeMetrics: ['pageviews', 'visits', 'visitors'],
  });

  // DISABLED: Tag manager state
  // const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Domain data state - fetched from API
  const [domains, setDomains] = useState<DomainMetrics[]>([]);

  // Favorites state - load from localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...favorites]));
    }
  }, [favorites]);

  // Fetch real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dateRangeDays = getDateRangeDays(filterState.dateRange);
        const dashboardData = await fetchDashboardData(dateRangeDays);

        // Apply favorites from localStorage
        const domainsWithFavorites = dashboardData.domains.map(domain => ({
          ...domain,
          isFavorite: favorites.has(domain.id),
        }));

        setDomains(domainsWithFavorites);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState.dateRange]); // Reload when date range changes

  // Update favorites in domains when favorites set changes
  useEffect(() => {
    setDomains(prev => prev.map(d => ({ ...d, isFavorite: favorites.has(d.id) })));
  }, [favorites]);

  // Recalculate domain metrics based on selected date range, then filter and sort
  const filteredDomains = useMemo(() => {
    // First, recalculate metrics for each domain based on dateRange
    const recalculatedDomains = domains.map(domain =>
      recalculateDomainMetricsForDateRange(domain, filterState.dateRange),
    );

    // Then apply filters and sorting
    return filterAndSortDomains(recalculatedDomains, filterState);
  }, [domains, filterState]);

  // Separate favorites and regular domains
  const favoriteDomains = useMemo(() => {
    return filteredDomains.filter(d => d.isFavorite);
  }, [filteredDomains]);

  const regularDomains = useMemo(() => {
    return filteredDomains.filter(d => !d.isFavorite);
  }, [filteredDomains]);

  // Recalculate aggregated metrics based on filtered domains and date range
  const aggregatedMetrics = useMemo(() => {
    return calculateAggregatedMetrics(filteredDomains, filterState.dateRange);
  }, [filteredDomains, filterState.dateRange]);

  // Handler: Update filter state (must be declared first as other handlers depend on it)
  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handler: Toggle favorite
  const handleToggleFavorite = useCallback((domainId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(domainId)) {
        newFavorites.delete(domainId);
      } else {
        newFavorites.add(domainId);
      }
      return newFavorites;
    });
  }, []);

  // Handler: Toggle single metric
  const handleMetricToggle = useCallback((metric: MetricType) => {
    setFilterState(prev => {
      const isActive = prev.activeMetrics.includes(metric);
      if (isActive) {
        // Don't allow removing all metrics - at least one must be active
        if (prev.activeMetrics.length === 1) return prev;
        return { ...prev, activeMetrics: prev.activeMetrics.filter(m => m !== metric) };
      } else {
        return { ...prev, activeMetrics: [...prev.activeMetrics, metric] };
      }
    });
  }, []);

  // DISABLED: Tag handlers (commented out)
  /*
  const handleTagToggle = useCallback(
    (tag: string) => {
      const isSelected = filterState.selectedTags.includes(tag);
      const newTags = isSelected
        ? filterState.selectedTags.filter(t => t !== tag)
        : [...filterState.selectedTags, tag];
      handleFilterChange({ selectedTags: newTags });
    },
    [filterState.selectedTags, handleFilterChange],
  );

  const handleClearTags = useCallback(() => {
    handleFilterChange({ selectedTags: [] });
  }, [handleFilterChange]);

  const handleCreateTag = useCallback((tag: string) => {
    setAvailableTags(prev => [...prev, tag]);
  }, []);

  const handleDeleteTag = useCallback((tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
    setDomains(prev => prev.map(d => ({ ...d, tags: d.tags.filter(t => t !== tag) })));
  }, []);

  const handleDomainTagsChange = useCallback((domainId: string, tags: string[]) => {
    setDomains(prev => prev.map(d => (d.id === domainId ? { ...d, tags } : d)));
  }, []);
  */

  // Handler: Export data
  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    // eslint-disable-next-line no-console
    console.log('Export clicked', { filteredDomains, filterState });
  }, [filteredDomains, filterState]);

  // Handler: Navigate to domain details
  const handleDomainClick = useCallback(
    (domainId: string) => {
      router.push(`/websites/${domainId}`);
    },
    [router],
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <PageHeader title="Custom Analytics" />
        <div className={styles.content}>
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.container}>
        <PageHeader title="Custom Analytics" />
        <div className={styles.content}>
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Custom Analytics" />

      <div className={styles.content}>
        {/* Filter Bar (without tags) */}
        <FilterBar
          filters={filterState}
          onFiltersChange={handleFilterChange}
          onExport={handleExport}
        />

        {/* Aggregated Stats Overview (with clickable metric cards) */}
        <StatsOverview
          data={aggregatedMetrics}
          activeMetrics={filterState.activeMetrics}
          onMetricToggle={handleMetricToggle}
        />

        {/* DISABLED: Tags Section */}
        {/*
        <TagsSection
          availableTags={availableTags}
          selectedTags={filterState.selectedTags}
          onTagToggle={handleTagToggle}
          onClearTags={handleClearTags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
        />
        */}

        {/* Domains Grid */}
        <DomainsGrid
          domains={regularDomains}
          favorites={favoriteDomains}
          activeMetrics={filterState.activeMetrics}
          availableTags={[]} // DISABLED: Empty tags array
          onFavoriteToggle={handleToggleFavorite}
          onTagsChange={() => {}} // DISABLED: No-op handler
          onDomainClick={handleDomainClick}
        />
      </div>
    </div>
  );
}

export default CustomAnalyticsPage;
