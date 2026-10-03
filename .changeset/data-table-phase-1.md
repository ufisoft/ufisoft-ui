---
'@ufisoft/ui': minor
---

Add `DataTable` (phase 1): column definitions with `value`, custom `cell` and `compare`; single and multi-column sorting (Shift) with `aria-sort`; client and server modes (`mode="server"`, `totalCount`, `onQueryChange` with `{ sort, page, pageSize }`); pagination with a rows-per-page select and range; loading (skeleton rows), empty and error states; `density`, `maxHeight` with a sticky header, `locale` and translatable `labels`. Sort, page and page size work controlled or uncontrolled. Emits `datatable.state.onSort`, `onPageChange` and `onPageSizeChange`. Built on `Table`, `Pagination`, `Select` and `Skeleton`, with no new dependency; `Table`'s scroll region now honours a maximum height set by `DataTable`.
