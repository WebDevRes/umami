# Customizations Log

Track all fork modifications for conflict resolution during `git pull upstream master`

## Git Setup
```bash
origin   → https://github.com/WebDevRes/umami
upstream → https://github.com/umami-software/umami
```

---

## Change Log

### 2025-11-04 - Initial Setup
**Files:**
- `CLAUDE.md` - AI rules & architecture
- `CUSTOMIZATIONS.md` - This file
- `FORK-README.md` - Fork docs
- `GIT-WORKFLOW.md` - Git cheatsheet
- `.env.example` - Env template
- `.gitignore:42` - Added `!.env.example`

**Merge Strategy:**
- New files → no conflicts expected
- `.gitignore` → keep both (upstream + line 42)

---

## Adding New Customizations

```markdown
### YYYY-MM-DD - Feature Name
**Files:** path/to/file.ts - description
**Changes:** what & why
**Merge Strategy:** conflict handling
```

Mark custom code:
```typescript
// CUSTOM: reason
code...
// END CUSTOM
```

## Custom Features

### Custom Analytics Interface (Phase 1-4) ✅
**Date:** 2025-01-04
**Status:** Phase 1-4 Complete - Foundation, Components, and Styling ready

**Files Added:**

**Phase 1 - Mock Data Foundation:**
- `src/lib/custom/types.ts` - TypeScript type definitions
- `src/lib/custom/mockData.ts` - Mock data generator (10 domains)
- `src/lib/custom/utils.ts` - Utility functions (formatting, filtering, sorting)
- `src/lib/custom/__tests__/mockData.test.ts` - Unit tests (8/8 passing)
- `src/lib/custom/IMPLEMENTATION_PLAN.md` - Comprehensive implementation guide

**Phase 2-3 - UI Components:**
- `src/components/custom/MiniChart.tsx` - Mini Chart.js line charts for cards
- `src/components/custom/StatsOverview.tsx` - Aggregated stats with large chart
- `src/components/custom/DomainCard.tsx` - Compact domain cards (154px height)
- `src/components/custom/MetricToggle.tsx` - Toggle buttons for metrics
- `src/components/custom/FilterBar.tsx` - Search, sort, date range filters
- `src/components/custom/RealtimeIndicator.tsx` - Live visitor count indicator
- `src/components/custom/DomainsGrid.tsx` - Virtualized grid layout
- `src/components/custom/TagManager.tsx` - Tag creation and management
- `src/components/custom/ExportButton.tsx` - CSV/Excel export functionality

**Phase 4 - Styling (SEOgets-inspired):**
- `src/components/custom/*.module.css` - CSS Modules for all components (9 files)
- `src/styles/variables.css` - Added custom metrics color variables
  - `--metric-pageviews` (blue), `--metric-visits` (purple), `--metric-visitors` (orange)
  - `--metric-bounces` (red), `--metric-avgtime` (teal)
  - `--change-positive/negative/neutral` for change indicators
  - Full dark mode support via `[data-theme='dark']`

**Files Modified:**
- `src/styles/variables.css:7-31` - Added custom CSS variables for metrics colors and change indicators
- `src/app/(main)/NavBar.tsx:23-30,32-41` - Added Custom Analytics link to navigation (desktop + mobile)
- `public/intl/messages/en-US.json:254-259` - Added "label.custom-analytics" translation

**Purpose:**
Foundation for custom analytics dashboard with improved UX. Clean, compact design inspired by SEOgets. Isolated implementation for minimal merge conflicts.

**Design System:**
- CSS Modules with scoped styles
- CSS variables for consistent theming
- Dark mode support (automatic via existing theme system)
- Responsive design (4/3/2/1 columns)
- Smooth transitions and hover effects
- Card height: 154px (fixed for virtualization)
- Chart height: 80px max

**Merge Strategy:**
- All new files in `src/lib/custom/` and `src/components/custom/` subdirectories
- Minimal modification to core files (only `src/styles/variables.css`)
- Can be removed without affecting upstream code
- Variables in `variables.css` isolated in CUSTOM comment blocks

**Phase 5 - Performance & Optimization:** ✅
- `src/lib/custom/hooks.ts` - Custom React hooks for optimization
  - `useDebounce<T>` - Debounce hook for search input (300ms)
  - `usePersistedMetrics` - LocalStorage hook for active metrics
  - `usePersistedDateRange` - LocalStorage hook for date range
  - `usePersistedSort` - LocalStorage hook for sort option
  - `usePersistedFavorites` - LocalStorage hook for favorites
  - `useWindowSize` - Window dimensions hook
  - `useThrottle<T>` - Throttle hook for scroll/resize events

- Updated `src/lib/custom/utils.ts`:
  - Added localStorage utility with error handling
  - Storage keys constants (STORAGE_KEYS)
  - SSR-safe (typeof window check)

**Performance Optimizations:**
1. **Component Memoization:**
   - `DomainCard.tsx` - Memoized with React.memo + useCallback
   - `DomainsGrid.tsx` - Memoized Cell component + cellData
   - Prevents unnecessary re-renders in virtualized grid

2. **Chart Performance:**
   - `MiniChart.tsx` - Disabled animations (duration: 0) for 500+ cards
   - Added Chart.js options: `parsing: false`, `normalized: true`
   - Lazy loading with dynamic import (code splitting)
   - Canvas-based rendering (better than SVG for large datasets)

3. **Search Optimization:**
   - `FilterBar.tsx` - Debounced search input (300ms delay)
   - Local state for immediate UI feedback
   - Reduced re-renders during typing

4. **State Optimization:**
   - useMemo for filtered/sorted data
   - useCallback for event handlers
   - LocalStorage for user preferences persistence

5. **Bundle Optimization:**
   - Code splitting for Chart.js (lazy import)
   - Tree shaking for unused utilities
   - Dynamic imports in useEffect

**Phase 6 - Main Page Integration:** ✅
- `src/app/(main)/custom-analytics/page.tsx` - Next.js route with metadata
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx` - Main page component
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.module.css` - Page-level styles

**Main Page Features:**
1. **State Management:**
   - FilterState (date range, search, sort, tags, active metrics)
   - Domain state (favorites, tags)
   - Aggregated metrics calculation (dynamic based on filters)
   - Tag management (create, delete, assign)

2. **Component Integration:**
   - FilterBar → StatsOverview → MetricToggle → DomainsGrid → TagManager
   - Props correctly mapped to component interfaces
   - Callbacks for all user interactions
   - Virtualized grid with favorites section

3. **Data Flow:**
   - Mock data generation (generateMockData())
   - Filter and sort (filterAndSortDomains())
   - Aggregated metrics (calculateAggregatedMetrics())
   - Separate favorites from regular domains
   - Real-time recalculation on state changes

4. **User Interactions:**
   - Toggle favorites (persists in state)
   - Search domains (debounced input)
   - Sort by name/visitors/pageviews
   - Filter by tags (multi-select)
   - Change date range (7d/28d/90d/custom)
   - Toggle metrics visibility (3 active by default)
   - Export data (CSV - TODO)
   - Navigate to domain details (TODO)

**Route Access:**
- URL: `/custom-analytics`
- Page Title: "Custom Analytics"
- Client Component (high interactivity)

**Updated Utility Functions:**
- `src/lib/custom/utils.ts:338-416` - Added filterAndSortDomains() and calculateAggregatedMetrics()

**Next Steps:**
- Phase 7: Testing and polish
- Phase 8: Real API integration

## Known Issues

### 2025-11-05 - Chart.js Data Format Fix ✅ RESOLVED
**Files:**
- `src/components/custom/MiniChart.tsx:1-28` - Added `LineController` import and registration
- `src/components/custom/MiniChart.tsx:64-67` - Changed data format to `{x, y}` objects
- `src/components/custom/MiniChart.tsx:114` - Removed `parsing: false` option

**Issue:**
1. Error "line" is not a registered controller in Chart.js
2. Charts rendering but empty (no data displayed)

**Root Cause:**
- Missing LineController registration
- Data format incompatibility: `parsing: false` requires `{x, y}` format, but we passed plain arrays

**Fix:**
1. Added `LineController` to Chart.js imports and registration
2. Changed dataset values to `{x: index, y: value}` format for better compatibility
3. Removed conflicting `parsing: false` option

**Status:** ✅ Fixed - Build successful, application running, charts displaying data correctly

---

### 2025-11-05 - UI Spacing & Typography Fix ✅ RESOLVED
**Files:**
- `src/components/custom/DomainCard.module.css:79-109` - Reduced font sizes and gaps
- `src/components/custom/DomainsGrid.module.css:19` - Increased grid gap from 16px to 20px
- `src/components/custom/DomainsGrid.tsx:15-16` - Updated CARD_HEIGHT to 192px and CARD_GAP to 20px

**Issue:**
1. Cards appearing too close together (touching)
2. Metric text overflowing/not fitting properly

**Fix:**
1. **Grid spacing:** Increased gap between cards from 16px to 20px
2. **Typography:**
   - Reduced metric font size from 12px to 11px
   - Reduced change indicator from 11px to 10px
   - Reduced gaps between metric elements (8px → 6px, 4px → 3px)
3. **Layout:** Fixed metric icon size to 12x12px for consistency
4. **Card height:** Updated constant from 154px to 192px (matches CSS 12rem)

**Status:** ✅ Fixed - Better spacing, text fits properly, cleaner layout

---

### 2025-11-05 - UX Improvement: Clickable Metric Cards & Relocated Tags ✅ COMPLETE
**Files Added:**
- `src/components/custom/TagsSection.tsx` - New component combining tags and Tag Manager
- `src/components/custom/TagsSection.module.css` - Styling for tags section

**Files Modified:**
- `src/components/custom/StatsOverview.tsx:5-10,39-44,210-267` - Made metric cards clickable/toggleable
  - Added `onMetricToggle` prop
  - Converted stat divs to buttons with active states
  - Added 5th card for Total Bounces and Avg. Time
- `src/components/custom/StatsOverview.module.css:21-46` - Added button styles for clickable cards
  - `.statButton` - Base button styling with hover effects
  - `.statActive` - Active state with primary color border
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx:4-6,58-87,129-148` - Updated page layout
  - Removed `MetricToggle` and `TagManager` components
  - Added `TagsSection` component
  - Replaced `handleMetricsChange` with `handleMetricToggle`
  - Added `handleTagToggle` and `handleClearTags` handlers
- `src/components/custom/FilterBar.tsx:8-12,29,54-121` - Removed tags from filter bar
  - Removed `availableTags` prop
  - Removed tag toggle/clear handlers
  - Removed tags bottom row UI
- `src/components/custom/TagManager.tsx:6-11,13-14,51-54` - Added modal mode support
  - Added optional `onClose` prop for modal usage
  - Auto-open when `onClose` is provided
  - Updated close handler to use `onClose` callback

**Purpose:**
Improved UX by making metric cards interactive toggle buttons (replacing bottom metrics bar) and relocating tags section below the chart with integrated Tag Manager button.

**New Layout:**
1. Filter Bar (date, search, sort, export)
2. **Clickable Metric Cards** (5 cards: Pageviews, Visits, Visitors, Bounces, Avg. Time)
3. Large Chart (showing active metrics)
4. **Tags Section** (tags + Manage Tags button) - replaces old MetricToggle position
5. Domains Grid

**Design Benefits:**
- Cleaner, more intuitive interface
- Metrics and aggregated stats combined in one component
- Tags closer to domain grid context
- Tag Manager easily accessible next to tags
- Reduced UI clutter

**Merge Strategy:**
- New isolated component (`TagsSection`)
- Point modifications to existing components
- No core framework changes
- Can be reverted by restoring old layout

**Bug Fixes:**
- `src/components/custom/StatsOverview.tsx:251-263` - Added undefined checks for `bounceRate` and `avgTime`
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx:51-54` - Moved `handleFilterChange` declaration before handlers that depend on it (fixed ReferenceError)

---

### 2025-11-05 - Date Range Filter Fix ✅ COMPLETE
**Files Modified:**
- `src/lib/custom/types.ts:43-53` - Added `bounceRate` and `avgTime` fields to `AggregatedMetrics` interface
- `src/lib/custom/mockData.ts:86-87,154,184-203` - Generate 90 days of data for all date ranges
  - Changed `generateTimeSeries(28)` to `generateTimeSeries(90)`
  - Updated `generateAggregatedMetrics()` to calculate metrics from all days
  - Added `bounceRate` and `avgTime` to aggregated totals
- `src/lib/custom/utils.ts:227-236,367-471` - Added date range filtering
  - New function: `filterTimeSeriesByDateRange()` - Filter time series by selected period
  - Updated `calculateAggregatedMetrics()` to accept `dateRange` parameter
  - Filter time series before aggregation
  - Calculate totals from filtered time series instead of domain.current values
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx:46-49` - Pass `dateRange` to `calculateAggregatedMetrics()`
  - Added `filterState.dateRange` to useMemo dependencies

**Issues Fixed:**
1. **Date range selector not working:** Graph and totals were always showing same data regardless of period selection
2. **Unclear metric calculations:** Total stats were incorrectly calculated from last 7 days average instead of selected period

**Root Cause:**
- Mock data generated only 28 days
- Date range filter was not passed to aggregation function
- Totals calculated from `domain.current` (7-day averages) instead of actual time series for selected period

**Solution:**
1. Generate 90 days of mock data to support all date ranges (7d, 28d, 90d)
2. Filter time series by selected date range before aggregation
3. Calculate totals from filtered time series (sum of all days in period)
4. Added `bounceRate` and `avgTime` to aggregated metrics display

**Expected Behavior:**
- 7 days: Shows last 7 days of data, totals calculated from 7 days
- 28 days: Shows last 28 days of data, totals calculated from 28 days
- 90 days: Shows last 90 days of data, totals calculated from 90 days
- Graph updates automatically when date range changes
- Total stats reflect the selected period (not hardcoded 7 days)

**Status:** ✅ Fixed - Date range selector now works correctly, totals calculated from selected period

---

### 2025-11-05 - Domain Cards Date Range Sync ✅ COMPLETE
**Files Modified:**
- `src/lib/custom/utils.ts:238-337` - Added `recalculateDomainMetricsForDateRange()` function
  - Recalculates domain metrics (pageviews, visits, visitors, bounces, avgTime) based on selected date range
  - Calculates "previous period" metrics for comparison (e.g., 7d selected → compare with previous 7 days)
  - Updates percentage changes between current and previous periods
  - Filters timeSeries to match selected period
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx:8-13,36-45` - Apply date range to domain cards
  - Import `recalculateDomainMetricsForDateRange` function
  - Map all domains through recalculation before filtering/sorting
  - Domain cards now update when date range changes

**Issue:**
Domain cards (DomainCard components) were showing hardcoded 7-day metrics regardless of selected date range filter. Only aggregated stats were updating when user changed period.

**Solution:**
Created `recalculateDomainMetricsForDateRange()` function that:
1. Takes domain data and selected date range (7d/28d/90d)
2. Filters timeSeries to selected period
3. Calculates average metrics for current period
4. Calculates average metrics for previous period (same length)
5. Computes percentage changes
6. Returns updated domain object with recalculated values

Applied in CustomAnalyticsPage before filtering:
```typescript
const recalculatedDomains = domains.map(domain =>
  recalculateDomainMetricsForDateRange(domain, filterState.dateRange)
);
```

**Expected Behavior:**
- User selects "7 days" → domain cards show 7-day averages vs previous 7 days
- User selects "28 days" → domain cards show 28-day averages vs previous 28 days
- User selects "90 days" → domain cards show 90-day averages vs previous 90 days
- Changes (arrows and percentages) reflect comparison with previous period
- Mini charts in cards show only data for selected period

**Status:** ✅ Complete - Domain cards now sync with date range filter, all metrics update consistently
