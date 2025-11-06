'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/custom/FilterBar';
import StatsOverview from '@/components/custom/StatsOverview';
import TagsSection from '@/components/custom/TagsSection';
import DomainsGrid from '@/components/custom/DomainsGrid';
import { generateMockData } from '@/lib/custom/mockData';
import {
  filterAndSortDomains,
  calculateAggregatedMetrics,
  recalculateDomainMetricsForDateRange,
} from '@/lib/custom/utils';
import type { DomainMetrics, MetricType, FilterState, DashboardData } from '@/lib/custom/types';
import styles from './CustomAnalyticsPage.module.css';

export function CustomAnalyticsPage() {
  // Generate mock data (500+ domains)
  const mockData = useMemo<DashboardData>(() => generateMockData(), []);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    dateRange: '28d',
    searchQuery: '',
    sortBy: 'visitors_desc',
    selectedTags: [],
    activeMetrics: ['pageviews', 'visits', 'visitors'],
  });

  // Tag manager state
  const [availableTags, setAvailableTags] = useState<string[]>(mockData.availableTags);

  // Domain management state (for favorites and tags)
  const [domains, setDomains] = useState<DomainMetrics[]>(mockData.domains);

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
    setDomains(prev =>
      prev.map(d => (d.id === domainId ? { ...d, isFavorite: !d.isFavorite } : d)),
    );
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

  // Handler: Tag toggle
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

  // Handler: Clear tags
  const handleClearTags = useCallback(() => {
    handleFilterChange({ selectedTags: [] });
  }, [handleFilterChange]);

  // Handler: Create tag
  const handleCreateTag = useCallback((tag: string) => {
    setAvailableTags(prev => [...prev, tag]);
  }, []);

  // Handler: Delete tag
  const handleDeleteTag = useCallback((tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
    setDomains(prev => prev.map(d => ({ ...d, tags: d.tags.filter(t => t !== tag) })));
  }, []);

  // Handler: Update domain tags
  const handleDomainTagsChange = useCallback((domainId: string, tags: string[]) => {
    setDomains(prev => prev.map(d => (d.id === domainId ? { ...d, tags } : d)));
  }, []);

  // Handler: Export data
  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    // eslint-disable-next-line no-console
    console.log('Export clicked', { filteredDomains, filterState });
  }, [filteredDomains, filterState]);

  // Handler: Navigate to domain details
  const handleDomainClick = useCallback((domainId: string) => {
    // TODO: Navigate to /websites/{websiteId}
    // eslint-disable-next-line no-console
    console.log('Navigate to domain:', domainId);
  }, []);

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

        {/* Tags Section (replaces MetricToggle position) */}
        <TagsSection
          availableTags={availableTags}
          selectedTags={filterState.selectedTags}
          onTagToggle={handleTagToggle}
          onClearTags={handleClearTags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
        />

        {/* Domains Grid */}
        <DomainsGrid
          domains={regularDomains}
          favorites={favoriteDomains}
          activeMetrics={filterState.activeMetrics}
          availableTags={availableTags}
          onFavoriteToggle={handleToggleFavorite}
          onTagsChange={handleDomainTagsChange}
          onDomainClick={handleDomainClick}
        />
      </div>
    </div>
  );
}

export default CustomAnalyticsPage;
