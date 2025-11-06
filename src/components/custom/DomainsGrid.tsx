import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { DomainMetrics, MetricType } from '@/lib/custom/types';
import DomainCard from './DomainCard';
import styles from './DomainsGrid.module.css';

export interface DomainsGridProps {
  domains: DomainMetrics[];
  favorites: DomainMetrics[];
  activeMetrics: MetricType[];
  availableTags?: string[];
  onFavoriteToggle: (id: string) => void;
  // onTagsChange?: (domainId: string, tags: string[]) => void; // DISABLED: Tags feature disabled
  onDomainClick: (id: string) => void;
}

const CARD_HEIGHT = 192; // 12rem in pixels (updated to match DomainCard height)
const CARD_GAP = 20; // CUSTOM: Increased from 16 to 20 for better spacing
const MIN_CARD_WIDTH = 280;

function getGridDimensions(containerWidth: number) {
  // Calculate how many columns fit
  const columnCount = Math.max(1, Math.floor(containerWidth / (MIN_CARD_WIDTH + CARD_GAP)));
  const columnWidth = Math.floor((containerWidth - CARD_GAP * (columnCount + 1)) / columnCount);

  return { columnCount, columnWidth };
}

export function DomainsGrid({
  domains,
  favorites,
  activeMetrics,
  availableTags,
  onFavoriteToggle,
  // onTagsChange, // DISABLED: Tags feature disabled
  onDomainClick,
}: DomainsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { columnCount, columnWidth } = useMemo(() => {
    return getGridDimensions(containerWidth || 1000);
  }, [containerWidth]);

  const rowCount = Math.ceil(domains.length / columnCount);
  const gridHeight = Math.min(
    typeof window !== 'undefined' ? window.innerHeight - 400 : 600, // Leave space for header and filters
    rowCount * (CARD_HEIGHT + CARD_GAP),
  );

  // Render individual cell (memoized component)
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= domains.length) return null;

      const domain = domains[index];

      return (
        <div
          style={{
            ...style,
            padding: CARD_GAP / 2,
          }}
        >
          <DomainCard
            domain={domain}
            activeMetrics={activeMetrics}
            availableTags={availableTags}
            onFavoriteToggle={onFavoriteToggle}
            // onTagsChange={onTagsChange} // DISABLED: Tags feature disabled
            onClick={onDomainClick}
          />
        </div>
      );
    },
    [
      domains,
      activeMetrics,
      availableTags,
      columnCount,
      onFavoriteToggle,
      // onTagsChange, // DISABLED: Tags feature disabled
      onDomainClick,
    ],
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Favorites section */}
      {favorites.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ Favorites</h2>
          <div
            className={styles.favoritesGrid}
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_CARD_WIDTH}px, 1fr))`,
            }}
          >
            {favorites.map(domain => (
              <DomainCard
                key={domain.id}
                domain={domain}
                activeMetrics={activeMetrics}
                availableTags={availableTags}
                onFavoriteToggle={onFavoriteToggle}
                // onTagsChange={onTagsChange} // DISABLED: Tags feature disabled
                onClick={onDomainClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular domains (virtualized) */}
      {domains.length > 0 && (
        <div className={styles.section}>
          {favorites.length > 0 && <h2 className={styles.sectionTitle}>All Domains</h2>}
          {containerWidth > 0 && (
            <Grid
              className={styles.grid}
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={gridHeight}
              rowCount={rowCount}
              rowHeight={CARD_HEIGHT + CARD_GAP}
              width={containerWidth}
            >
              {Cell}
            </Grid>
          )}
        </div>
      )}

      {/* Empty state */}
      {domains.length === 0 && favorites.length === 0 && (
        <div className={styles.empty}>
          <p>No domains found</p>
          <p className={styles.emptyHint}>Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}

export default DomainsGrid;
