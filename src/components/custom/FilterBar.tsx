import { useState, useEffect } from 'react';
import { Icons } from 'react-basics';
import Icons2 from '@/components/icons';
import { FilterState } from '@/lib/custom/types';
import { useDebounce } from '@/lib/custom/hooks';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onExport?: () => void;
}

const DATE_RANGES = [
  { value: '7d', label: '7 days' },
  { value: '28d', label: '28 days' },
  { value: '90d', label: '90 days' },
  { value: 'custom', label: 'Custom' },
] as const;

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'A to Z' },
  { value: 'name_desc', label: 'Z to A' },
  { value: 'visitors_desc', label: 'Most Visitors' },
  { value: 'visitors_asc', label: 'Least Visitors' },
  { value: 'pageviews_desc', label: 'Most Pageviews' },
] as const;

export function FilterBar({ filters, onFiltersChange, onExport }: FilterBarProps) {
  // Local state for immediate UI feedback
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Debounced search value to reduce re-renders
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update parent state only when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.searchQuery) {
      onFiltersChange({ searchQuery: debouncedSearch });
    }
  }, [debouncedSearch, filters.searchQuery, onFiltersChange]);

  // Sync local state when external filter changes (e.g., clear button)
  useEffect(() => {
    if (filters.searchQuery !== searchInput) {
      setSearchInput(filters.searchQuery);
    }
  }, [filters.searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onFiltersChange({ searchQuery: '' });
  };

  return (
    <div className={styles.container}>
      {/* Top row: main controls */}
      <div className={styles.topRow}>
        {/* Date range */}
        <select
          className={styles.select}
          value={filters.dateRange}
          onChange={e => onFiltersChange({ dateRange: e.target.value as FilterState['dateRange'] })}
        >
          {DATE_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className={styles.search}>
          <Icons.Search width={16} height={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchInput}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchInput && (
            <button
              className={styles.clearBtn}
              onClick={handleSearchClear}
              aria-label="Clear search"
            >
              <Icons.Close width={14} height={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          className={styles.select}
          value={filters.sortBy}
          onChange={e => onFiltersChange({ sortBy: e.target.value as FilterState['sortBy'] })}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Export button */}
        {onExport && (
          <button className={styles.button} onClick={onExport} title="Export data">
            <Icons2.Export width={16} height={16} />
            <span>Export</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
