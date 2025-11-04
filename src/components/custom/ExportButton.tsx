import { DomainMetrics, MetricType } from '@/lib/custom/types';

export interface ExportButtonProps {
  domains: DomainMetrics[];
  activeMetrics: MetricType[];
  dateRange: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function generateCSV(domains: DomainMetrics[], activeMetrics: MetricType[]): string {
  // Header row
  const headers = ['Domain', 'Name'];

  activeMetrics.forEach(metric => {
    const label =
      metric === 'pageviews'
        ? 'Pageviews'
        : metric === 'visits'
        ? 'Visits'
        : metric === 'visitors'
        ? 'Visitors'
        : metric === 'bounces'
        ? 'Bounces (%)'
        : 'Avg. Time';

    headers.push(label, `${label} Change (%)`, `${label} Previous`);
  });

  headers.push('Tags', 'Favorite', 'Realtime Visitors');

  const rows = [headers];

  // Data rows
  domains.forEach(domain => {
    const row: string[] = [domain.domain, domain.name];

    activeMetrics.forEach(metric => {
      const value = domain[metric];
      let current: string;

      if (metric === 'avgTime') {
        current = formatTime(value.current);
      } else if (metric === 'bounces') {
        current = value.current.toFixed(1);
      } else {
        current = value.current.toString();
      }

      row.push(current, value.change.toFixed(1), value.previous.toString());
    });

    row.push(
      domain.tags.join('; '),
      domain.isFavorite ? 'Yes' : 'No',
      domain.realtimeVisitors.toString(),
    );

    rows.push(row);
  });

  // Convert to CSV
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export function exportToCSV(
  domains: DomainMetrics[],
  activeMetrics: MetricType[],
  dateRange: string,
) {
  const csv = generateCSV(domains, activeMetrics);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `umami-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// This is a utility function, not a component
// It's used by FilterBar's onExport callback
export default exportToCSV;
