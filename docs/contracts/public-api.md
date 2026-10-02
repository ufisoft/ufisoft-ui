---
id: public-api
scope: 'Everything exported from a component folder entry (src/components/<name>/index.tsx) must also be exported from src/index.ts.'
read_trigger: 'Open when creating a component, adding or renaming an export (component, prop type, union type, hook) in src/components/*/index.tsx, or editing src/index.ts.'
status: active
domain: ui
audience: [maintainers, agents]
keywords:
  [public api, export, index.ts, entry point, deep import, dışa aktarım, genel api, giriş noktası]
related: [component-styling, client-directive]
source: 'CONTRIBUTING.md#component-workflow'

rules:
  - id: component-exported-from-index
    section: "Don't"
    text: 'Every export of src/components/*/index.tsx is re-exported from src/index.ts.'
    severity: error
    detectors:
      - kind: structure
        params: { check: public-exports, entry: 'src/index.ts' }
    applies_to:
      include_globs: ['src/components/*/index.tsx']
      exclude_globs: []
---

# Public API contract

Codified from [CONTRIBUTING.md › Component workflow](../../CONTRIBUTING.md#component-workflow) (step 7) and [Definition of Done](../../CONTRIBUTING.md#definition-of-done). Consumers may only import from `@ufisoft/ui` (`dist/index.js`, built from `src/index.ts`); a component or type missing there cannot be used at all.

## Single producer

`src/index.ts` — the only public entry point (`package.json` `exports["."]`).

## Caller rules

- A new component adds its export lines to `src/index.ts` in the same change, grouped by its Storybook category.
- Removing or renaming an export is a breaking change — bump level per [CONTRIBUTING › Versioning and releases](../../CONTRIBUTING.md#versioning-and-releases).
- Internal helpers stay out of `index.tsx` (e.g. `form-field/use-form-field.ts` keeps `FormFieldContext` internal).

## Don't

- Export something from `src/components/<name>/index.tsx` that `src/index.ts` does not export. {#component-exported-from-index}
