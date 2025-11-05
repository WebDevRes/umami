'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import FilterBar from '@/components/custom/FilterBar';
import MetricToggle from '@/components/custom/MetricToggle';
import StatsOverview from '@/components/custom/StatsOverview';
import DomainsGrid from '@/components/custom/DomainsGrid';
import TagManager from '@/components/custom/TagManager';
import { generateMockData } from '@/lib/custom/mockData';
import { filterAndSortDomains, calculateAggregatedMetrics } from '@/lib/custom/utils';
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

  // Filter and sort domains
  const filteredDomains = useMemo(() => {
    return filterAndSortDomains(domains, filterState);
  }, [domains, filterState]);

  // Separate favorites and regular domains
  const favoriteDomains = useMemo(() => {
    return filteredDomains.filter(d => d.isFavorite);
  }, [filteredDomains]);

  const regularDomains = useMemo(() => {
    return filteredDomains.filter(d => !d.isFavorite);
  }, [filteredDomains]);

  // Recalculate aggregated metrics based on filtered domains
  const aggregatedMetrics = useMemo(() => {
    return calculateAggregatedMetrics(filteredDomains);
  }, [filteredDomains]);

  // Handler: Toggle favorite
  const handleToggleFavorite = useCallback((domainId: string) => {
    setDomains(prev =>
      prev.map(d => (d.id === domainId ? { ...d, isFavorite: !d.isFavorite } : d)),
    );
  }, []);

  // Handler: Update active metrics
  const handleMetricsChange = useCallback((metrics: MetricType[]) => {
    setFilterState(prev => ({ ...prev, activeMetrics: metrics }));
  }, []);

  // Handler: Update filter state
  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

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
        {/* Filter Bar */}
        <FilterBar
          filters={filterState}
          availableTags={availableTags}
          onFiltersChange={handleFilterChange}
          onExport={handleExport}
        />

        {/* Aggregated Stats Overview */}
        <StatsOverview data={aggregatedMetrics} activeMetrics={filterState.activeMetrics} />

        {/* Metric Toggle */}
        <MetricToggle activeMetrics={filterState.activeMetrics} onChange={handleMetricsChange} />

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

        {/* Tag Manager */}
        <TagManager
          availableTags={availableTags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
        />
      </div>
    </div>
  );
}

export default CustomAnalyticsPage;
