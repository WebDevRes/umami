import { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { TimeSeriesDataPoint, MetricType } from '@/lib/custom/types';
import styles from './MiniChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Filler,
  Legend,
);

export interface MiniChartProps {
  data: TimeSeriesDataPoint[];
  activeMetrics: MetricType[];
  height?: number;
  className?: string;
}

// Metric color mapping (CSS variables defined in styles)
const METRIC_COLORS: Record<MetricType, { line: string; gradient: string }> = {
  pageviews: { line: 'hsl(210, 100%, 60%)', gradient: 'hsla(210, 100%, 60%, 0.1)' },
  visits: { line: 'hsl(280, 100%, 65%)', gradient: 'hsla(280, 100%, 65%, 0.1)' },
  visitors: { line: 'hsl(25, 100%, 60%)', gradient: 'hsla(25, 100%, 60%, 0.1)' },
  bounces: { line: 'hsl(0, 85%, 60%)', gradient: 'hsla(0, 85%, 60%, 0.1)' },
  avgTime: { line: 'hsl(160, 70%, 50%)', gradient: 'hsla(160, 70%, 50%, 0.1)' },
};

const METRIC_LABELS: Record<MetricType, string> = {
  pageviews: 'Pageviews',
  visits: 'Visits',
  visitors: 'Visitors',
  bounces: 'Bounces',
  avgTime: 'Avg. Time',
};

export function MiniChart({ data, activeMetrics, height = 80, className }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labels = data.map(d => d.date);
    const datasets = activeMetrics.map(metric => {
      const colors = METRIC_COLORS[metric];
      const values = data.map((d, index) => {
        const value = metric === 'avgTime' ? d[metric] / 60 : d[metric];
        // CUSTOM: Return {x, y} format for better Chart.js compatibility
        return { x: index, y: value };
      });

      return {
        label: METRIC_LABELS[metric],
        data: values,
        borderColor: colors.line,
        backgroundColor: colors.gradient,
        borderWidth: 1, // CUSTOM: Thinner line (was 2)
        fill: true,
        tension: 0.4, // Smooth curves
        pointRadius: 0, // CUSTOM: No dots on mini charts (too cluttered for 90 days)
        pointHoverRadius: 4, // Show dot on hover
        pointHoverBackgroundColor: colors.line,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      };
    });

    return { labels, datasets };
  }, [data, activeMetrics]);

  useEffect(() => {
    if (!canvasRef.current || !chartData) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // Disable animations for better performance with 500+ cards
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: false, // Hide x-axis for compact view
            grid: {
              display: false,
            },
          },
          y: {
            display: false, // Hide y-axis for compact view
            grid: {
              display: false,
            },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false, // No legend in mini chart
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 8,
            displayColors: true,
            callbacks: {
              title: tooltipItems => {
                // Format date
                const date = tooltipItems[0]?.label;
                if (!date) return '';
                // CUSTOM: Check if hourly data
                if (date.includes(' ')) {
                  const [dateStr, hour] = date.split(' ');
                  const d = new Date(dateStr);
                  return `${d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} ${hour}`;
                }
                return new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              },
              label: context => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;

                // Format value
                let formatted: string;
                if (label === 'Avg. Time') {
                  // Display minutes
                  formatted = `${value.toFixed(1)} min`;
                } else if (label === 'Bounces') {
                  formatted = `${value.toFixed(1)}%`;
                } else if (value >= 1000) {
                  formatted = `${(value / 1000).toFixed(1)}k`;
                } else {
                  formatted = value.toFixed(0);
                }

                return `${label}: ${formatted}`;
              },
            },
          },
        },
      },
    });

    // Cleanup
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData]);

  if (!data || data.length === 0) {
    return (
      <div className={styles.empty} style={{ height: `${height}px` }}>
        No data
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className={className} />
    </div>
  );
}

export default MiniChart;
