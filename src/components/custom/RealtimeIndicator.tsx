import styles from './RealtimeIndicator.module.css';

export interface RealtimeIndicatorProps {
  count: number;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function RealtimeIndicator({ count }: RealtimeIndicatorProps) {
  if (count === 0) return null;

  return (
    <div className={styles.container} title={`${count} active visitors`}>
      <span className={styles.dot}>●</span>
      <span className={styles.count}>{formatNumber(count)}</span>
    </div>
  );
}

export default RealtimeIndicator;
