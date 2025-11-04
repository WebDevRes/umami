import { useRef, useEffect, useMemo } from 'react';
import ChartJS from 'chart.js/auto';
import { TimeSeriesDataPoint, MetricType } from '@/lib/custom/types';
import styles from './MiniChart.module.css';

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
  const chartRef = useRef<ChartJS | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labels = data.map(d => d.date);
    const datasets = activeMetrics.map(metric => {
      const colors = METRIC_COLORS[metric];
      const values = data.map(d => {
        if (metric === 'avgTime') {
          return d[metric] / 60; // Convert seconds to minutes for display
        }
        return d[metric];
      });

      return {
        label: METRIC_LABELS[metric],
        data: values,
        borderColor: colors.line,
        backgroundColor: colors.gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth curves
        pointRadius: 0, // No dots on line
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
          duration: 300,
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
