import { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import Icons from '@/components/icons';
import { DomainMetrics, MetricType } from '@/lib/custom/types';
import Favicon from '@/components/common/Favicon';
import MiniChart from './MiniChart';
import styles from './DomainCard.module.css';

export interface DomainCardProps {
  domain: DomainMetrics;
  activeMetrics: MetricType[];
  availableTags?: string[];
  onFavoriteToggle: (id: string) => void;
  onTagsChange?: (domainId: string, tags: string[]) => void;
  onClick: (id: string) => void;
}

const METRIC_ICONS: Record<MetricType, string> = {
  pageviews: 'Eye', // Using Eye icon as proxy for pageviews
  visits: 'Visitor',
  visitors: 'User',
  bounces: 'Change', // Using Change icon as proxy for bounces
  avgTime: 'Clock',
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toFixed(0);
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function DomainCardComponent({
  domain,
  activeMetrics,
  availableTags = [],
  onFavoriteToggle,
  onTagsChange,
  onClick,
}: DomainCardProps) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const tagMenuRef = useRef<HTMLDivElement>(null);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFavoriteToggle(domain.id);
    },
    [domain.id, onFavoriteToggle],
  );

  const handleCardClick = useCallback(() => {
    onClick(domain.id);
  }, [domain.id, onClick]);

  const handleTagButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagMenu(prev => !prev);
  }, []);

  const handleTagToggle = useCallback(
    (tag: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onTagsChange) return;

      const newTags = domain.tags.includes(tag)
        ? domain.tags.filter(t => t !== tag)
        : [...domain.tags, tag];

      onTagsChange(domain.id, newTags);
    },
    [domain.id, domain.tags, onTagsChange],
  );

  // Close tag menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(event.target as Node)) {
        setShowTagMenu(false);
      }
    };

    if (showTagMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTagMenu]);

  const renderMetric = useCallback(
    (metric: MetricType) => {
      const value = domain[metric];
      const Icon = Icons[METRIC_ICONS[metric]];

      // Format value based on metric type
      let displayValue: string;
      if (metric === 'avgTime') {
        displayValue = formatTime(value.current);
      } else if (metric === 'bounces') {
        displayValue = `${value.current.toFixed(1)}%`;
      } else {
        displayValue = formatNumber(value.current);
      }

      // Change indicator
      const changeIcon = value.change > 0 ? '↑' : value.change < 0 ? '↓' : '';
      const changeClass =
        value.change > 0 ? styles.positive : value.change < 0 ? styles.negative : styles.neutral;

      return (
        <div key={metric} className={styles.metric}>
          <Icon className={`${styles.metricIcon} ${styles[metric]}`} width={14} height={14} />
          <span className={styles.metricValue}>{displayValue}</span>
          {value.change !== 0 && (
            <span className={`${styles.change} ${changeClass}`}>
              {changeIcon}
              {Math.abs(value.change).toFixed(0)}%
            </span>
          )}
        </div>
      );
    },
    [domain],
  );

  // Sort tags: active first, then inactive
  const sortedTags = useMemo(() => {
    const activeTags = availableTags.filter(tag => domain.tags.includes(tag));
    const inactiveTags = availableTags.filter(tag => !domain.tags.includes(tag));
    return [...activeTags, ...inactiveTags];
  }, [availableTags, domain.tags]);

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.domainInfo}>
          <Favicon domain={domain.domain} />
          <span className={styles.domainName} title={domain.domain}>
            {domain.name || domain.domain}
          </span>
        </div>
        <div className={styles.headerActions}>
          {availableTags.length > 0 && onTagsChange && (
            <div className={styles.tagMenuContainer} ref={tagMenuRef}>
              <button
                className={`${styles.tagBtn} ${domain.tags.length === 0 ? styles.tagBtnEmpty : ''}`}
                onClick={handleTagButtonClick}
                aria-label="Manage tags"
                title={
                  domain.tags.length === 0 ? 'No tags assigned' : `${domain.tags.length} tag(s)`
                }
              >
                🏷️
              </button>
              {showTagMenu && (
                <div className={styles.tagMenu}>
                  <div className={styles.tagMenuHeader}>Assign Tags</div>
                  <div className={styles.tagMenuList}>
                    {sortedTags.map(tag => (
                      <label key={tag} className={styles.tagMenuItem}>
                        <input
                          type="checkbox"
                          checked={domain.tags.includes(tag)}
                          onChange={e => handleTagToggle(tag, e as any)}
                          onClick={e => e.stopPropagation()}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            className={`${styles.favoriteBtn} ${domain.isFavorite ? styles.active : ''}`}
            onClick={handleFavoriteClick}
            aria-label="Toggle favorite"
          >
            {domain.isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <MiniChart data={domain.timeSeries} activeMetrics={activeMetrics} height={100} />
      </div>

      {/* Metrics */}
      <div className={styles.metrics}>{activeMetrics.map(renderMetric)}</div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders in virtualized grid
export const DomainCard = memo(DomainCardComponent);

export default DomainCard;
