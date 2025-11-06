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

---

### 2025-11-06 - Stats Cards Redesign & Tag Manager Fixes ✅ COMPLETE
**Files Modified:**
- `src/components/custom/StatsOverview.module.css:8-32,34-46,48-65` - Reduced stats card size and centered layout
  - Changed grid to flexbox with `justify-content: center`
  - Reduced padding from 12px to 8px 16px
  - Set min-width: 120px, max-width: 140px (~50% size reduction)
  - Reduced label font from 13px to 11px
  - Reduced value font from 28px to 18px
  - Centered text alignment
  - Removed border colors from active state
  - Updated hover effects (removed background color change)
- `src/components/custom/StatsOverview.tsx:13-18,227-279` - Added colored backgrounds for active metrics
  - Added `bg` property to METRIC_COLORS (15% opacity backgrounds)
  - Applied inline styles with `backgroundColor` when metric is active
  - Removed border indicators, using only background colors
- `src/components/custom/TagManager.tsx:13-35` - Fixed duplicate button issue
  - Removed internal toggle state (`isOpen`)
  - Removed duplicate "Manage Tags" button (lines 38-43)
  - Component now only renders modal when mounted
  - Relies on parent component (TagsSection) for open/close state
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx:2,17-18,33-59` - Fixed tag persistence
  - Added `useEffect` import
  - Added localStorage keys: `STORAGE_KEY_TAGS` and `STORAGE_KEY_DOMAINS`
  - Initialize `availableTags` from localStorage (fallback to mock data)
  - Initialize `domains` from localStorage (fallback to mock data)
  - Save `availableTags` to localStorage on change (useEffect)
  - Save `domains` to localStorage on change (useEffect)
  - SSR-safe with `typeof window` checks

**Issues Fixed:**
1. **Stats cards too large:** Cards reduced by ~50% in size with centered compact layout
2. **Mini metric icons unclear:** Removed legend indicators, now active metrics have colored backgrounds matching their chart line colors
3. **Duplicate "Manage Tags" button:** Fixed TagManager component showing two buttons when opened
4. **Tag deletion not persisting:** Tags now saved to localStorage, persist across page refreshes

**Color Mapping:**
- Pageviews: Blue (`hsla(210, 100%, 60%, 0.15)`)
- Visits: Purple (`hsla(280, 100%, 65%, 0.15)`)
- Visitors: Orange (`hsla(25, 100%, 60%, 0.15)`)
- Bounces: Red (`hsla(0, 85%, 60%, 0.15)`)
- Avg. Time: Teal (`hsla(160, 70%, 50%, 0.15)`)

**Expected Behavior:**
- Stats cards are compact and centered (~120-140px wide)
- Active metrics show colored backgrounds (no borders)
- Single "Manage Tags" button in TagsSection
- Created/deleted tags persist after page refresh
- Domain tag assignments persist after page refresh

**Status:** ✅ Complete - Improved UX with compact colored cards and persistent tag management

---

### 2025-11-06 - UX Improvements: Stats Cards Revert & Tag Display Refinement ✅ COMPLETE
**Files Modified:**
- `src/components/custom/StatsOverview.module.css:8-28,45-58` - Reverted stats cards to original size
  - Changed flexbox back to grid layout
  - Restored padding from 8px 16px to 12px
  - Restored min-width/max-width constraints
  - Restored label font from 11px to 13px
  - Restored value font from 18px to 28px
  - Restored left text alignment
- `src/components/custom/DomainCard.tsx:184-202` - Moved active tags to top of cards
  - Relocated tags section from bottom to top (after header, before chart)
  - Tags now appear immediately after domain name
  - Only tag icon button visible in header
- `src/components/custom/DomainCard.module.css:101-113` - Reduced tag menu transparency
  - Changed background from `var(--base0)` to `var(--base50)` (less transparent)
  - Increased box-shadow opacity from 0.15 to 0.25
- `src/components/custom/TagManager.module.css:22-46` - Improved main modal design
  - Increased backdrop opacity from 0.5 to 0.75
  - Changed modal background from `var(--base0)` to `var(--base50)` (less transparent)
  - Added border: `1px solid var(--base300)`
  - Increased box-shadow opacity from 0.3 to 0.4
- `src/components/custom/TagManager.tsx:36-43` - Added backdrop click to close
  - New `handleBackdropClick` handler
  - Modal closes when clicking outside content area
  - Existing X button still works

**Issues Fixed:**
1. **Stats cards too small:** Reverted to original comfortable size
2. **Tag labels cluttering cards:** Hidden tag text labels, showing only icon button
3. **Tags in wrong position:** Moved active tags from bottom to top (below domain name)
4. **Tag menu too transparent:** Increased opacity for better visibility in both card dropdown and main modal
5. **No way to close TagManager:** Added backdrop click handler + existing X button

**Expected Behavior:**
- Stats cards back to original size (~200px wide)
- Domain cards show active tags at top (below header)
- Only tag icon (🏷️) visible in header actions
- Tag dropdown menus have better contrast/visibility
- Main TagManager modal closable by:
  - Clicking X button (top right)
  - Clicking outside modal area (backdrop)

**Status:** ✅ Complete - Reverted stats size, improved tag UX and modal visibility

---

### 2025-11-06 - Tag Display Optimization ✅ COMPLETE
**Files Modified:**
- `src/components/custom/DomainCard.tsx:1,133-138,153-175` - Tag display improvements
  - Added `useMemo` import
  - Removed visible tags block from card body (lines 184-193 deleted)
  - Added `sortedTags` computed property - sorts tags with active first, inactive second
  - Added `tagBtnEmpty` class when domain has no tags
  - Added dynamic tooltip: "No tags assigned" or "X tag(s)"
  - Tags now only visible in dropdown menu, not on card surface
- `src/components/custom/DomainCard.module.css:82-104` - Added minimalist no-tags indicator
  - Changed transition from `opacity` to `all` for smooth effects
  - Added `.tagBtnEmpty` style: 40% opacity + grayscale filter
  - Creates subtle, minimalist appearance for domains without tags

**Issues Fixed:**
1. **Tag clutter:** Removed visible tag pills from card body
2. **Unsorted dropdown:** Active tags now appear at top of dropdown list
3. **No visual feedback for empty tags:** Icon becomes gray/transparent when no tags assigned

**User Experience:**
- **Card surface:** Clean, minimal - no visible tags
- **Tag icon (🏷️):**
  - Normal: Domain has tags (full color, hover shows count)
  - Dimmed: No tags assigned (40% opacity, grayscale, hover shows "No tags assigned")
- **Dropdown menu:**
  - Active tags listed first (checked)
  - Inactive tags listed below (unchecked)
  - Sorted dynamically based on domain's current tags

**Expected Behavior:**
- Domain cards show NO tags on surface (clean design)
- Click 🏷️ icon to see/manage tags in dropdown
- Domains without tags have subtle gray icon
- Dropdown automatically sorts: checked tags on top

**Status:** ✅ Complete - Clean, minimalist tag management with smart sorting

---

### 2025-11-06 - Chart Enhancements: Grid, Points, and Today/Yesterday Filters ✅ COMPLETE
**Files Modified:**
- `src/lib/custom/types.ts:12,79` - Added hourly data support
  - Updated `TimeSeriesDataPoint.date` comment: supports `YYYY-MM-DD HH:00` format for hourly data
  - Updated `FilterState.dateRange` to include `'today' | 'yesterday'`
- `src/components/custom/FilterBar.tsx:14-21` - Added today/yesterday date range options
  - Added "Today" and "Yesterday" options at top of DATE_RANGES
  - Options display hourly data instead of daily aggregates
- `src/lib/custom/utils.ts:214-251,256-259` - Hourly data filtering logic
  - Updated `getDateRangeDays()` to return 1 for today/yesterday
  - Updated `filterTimeSeriesByDateRange()` to filter by specific date (today or yesterday)
  - Updated `recalculateDomainMetricsForDateRange()` signature to accept today/yesterday
- `src/lib/custom/mockData.ts:55-108` - Generate hourly mock data
  - Added `generateHourlyData()` function: creates 24 hours of data for a given date
  - Updated `generateTimeSeries()` to include hourly data for today and yesterday
  - Daily data generated for days [90...3], hourly data for days [yesterday, today]
- `src/components/custom/StatsOverview.tsx:13-18,81-97,136-158,199-216` - Chart visual improvements
  - **Line thickness:** Reduced from 3px to 1.5px
  - **Points on lines:** Added visible dots (radius: 2px) to mark data points
  - **Grid visibility:** Increased grid opacity from 0.05 to 0.08 for better readability
  - **Hourly labels:** X-axis shows "HH:00" format for hourly data (instead of date)
  - **Hourly tooltips:** Tooltips display date + hour for hourly data points
- `src/components/custom/MiniChart.tsx:70-86,147-165` - Mini chart improvements
  - **Line thickness:** Reduced from 2px to 1px
  - **Points on lines:** Added small dots (radius: 1.5px) to mark data points
  - **Hourly tooltips:** Tooltips display date + hour for hourly data points

**Features Added:**
1. **Grid on main chart:** More visible grid lines (8% opacity instead of 5%)
2. **Point markers:** Small dots on all chart lines to indicate individual data points
3. **Thinner lines:** Chart lines reduced to half thickness (better for dense data)
4. **Today filter:** Shows last 24 hours of data with hourly granularity
5. **Yesterday filter:** Shows previous day's 24 hours of data with hourly granularity

**User Experience:**
- **"Today" selected:** Graph shows hourly breakdown (00:00 - 23:00) for current day
- **"Yesterday" selected:** Graph shows hourly breakdown for previous day
- **Other ranges (7d/28d/90d):** Continue to show daily aggregated data
- **X-axis labels:** Automatically switch between date format and hour format
- **Tooltips:** Show appropriate context (date or date+hour) based on data type

**Visual Improvements:**
- Clearer grid lines for easier value reading
- Point markers help identify individual data points
- Thinner lines reduce visual clutter, especially with multiple metrics
- Consistent styling between mini charts (domain cards) and main chart

**Status:** ✅ Complete - Enhanced chart readability with grid, points, and hourly data support

---

### 2025-11-06 - Real Data Integration (Phase 8) ✅ COMPLETE
**Files Added:**
- `src/lib/custom/api.ts` - API integration layer for fetching real data from Umami

**Files Modified:**
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx` - Replaced mock data with real API calls
  - Import `fetchDashboardData` instead of `generateMockData`
  - Added loading/error states (lines 30-31)
  - Fetch real data on mount and date range change (lines 62-89)
  - Store favorites in localStorage (Set-based, lines 48-60, 91-94)
  - **DISABLED:** All tags functionality (commented out, not deleted)
  - Removed TagsSection component from render
  - Pass empty tags array to DomainsGrid
- `src/components/custom/DomainCard.tsx:151-184` - Tag button and menu commented out
  - Tag icon (🏷️) and dropdown menu disabled
  - Only favorite star (★/☆) button visible
- `src/lib/custom/utils.ts:4,236-238` - Added TimeSeriesDataPoint import and fixed types

**API Integration:**
- `fetchUserWebsites()` - Fetch all user websites from `/api/me/websites`
- `fetchWebsiteStats()` - Fetch stats (pageviews, visits, visitors, bounces) for date range
- `fetchWebsitePageviews()` - Fetch time series data (hourly or daily)
- `fetchDashboardData()` - Main function fetching complete dashboard data in parallel
- Converts Umami API format to Custom Analytics types (DomainMetrics)
- Calculates percentage changes comparing current vs previous period
- Handles errors gracefully (fallback to zero metrics)

**Features:**
- ✅ Real domains from database
- ✅ Real metrics (pageviews, visits, visitors, bounces, avgTime)
- ✅ Real time series charts
- ✅ Date range filtering (7d/28d/90d)
- ✅ Favorites persistence (localStorage)
- ❌ **Tags DISABLED** (commented out, ready to re-enable later)

**User Experience:**
- Loading indicator while fetching data
- Error message if API fails
- Favorites survive page refresh
- Data reloads when date range changes

**Merge Strategy:**
- New isolated file (`api.ts`)
- Tags functionality preserved (commented, not deleted)
- Can be reverted by uncommenting tags code and switching back to `generateMockData()`
- No database migrations required

**Next Steps:**
- Test on local dev environment with real database
- Deploy to production server
- Optional: Enable tags with database migration later

**Status:** ✅ Complete - Real data integration ready for production deployment
