import { memo, useCallback } from 'react';
import Icons from '@/components/icons';
import { DomainMetrics, MetricType } from '@/lib/custom/types';
import Favicon from '@/components/common/Favicon';
import MiniChart from './MiniChart';
import styles from './DomainCard.module.css';

export interface DomainCardProps {
  domain: DomainMetrics;
  activeMetrics: MetricType[];
  onFavoriteToggle: (id: string) => void;
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
  onFavoriteToggle,
  onClick,
}: DomainCardProps) {
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
          <Icon className={styles.metricIcon} width={14} height={14} />
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
        <button
          className={`${styles.favoriteBtn} ${domain.isFavorite ? styles.active : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Toggle favorite"
        >
          {domain.isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <MiniChart data={domain.timeSeries} activeMetrics={activeMetrics} height={100} />
      </div>

      {/* Metrics */}
      <div className={styles.metrics}>{activeMetrics.map(renderMetric)}</div>

      {/* Tags */}
      {domain.tags.length > 0 && (
        <div className={styles.tags}>
          {domain.tags.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Realtime indicator */}
      {domain.realtimeVisitors > 0 && (
        <div className={styles.realtime}>
          <span className={styles.realtimeDot}>●</span>
          {domain.realtimeVisitors} active
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders in virtualized grid
export const DomainCard = memo(DomainCardComponent);

export default DomainCard;
