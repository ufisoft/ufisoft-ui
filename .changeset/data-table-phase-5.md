---
'@ufisoft/ui': minor
---

`DataTable` phase 5: row reordering and many rows. `reorderableRows` adds a drag handle to each row — drag it, or pick the row up with Space or Enter, move it with the arrow keys and drop it with Space or Enter (Escape cancels), with every step announced; `onRowReorder` receives `{ row, rowId, targetRowId, position, fromIndex, toIndex }` (exported as `DataTableRowReorder`) and the consumer applies the move. `virtualized` renders only the rows in view inside the `maxHeight` box, with measured row heights (`estimatedRowHeight`, `overscan`), `aria-rowcount` and `aria-rowindex`. Without paging, `hasMore` and `onLoadMore` add a “Load more” button and load near the end of the scroll. Emits `datatable.interaction.onRowReorder` and `datatable.interaction.onLoadMore`.
