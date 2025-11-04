import { Icons } from 'react-basics';
import { MetricType } from '@/lib/custom/types';
import styles from './MetricToggle.module.css';

export interface MetricToggleProps {
  activeMetrics: MetricType[];
  onChange: (metrics: MetricType[]) => void;
}

interface MetricConfig {
  key: MetricType;
  label: string;
  icon: keyof typeof Icons;
}

const METRICS: MetricConfig[] = [
  { key: 'pageviews', label: 'Pageviews', icon: 'Eye' },
  { key: 'visits', label: 'Visits', icon: 'Visitor' },
  { key: 'visitors', label: 'Visitors', icon: 'User' },
  { key: 'bounces', label: 'Bounces', icon: 'Change' },
  { key: 'avgTime', label: 'Avg. Time', icon: 'Clock' },
];

export function MetricToggle({ activeMetrics, onChange }: MetricToggleProps) {
  const handleToggle = (metricKey: MetricType) => {
    const isActive = activeMetrics.includes(metricKey);

    if (isActive) {
      // Don't allow removing all metrics - at least one must be active
      if (activeMetrics.length === 1) return;
      onChange(activeMetrics.filter(m => m !== metricKey));
    } else {
      onChange([...activeMetrics, metricKey]);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Metrics:</span>
      <div className={styles.buttons}>
        {METRICS.map(metric => {
          const Icon = Icons[metric.icon];
          const isActive = activeMetrics.includes(metric.key);

          return (
            <button
              key={metric.key}
              className={`${styles.button} ${isActive ? styles.active : ''}`}
              onClick={() => handleToggle(metric.key)}
              title={metric.label}
              aria-label={`Toggle ${metric.label}`}
              aria-pressed={isActive}
            >
              <Icon width={16} height={16} />
              <span className={styles.buttonLabel}>{metric.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MetricToggle;
