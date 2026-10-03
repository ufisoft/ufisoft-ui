---
'@ufisoft/ui': minor
---

Add `Container`, `Row` and `Col`: `Container` centres page content at a maximum width (`sm`/`md`/`lg`/`xl`/`full`, from the new `--ufi-container-*` tokens) with side padding; `Row` is a 12-column grid with `gap` and `align`; `Col` takes `span` and `start` as one number or per breakpoint (`{ base: 12, md: 6 }`). All three accept `as` for semantic elements. `Stack` docs now point to `Row`/`Col` for two-dimensional layouts.
