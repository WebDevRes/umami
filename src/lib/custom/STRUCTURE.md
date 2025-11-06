# Custom Analytics Dashboard — Structure Reference

Quick reference для ориентации в кастомном дашборде. Показывает где править ту или иную функцию.

---

## 📁 Entry Point
**[CustomAnalyticsPage.tsx](../../app/(main)/custom-analytics/CustomAnalyticsPage.tsx)**
- Main page component (Client Component)
- State management: filters, domains, tags, localStorage
- Handlers: favorite toggle, tag operations, metric toggle, export
- **Править здесь:** page-level state, handlers, data flow orchestration

---

## 🧩 Components (`src/components/custom/`)

### **[FilterBar.tsx](../../components/custom/FilterBar.tsx)**
Date range, search, sort dropdown, export button
- **Править:** filters UI, sort options, export button

### **[StatsOverview.tsx](../../components/custom/StatsOverview.tsx)**
Aggregated metrics cards (5 clickable cards + large chart)
- **Править:** metric cards layout, large chart config, active metric highlighting

### **[TagsSection.tsx](../../components/custom/TagsSection.tsx)**
Tag filters + "Manage Tags" button
- **Править:** tag display, tag filter logic, tag manager modal trigger

### **[DomainsGrid.tsx](../../components/custom/DomainsGrid.tsx)**
Virtualized grid (react-window) with favorites + regular domains
- **Править:** grid layout, virtualization settings, favorites section

### **[DomainCard.tsx](../../components/custom/DomainCard.tsx)**
Individual domain card (154px height) with metrics, favorite, tags
- **Править:** card layout, metric display, favorite icon, tag dropdown

### **[MiniChart.tsx](../../components/custom/MiniChart.tsx)**
Chart.js line chart (multi-metric support)
- **Править:** chart config, colors, tooltip format

### **[TagManager.tsx](../../components/custom/TagManager.tsx)**
Modal for creating/deleting tags
- **Править:** tag CRUD operations, modal UI

### **[MetricToggle.tsx](../../components/custom/MetricToggle.tsx)**
Toggle buttons for 5 metrics (not used in current UI but available)
- **Править:** metric toggle buttons UI

### **[ExportButton.tsx](../../components/custom/ExportButton.tsx)**
CSV export button (logic TBD)
- **Править:** export logic, CSV generation

### **[RealtimeIndicator.tsx](../../components/custom/RealtimeIndicator.tsx)**
Live visitor count with pulse animation (not used in current UI)
- **Править:** realtime display, animation

---

## 🛠️ Utils & Logic (`src/lib/custom/`)

### **[types.ts](../../lib/custom/types.ts)**
TypeScript types: `DomainMetrics`, `FilterState`, `MetricType`, `AggregatedData`, etc.
- **Править:** add/modify types

### **[utils.ts](../../lib/custom/utils.ts)**
Core logic functions:
- `filterAndSortDomains()` — filter + sort domains
- `calculateAggregatedMetrics()` — aggregate metrics from domains
- `recalculateDomainMetricsForDateRange()` — recalc metrics for date range
- `formatMetricValue()` — format numbers (1.2k, 3.4M)
- `calculateBounceRate()`, `calculateAvgTime()`, etc.
- **Править:** filtering logic, metric calculations, date range logic

### **[mockData.ts](../../lib/custom/mockData.ts)**
Mock data generator (500+ domains with random metrics)
- **Править:** mock data generation, domains count, metric ranges

### **[hooks.ts](../../lib/custom/hooks.ts)**
Custom React hooks (if any)
- **Править:** add custom hooks

---

## 🔧 Quick Fix Guide

| Issue | File to Edit |
|-------|--------------|
| Filter logic broken | [utils.ts:filterAndSortDomains()](../../lib/custom/utils.ts) |
| Metric calculation wrong | [utils.ts:calculateAggregatedMetrics()](../../lib/custom/utils.ts) |
| Date range not working | [utils.ts:recalculateDomainMetricsForDateRange()](../../lib/custom/utils.ts) |
| Card layout issues | [DomainCard.tsx](../../components/custom/DomainCard.tsx) / [DomainCard.module.css](../../components/custom/DomainCard.module.css) |
| Chart not rendering | [MiniChart.tsx](../../components/custom/MiniChart.tsx) |
| Grid virtualization issues | [DomainsGrid.tsx](../../components/custom/DomainsGrid.tsx) |
| Tags not saving | [CustomAnalyticsPage.tsx:48-58](../../app/(main)/custom-analytics/CustomAnalyticsPage.tsx#L48-L58) (localStorage) |
| Add new metric type | [types.ts:MetricType](../../lib/custom/types.ts) → [utils.ts](../../lib/custom/utils.ts) → [DomainCard.tsx](../../components/custom/DomainCard.tsx) |
| Export not working | [ExportButton.tsx](../../components/custom/ExportButton.tsx) |
| State not persisting | [CustomAnalyticsPage.tsx:34-59](../../app/(main)/custom-analytics/CustomAnalyticsPage.tsx#L34-L59) (localStorage hooks) |

---

## 🎨 Styling

All components use CSS Modules:
- `ComponentName.module.css` рядом с `.tsx` файлом
- Global variables: `src/styles/` (existing Umami design system)
- Chart colors: [MiniChart.tsx:CHART_COLORS](../../components/custom/MiniChart.tsx)

---

## 🚀 Data Flow

```
generateMockData() (mockData.ts)
    ↓
CustomAnalyticsPage state (domains, filterState)
    ↓
recalculateDomainMetricsForDateRange() → filterAndSortDomains() (utils.ts)
    ↓
filteredDomains → calculateAggregatedMetrics() (utils.ts)
    ↓
Components: StatsOverview, DomainsGrid → DomainCard
```

---

## 📝 Notes

- All components isolated in `src/components/custom/` (no core file edits)
- All utils isolated in `src/lib/custom/` (no core file edits)
- localStorage keys: `custom-analytics-tags`, `custom-analytics-domains`
- Mock data: 500+ domains with 28 days of daily metrics
- Virtualization: react-window (see DomainsGrid.tsx for config)
