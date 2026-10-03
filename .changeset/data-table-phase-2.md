---
'@ufisoft/ui': minor
---

`DataTable` phase 2: global search (`globalSearch`, `search` / `defaultSearch` / `onSearchChange`, `searchDebounce`) that ignores case and accents, and column filters (`filter` on a column: `text`, `number`, `select` with `multiple`, `date` with `DateRangePicker`, `boolean`) edited in a header popover and listed as removable chips with "Clear all". Filters are controlled or uncontrolled (`filters` / `defaultFilters` / `onFiltersChange`); new column options `label`, `filterValue` and `searchable`; `dateLocale` for the date filter. `DataTableQuery` now also has `filters` and `search` — add them where you build a query object. Emits `datatable.state.onFilter` and `datatable.state.onSearch`.
