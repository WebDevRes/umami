# Custom Analytics Interface - Implementation Plan

## Project Overview
Creating a new, isolated analytics interface for Umami with improved UX inspired by SEOgets dashboard design. This implementation follows fork customization strategy to minimize conflicts during upstream merges.

**Key Requirements:**
- **500+ domains** monitoring in grid layout (4 columns)
- **Compact cards** for quick visual scanning (h-[9.64rem] / ~154px)
- **Toggle metrics** (Pageviews, Visits, Visitors, Bounces, Avg. Time) - toggle buttons, not checkboxes
- **Favorites + Tags** system for filtering (favorites always pinned to top)
- **Realtime indicator** for active visitors
- **Export functionality** (CSV/Excel)
- **Performance:** virtualized list for large datasets (react-window already in dependencies)
- **Global aggregate chart** at the top (critical feature for monitoring overview)

---

## Architecture

### Directory Structure
```
src/
├── app/(main)/custom-analytics/
│   ├── page.tsx                    # Main route component
│   └── CustomAnalyticsPage.tsx     # Page implementation
│
├── components/custom/
│   ├── DomainCard.tsx              # Compact domain card with mini charts
│   ├── MiniChart.tsx               # Mini line chart with hover tooltip
│   ├── StatsOverview.tsx           # Total metrics + aggregated chart
│   ├── MetricToggle.tsx            # Toggle metrics visibility
│   ├── DomainsGrid.tsx             # Virtualized grid layout (500+ items)
│   ├── RealtimeIndicator.tsx       # Live visitor count indicator
│   ├── FilterBar.tsx               # Date, search, sort, tags filters
│   ├── TagManager.tsx              # Tag creation and assignment
│   └── ExportButton.tsx            # Data export functionality
│
└── lib/custom/
    ├── mockData.ts                 # Mock data generator
    ├── types.ts                    # Custom type definitions
    └── utils.ts                    # Helper functions
```

---

## Technology Stack (Based on Existing Codebase)

### ✅ Already Available:
- **Charts:** Chart.js 4.4.9 + chartjs-adapter-date-fns (already in package.json)
- **Virtualization:** react-window 1.8.6 (already in package.json)
- **Icons:** Custom SVG icons from `@/components/icons` + react-basics Icons
- **Favicon:** Existing `<Favicon>` component ([src/components/common/Favicon.tsx:1](src/components/common/Favicon.tsx#L1))
- **Chart component:** Base `<Chart>` wrapper ([src/components/charts/Chart.tsx:1](src/components/charts/Chart.tsx#L1))

### 🎨 Design System:
- **CSS Variables:** `--primary400`, `--base50`, `--dark100`, etc. ([src/styles/variables.css:1](src/styles/variables.css#L1))
- **Colors for metrics:** Need to define custom variables (e.g., `--metric-pageviews`, `--metric-visits`)
- **Icons:** SVG icons from `@/assets/*.svg` imported via `@/components/icons`
- **CSS Modules:** Component-scoped styles (`.module.css` files)

### 📐 Design Specifications (from example):
- **Card height:** `h-[9.64rem]` (154px)
- **Chart height:** `max-height: 80px`
- **Grid:** 4 columns on desktop, responsive (3/2/1 on smaller screens)
- **Hover tooltip:** Built into Chart.js via `onTooltip` callback

---

## Implementation Steps

### Phase 0: Research Findings ✅

**Key Discoveries:**
1. **No Recharts** - Project uses Chart.js, not Recharts (example HTML was misleading)
2. **Chart.js integration** - Existing `<Chart>` component wrapper at [src/components/charts/Chart.tsx:1](src/components/charts/Chart.tsx#L1)
3. **Icons system** - SVG imports from `@/assets/` via `@/components/icons.ts`
4. **Color variables** - Defined in `react-basics` library (not in project CSS)
5. **react-window** - Already installed, ready for virtualization

**Chart.js Usage Pattern:**
```typescript
// Existing pattern from Chart.tsx
import ChartJS from 'chart.js/auto';
const chart = new ChartJS(canvas, { type: 'line', data, options });
```

---

### Phase 1: Mock Data Foundation
**Files to create:**
- `src/lib/custom/mockData.ts`
- `src/lib/custom/types.ts`

**Tasks:**
1. Define TypeScript interfaces extending base types from `src/lib/types.ts`
2. Create mock data generator for:
   - **500+ websites** with realistic domains (casino, betting, e-commerce, etc.)
   - **5 core metrics:** Pageviews, Visits, Visitors, Bounces, Avg. Time
   - **Time series data** (daily for 7/28/custom days)
   - **Percentage changes** vs previous period
   - **Favorites + Tags** (array of tag names per domain)
   - **Realtime visitors** count
   - **Total aggregated stats** for StatsOverview

**Example data structure:**
```typescript
interface DomainMetrics {
  id: string;
  domain: string;
  name: string;
  favicon?: string;

  // Core metrics
  pageviews: { current: number; previous: number; change: number };
  visits: { current: number; previous: number; change: number };
  visitors: { current: number; previous: number; change: number };
  bounces: { current: number; previous: number; change: number };
  avgTime: { current: number; previous: number; change: number };

  // Time series (for mini charts)
  timeSeries: {
    date: string;
    pageviews: number;
    visits: number;
    visitors: number;
    bounces: number;
    avgTime: number;
  }[];

  // Metadata
  isFavorite: boolean;
  tags: string[];
  realtimeVisitors: number;
  lastUpdate: Date;
}

interface DashboardData {
  domains: DomainMetrics[];
  totals: {
    pageviews: number;
    visits: number;
    visitors: number;
    realtimeTotal: number;
  };
  availableTags: string[];
}
```

---

### Phase 2: UI Components
**Components to create (in order):**

#### 2.1 Data Visualization
1. **MiniChart.tsx** (critical for cards)
   - **Use Chart.js** (existing `<Chart>` component or custom wrapper)
   - Canvas-based rendering (better performance than SVG for 500+ cards)
   - Multiple datasets (toggle pageviews/visits/visitors/bounces/avgTime)
   - **Hover tooltip** via Chart.js `onTooltip` callback
   - Height: `80px` (max-height constraint)
   - Smooth curves (`tension: 0.4` in Chart.js)
   - Color coding per metric (define CSS variables)

2. **StatsOverview.tsx** (CRITICAL - main monitoring feature)
   - **Large aggregated chart** showing total metrics across ALL domains
   - Chart.js line chart with multiple datasets
   - Display totals: Pageviews, Visits, Visitors
   - Period comparison (vs previous period)
   - Realtime total indicator (live visitor count)
   - Height: ~200-300px (larger than mini charts)

#### 2.2 Card Components
3. **DomainCard.tsx** (core component)
   - **Compact layout:** `h-[9.64rem]` (154px fixed height)
   - Domain name + `<Favicon>` component (reuse existing)
   - Favorite star icon (toggle state, yellow when active)
   - Tags display (colored pills/badges below chart)
   - MiniChart component (80px height)
   - **Metrics display:** Icon + value + arrow (↑/↓) + % change
   - Color coding: green (positive), red (negative), gray (neutral)
   - Click handler → navigate to `/websites/{websiteId}`
   - Hover effects: subtle shadow, chart tooltip

4. **MetricToggle.tsx**
   - **Toggle buttons** (NOT checkboxes) for 5 metrics
   - Icons: Pageviews (click), Visits (eye), Visitors (user), Bounces (%), Avg. Time (clock)
   - Active state: `bg-background` class, inactive: no background
   - Global toggle (affects all cards simultaneously)
   - Save preference to localStorage
   - Layout: Horizontal row of icon buttons in toolbar

#### 2.3 Layout & Filters
5. **FilterBar.tsx**
   - **Date range selector:** 7d/28d/90d/custom (combobox dropdown)
   - **Search input:** Full-width with icon (filter by domain name)
   - **Sort dropdown:** A to Z, Z to A, Most Visitors, Least Visitors, Most Pageviews
   - **Tag filter:** Multi-select pills (show selected tags, click to filter)
   - **Additional buttons:** "+ Domain", "Export", Menu (...)
   - **RealtimeIndicator:** Positioned in top-right (e.g., "● 247")
   - Layout: Flex row, responsive (wrap on mobile)

6. **DomainsGrid.tsx**
   - **Virtualized grid** using `react-window` (FixedSizeGrid or VariableSizeGrid)
   - Responsive columns: 4 (desktop), 3 (tablet), 2 (small tablet), 1 (mobile)
   - **Favorites section:** Always at top, separate from main grid
   - Card height: fixed 154px (enables efficient virtualization)
   - Window height calculation: `viewport height - header - filters`
   - Performance: Render only visible cards (~20-30 at a time)

7. **TagManager.tsx**
   - Create new tags with custom colors
   - Assign/remove tags to domains (modal or dropdown)
   - Tag library: Show all available tags
   - Color picker for tag customization
   - Bulk tagging (select multiple domains, apply tag)
   - Tag displayed as colored pill on card

#### 2.4 Additional Features
8. **RealtimeIndicator.tsx**
   - Display total active visitors across all domains
   - Format: `● 247` (dot + number)
   - Pulse animation on dot (CSS keyframes)
   - Position: Inline in FilterBar (top-right area)
   - Updates every 5-10 seconds (mock: random fluctuation)

9. **ExportButton.tsx**
   - Export current view to CSV/Excel
   - Include: domain, all visible metrics, date range
   - Respect current filters (search, tags, sort)
   - Options modal: Select metrics to include
   - Download via browser (client-side generation with PapaParse)

---

### Phase 3: Main Page
**Files to create:**
- `src/app/(main)/custom-analytics/page.tsx`
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.tsx`

**Layout structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│ FilterBar                                                         │
│ [28 days ▼] [Search...] [Sort ▼] [Tags ▼] [+ Domain] [● 247]   │
│ [Export]                                                          │
├──────────────────────────────────────────────────────────────────┤
│ StatsOverview                                                     │
│ Total: 1.2M visitors | 3.5M pageviews | 2.1M visits             │
│ [Aggregated chart for all domains]                               │
├──────────────────────────────────────────────────────────────────┤
│ MetricToggle                                                      │
│ ☑ Pageviews  ☑ Visits  ☑ Visitors  ☐ Bounces  ☐ Avg Time       │
├──────────────────────────────────────────────────────────────────┤
│ DomainsGrid (virtualized, 4 columns)                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│ │⭐ Domain 1 │ │⭐ Domain 2 │ │ Domain 3   │ │ Domain 4   │   │ Favorites
│ │[chart]     │ │[chart]     │ │[chart]     │ │[chart]     │   │
│ │5.2k +6%    │ │3.1k -2%    │ │8k +15%     │ │1.2k 0%     │   │
│ │🏷️ tag      │ │🏷️ tag      │ │            │ │🏷️ tags     │   │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│ │ Domain 5   │ │ Domain 6   │ │ Domain 7   │ │ Domain 8   │   │ Regular
│ │[chart]     │ │[chart]     │ │[chart]     │ │[chart]     │   │
│ │...         │ │...         │ │...         │ │...         │   │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│ ... (scroll, 500+ domains virtualized)                           │
└──────────────────────────────────────────────────────────────────┘
```

**Implementation:**
1. Create Next.js route at `/custom-analytics`
2. Main page as Client Component (high interactivity)
3. State management:
   - Active metrics (pageviews, visits, etc.)
   - Date range
   - Search query
   - Sort order
   - Tag filters
   - Favorites list
4. Import mock data (later: API integration)
5. Responsive layout:
   - Desktop: 4 columns
   - Tablet: 2-3 columns
   - Mobile: 1 column
6. Click handlers:
   - Card click → navigate to `/websites/{websiteId}`
   - Favorite toggle → update state
   - Tag management → modal/drawer

---

### Phase 4: Styling
**Approach:**
- Use existing CSS Modules pattern
- Import global styles from `src/styles/`
- Follow SEOgets-inspired design:
  - Clean, minimal cards
  - Soft shadows on hover
  - Color-coded metrics (blue/orange/purple for different lines)
  - Green/red for positive/negative changes
  - Smooth transitions
- Responsive grid with gap spacing
- Follow existing color scheme and design tokens

**Key CSS considerations:**
- **Card compact layout:** padding, chart height, font sizes
- **Grid responsive:** CSS Grid with auto-fit minmax
- **Chart colors:** consistent with toggled metrics
- **Hover states:** subtle elevation, tooltip positioning
- **Performance:** GPU-accelerated transforms
- **Dark mode:** if project supports it

**Files:**
- `src/app/(main)/custom-analytics/CustomAnalyticsPage.module.css`
- `src/components/custom/DomainCard.module.css`
- `src/components/custom/MiniChart.module.css`
- `src/components/custom/FilterBar.module.css`
- Other component CSS as needed

---

### Phase 5: Performance & Optimization
1. **Virtualization:**
   - Install `react-window` or `react-virtualized`
   - Implement windowing for 500+ cards
   - Dynamic row height calculation
   - Scroll performance optimization

2. **Chart Performance:**
   - Use Canvas instead of SVG for large datasets
   - Throttle hover events
   - Memoize chart calculations
   - Lazy load chart library

3. **State Optimization:**
   - useMemo for filtered/sorted data
   - useCallback for event handlers
   - Local storage for preferences
   - Debounce search input

4. **Bundle Optimization:**
   - Code splitting by route
   - Dynamic imports for heavy components
   - Tree shaking unused utilities

---

### Phase 6: Integration & Polish
1. **Navigation:**
   - Add link to custom analytics in sidebar
   - Direct URL: `/custom-analytics`
   - Breadcrumb navigation

2. **Testing:**
   - Visual testing with 500+ mock domains
   - Responsive design check (mobile/tablet/desktop)
   - Browser compatibility (Chrome, Firefox, Safari)
   - Performance profiling (Lighthouse)
   - Hover tooltip positioning edge cases

3. **Accessibility:**
   - Keyboard navigation (Tab, Enter, Space)
   - ARIA labels for interactive elements
   - Focus management
   - Screen reader testing

4. **Documentation:**
   - Update `CUSTOMIZATIONS.md` with all changes
   - Add JSDoc comments in code
   - Create usage guide (optional)
   - Document metric calculations

---

## Data Flow (Mock Phase)

```
MockData Generator → CustomAnalyticsPage → Components
     (mockData.ts)         (page.tsx)        (custom/*)
```

**Future: Real Data Integration**
```
API Routes → TanStack Query → Page → Components
(app/api/*)   (queries/*)     (page) (custom/*)
```

---

## Key Design Decisions

### ✅ Isolation Strategy
- All new files in `custom/` subdirectories
- No modifications to existing core files
- Can be removed easily if needed
- Minimal merge conflicts

### ✅ Type Safety
- Reuse existing types from `src/lib/types.ts`
- Extend with custom types as needed
- Full TypeScript coverage

### ✅ Component Reusability
- Use existing `react-basics` components
- Build on top of existing design system
- Consistent with Umami UI patterns

### ✅ Progressive Enhancement
- Start with mock data
- Easy to replace with real API calls later
- Same component interface

---

## Migration Path (Mock → Real Data)

**Phase 1 (Current): Mock Data**
- Hardcoded data in `mockData.ts`
- Fast prototyping
- UI/UX validation

**Phase 2 (Future): Real API**
1. Create API endpoints in `src/app/api/custom/`
2. Create query hooks in `src/queries/custom/`
3. Replace mock data imports with API calls
4. Add loading states and error handling
5. Add data caching with TanStack Query

**Example migration:**
```typescript
// Before (mock)
import { getMockData } from '@/lib/custom/mockData';
const data = getMockData();

// After (real)
import { useCustomAnalytics } from '@/queries/custom/useCustomAnalytics';
const { data, isLoading } = useCustomAnalytics(websiteId);
```

---

## Customization Documentation

**Update `CUSTOMIZATIONS.md` with:**
```markdown
## Custom Analytics Interface
- **Date:** 2025-01-XX
- **Files added:**
  - `src/app/(main)/custom-analytics/` - New analytics page
  - `src/components/custom/` - Custom UI components
  - `src/lib/custom/` - Mock data and utilities
- **Files modified:** None
- **Reason:** Create improved, isolated analytics interface
- **Merge strategy:** No conflicts expected (all new files)
```

---

## Timeline Estimate

| Phase | Estimated Time | Priority | Status |
|-------|---------------|----------|--------|
| Phase 0: Planning | 1 hour | High | ✅ Done |
| Phase 1: Mock Data (10 domains) | 2-3 hours | High | ✅ Done |
| Phase 2: Components (9 components) | 5-7 hours | High | ⏳ Next |
| Phase 3: Main Page + State | 3-4 hours | High | Pending |
| Phase 4: Styling (SEOgets-inspired) | 2-3 hours | High | Pending |
| Phase 5: Performance (virtualization) | 2-3 hours | High | Pending |
| Phase 6: Polish & Testing | 2-3 hours | Medium | Pending |
| **Total** | **17-24 hours** | - | In Progress |

**Note:** Timeline increased due to:
- Scale requirement (500+ domains vs 5-10)
- Virtualization implementation
- Advanced features (tags, favorites, export)
- Performance optimization needs

---

## Next Steps

1. ✅ Create directory structure
2. ✅ Write comprehensive implementation plan
3. ✅ Implement mock data generator (10 domains) + unit tests
4. ⏳ **[NEXT]** Create MiniChart component (critical path)
5. ⏳ Create DomainCard component
6. ⏳ Create FilterBar + MetricToggle
7. ⏳ Create StatsOverview
8. ⏳ Implement DomainsGrid with virtualization
9. ⏳ Build main CustomAnalyticsPage
10. ⏳ Add styling (SEOgets-inspired)
11. ⏳ Add tags, favorites, export features
12. ⏳ Performance optimization
13. ⏳ Testing and polish

## Key Technical Decisions

### Chart Library ✅ DECIDED
**Selected: Chart.js 4.4.9**
- Already in dependencies (no additional bundle size)
- Existing `<Chart>` wrapper component to extend
- Canvas-based (better performance for 500+ cards)
- Mature tooltip system (`onTooltip` callback)
- Well-documented gradient support for area charts

### Virtualization Library ✅ DECIDED
**Selected: react-window 1.8.6**
- Already installed in dependencies
- Lightweight (~10KB gzipped)
- Perfect for fixed-height grids (154px cards)
- Use `FixedSizeGrid` for column-based layout
- Separator for favorites section (non-virtualized, always visible)

### State Management
For this page:
- **React useState + Context** (sufficient for page-level state)
- **localStorage** for user preferences (filters, metric toggles)
- Future: integrate with existing Zustand stores if needed

---

## Notes

- All code and comments in English (project standard)
- Follow existing ESLint/Prettier configuration
- Use existing color variables and design tokens
- Mobile-first responsive design
- Accessibility considerations (ARIA labels, keyboard nav)
- Consider dark mode support (if project has it)

---

---

## SEOgets Design Reference Notes (from example code)

Based on provided HTML/CSS example:
- **Grid:** 4 columns, compact cards (`h-[9.64rem]` / 154px height)
- **Card structure:**
  - Header: Favicon (16x16) + domain name + metrics (right-aligned)
  - Chart area: 80px height with Chart.js/Recharts multi-line chart
  - Footer: Tag icons (left) + favorite star (right)
- **Chart appearance:**
  - Multiple colored lines with gradient fill (area charts)
  - Smooth curves (tension parameter)
  - Custom colors via CSS variables (`hsla(var(--clicks))`, etc.)
  - Hover tooltip shows date + all metric values
- **Metrics display:**
  - Icon + value + arrow (↑/↓) + percentage
  - Green for positive, red for negative changes
- **Spacing:** Very compact, minimal padding
- **Toolbar:**
  - Search, tag filters, sort, date range, metric toggles
  - Toggle buttons with icons (active = highlighted background)

---

## Design System Additions Needed

**New CSS Variables to Define:**
```css
/* src/styles/variables.css or custom CSS file */
:root {
  --metric-pageviews: hsl(210, 100%, 60%);  /* Blue */
  --metric-visits: hsl(280, 100%, 65%);      /* Purple */
  --metric-visitors: hsl(25, 100%, 60%);     /* Orange */
  --metric-bounces: hsl(0, 85%, 60%);        /* Red */
  --metric-avgtime: hsl(160, 70%, 50%);      /* Teal */

  --change-positive: var(--green600);
  --change-negative: var(--red600);
  --change-neutral: var(--base600);
}
```

**Icons Needed (check if available, otherwise create SVG):**
- Click icon (pageviews)
- Eye icon (visits) ✅ Already exists ([src/components/icons.ts:43](src/components/icons.ts#L43))
- User icon (visitors) ✅ Already exists ([src/components/icons.ts:60](src/components/icons.ts#L60))
- Percentage icon (bounces)
- Clock icon (avg time) ✅ Already exists ([src/components/icons.ts:38](src/components/icons.ts#L38))
- Star icon (favorites)
- Tags icon (tags)
- Arrow up/down icons (metric changes)

---

---

## Critical Changes from Initial Plan

### ✅ Technology Stack:
- ~~Recharts~~ → **Chart.js 4.4.9** (already in project)
- ~~Consider react-window~~ → **react-window 1.8.6** (already installed)
- ~~Custom SVG icons~~ → **Existing icon system** from `@/components/icons`

### ✅ Design Specifications:
- **Card height:** Fixed at `154px` (not flexible)
- **Chart height:** Fixed at `80px` max
- **Metric toggles:** Toggle buttons (NOT checkboxes)
- **Favorites:** Separate section, always visible at top (not mixed in grid)
- **Tooltip:** Chart.js built-in (not custom React component)

### ✅ Key Features Priority:
1. **Global aggregate chart** (CRITICAL - main monitoring feature)
2. **Virtualized grid** (CRITICAL - performance for 500+ domains)
3. **Compact cards** (CRITICAL - fit 4 columns, quick scanning)
4. **Favorites pinning** (HIGH - always at top)
5. **Tag filtering** (HIGH - manage large domain sets)
6. **Export** (MEDIUM - data extraction)
7. **Realtime indicator** (LOW - nice to have)

### 🎯 Main Goal:
**Quick visual overview of 500+ domains at a glance** - optimize for scanning speed, not detailed analysis per domain (detailed page already exists).

---

**Last Updated:** 2025-01-04 (Updated after codebase research)
**Status:** Planning Complete - Ready for Phase 1 Implementation
