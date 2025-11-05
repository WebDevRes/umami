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
