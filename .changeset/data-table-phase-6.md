---
'@ufisoft/ui': minor
---

`DataTable` phase 6: inline cell editing and the ARIA grid keyboard model. A column's `editor` (`text`, `number`, `select`, `date`, each with `required` and `validate`) makes its cells editable when the table has `onCellEdit`; `editable(row)` limits it. Enter, F2, typing or double-click opens the editor; Enter or Tab saves, Escape cancels. `onCellEdit` receives `{ row, rowId, columnId, value, previousValue }` (`DataTableCellEdit`) and may return or resolve with an error message, which keeps the editor open. With an editor, or `cellNavigation`, the table becomes a `role="grid"` with one tab stop and arrow, Home/End, Ctrl+Home/End and PageUp/PageDown navigation between cells. Emits `datatable.interaction.onCellEdit` (without the value).
