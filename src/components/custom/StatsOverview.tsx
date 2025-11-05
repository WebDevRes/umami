import { useRef, useEffect, useMemo } from 'react';
import { AggregatedMetrics, MetricType } from '@/lib/custom/types';
import styles from './StatsOverview.module.css';

export interface StatsOverviewProps {
  data: AggregatedMetrics;
  activeMetrics: MetricType[];
  height?: number;
}

// Metric color mapping
const METRIC_COLORS: Record<MetricType, { line: string; gradient: string }> = {
  pageviews: { line: 'hsl(210, 100%, 60%)', gradient: 'hsla(210, 100%, 60%, 0.2)' },
  visits: { line: 'hsl(280, 100%, 65%)', gradient: 'hsla(280, 100%, 65%, 0.2)' },
  visitors: { line: 'hsl(25, 100%, 60%)', gradient: 'hsla(25, 100%, 60%, 0.2)' },
  bounces: { line: 'hsl(0, 85%, 60%)', gradient: 'hsla(0, 85%, 60%, 0.2)' },
  avgTime: { line: 'hsl(160, 70%, 50%)', gradient: 'hsla(160, 70%, 50%, 0.2)' },
};

const METRIC_LABELS: Record<MetricType, string> = {
  pageviews: 'Pageviews',
  visits: 'Visits',
  visitors: 'Visitors',
  bounces: 'Bounces',
  avgTime: 'Avg. Time',
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

export function StatsOverview({ data, activeMetrics, height = 250 }: StatsOverviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const chartData = useMemo(() => {
    if (!data.timeSeries || data.timeSeries.length === 0) return null;

    const labels = data.timeSeries.map(d => d.date);
    const datasets = activeMetrics.map(metric => {
      const colors = METRIC_COLORS[metric];
      const values = data.timeSeries.map(d => {
        if (metric === 'avgTime') {
          return d[metric] / 60; // Convert seconds to minutes
        }
        return d[metric];
      });

      return {
        label: METRIC_LABELS[metric],
        data: values,
        borderColor: colors.line,
        backgroundColor: colors.gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colors.line,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      };
    });

    return { labels, datasets };
  }, [data.timeSeries, activeMetrics]);

  useEffect(() => {
    if (!canvasRef.current || !chartData) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Lazy load Chart.js (code splitting)
    let isMounted = true;

    const initChart = async () => {
      const ChartModule = await import('chart.js/auto');
      const ChartJSClass = ChartModule.default;

      if (!isMounted || !canvasRef.current) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new ChartJSClass(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 500,
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              ticks: {
                maxTicksLimit: 8,
                callback: function (value) {
                  const date = this.getLabelForValue(value as number);
                  return new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                },
              },
            },
            y: {
              display: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return formatNumber(value as number);
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                boxWidth: 6,
                boxHeight: 6,
                padding: 15,
              },
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
              padding: 12,
              displayColors: true,
              callbacks: {
                title: tooltipItems => {
                  const date = tooltipItems[0]?.label;
                  if (!date) return '';
                  return new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                },
                label: context => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;

                  let formatted: string;
                  if (label === 'Avg. Time') {
                    formatted = `${value.toFixed(1)} min`;
                  } else if (label === 'Bounces') {
                    formatted = `${value.toFixed(1)}%`;
                  } else {
                    formatted = formatNumber(value);
                  }

                  return `${label}: ${formatted}`;
                },
              },
            },
          },
        },
      });
    };

    initChart();

    return () => {
      isMounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData]);

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.label}>Total Pageviews</div>
          <div className={styles.value}>{formatNumber(data.pageviews)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Total Visits</div>
          <div className={styles.value}>{formatNumber(data.visits)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Total Visitors</div>
          <div className={styles.value}>{formatNumber(data.visitors)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Active Now</div>
          <div className={styles.value}>
            <span className={styles.live}>●</span> {formatNumber(data.realtimeTotal)}
          </div>
        </div>
      </div>
      <div className={styles.chart} style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default StatsOverview;
