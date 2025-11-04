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

**Next Steps:**
- Phase 5: Performance optimization and virtualization tuning
- Phase 6: Main page integration and testing
- Phase 7: Real API integration

## Known Issues

- None yet
