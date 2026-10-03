---
id: component-styling
scope: 'Where a component gets its visual values from: semantic tokens in its own CSS Module — not primitives, literals, inline styles or global selectors.'
read_trigger: 'Open before editing any src/components/**/*.module.css, adding a style prop or attribute in a component, or adding a color, size, spacing or shadow value to a component.'
status: active
domain: ui
audience: [maintainers, agents]
keywords:
  [
    token,
    semantic token,
    primitive,
    hex,
    px,
    inline style,
    global,
    css modules,
    renk,
    boyut,
    stil,
    tema,
    theming,
  ]
related: [public-api]
source: 'CONTRIBUTING.md#styling-rules'

rules:
  - id: semantic-tokens-only
    section: "Don't"
    text: 'Component CSS only uses --ufi-* tokens defined in src/tokens/semantic.css.'
    severity: error
    detectors:
      - kind: css-regex
        params: { pattern: 'var\(\s*(--ufi-[\w-]+)', allowed_from: 'src/tokens/semantic.css' }
    applies_to:
      include_globs: ['src/components/**/*.module.css']
      exclude_globs: []
  - id: no-hex-color
    section: "Don't"
    text: 'No hex color literals in component CSS.'
    severity: error
    detectors:
      - kind: css-regex
        params: { pattern: '#[0-9a-fA-F]{3,8}\b' }
    applies_to:
      include_globs: ['src/components/**/*.module.css']
      exclude_globs: []
  - id: no-raw-px
    section: "Don't"
    text: 'No raw px values in component CSS (0 and percentages are fine).'
    severity: error
    detectors:
      - kind: css-regex
        params:
          pattern: '(?<![\w.])(?!0+(?:\.0+)?px\b)\d*\.?\d+px\b'
          allow:
            - { file: 'src/components/spinner/spinner.module.css', match: 'inline-size: 1px' }
            - { file: 'src/components/spinner/spinner.module.css', match: 'block-size: 1px' }
            - { file: 'src/components/spinner/spinner.module.css', match: 'margin: -1px' }
    applies_to:
      include_globs: ['src/components/**/*.module.css']
      exclude_globs: []
  - id: no-global-selector
    section: "Don't"
    text: 'No :global() selectors in component CSS except the listed, unscopable ones.'
    severity: error
    detectors:
      - kind: css-regex
        params:
          pattern: ':global\b'
          allow:
            - {
                file: 'src/components/modal/modal.module.css',
                match: ':global(html):has(.dialog[open])',
              }
    applies_to:
      include_globs: ['src/components/**/*.module.css']
      exclude_globs: []
  - id: no-inline-style
    section: "Don't"
    text: 'No style prop on elements rendered by a component, except an object literal of local --_* custom properties.'
    severity: error
    detectors:
      - kind: eslint
        params:
          {
            rule: no-restricted-syntax,
            selector: 'JSXAttribute[name.name="style"] > :not(JSXIdentifier, JSXExpressionContainer)',
          }
      - kind: eslint
        params:
          {
            rule: no-restricted-syntax,
            selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > :not(ObjectExpression)',
          }
      - kind: eslint
        params:
          {
            rule: no-restricted-syntax,
            selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression > :not(Property[key.value=/^--_/])',
          }
    applies_to:
      include_globs: ['src/components/**/*.tsx']
      exclude_globs: ['src/components/**/*.stories.tsx', 'src/components/**/*.test.tsx']
---

# Component styling contract

Codified from [CONTRIBUTING.md › Styling rules](../../CONTRIBUTING.md#styling-rules). A component that bypasses semantic tokens ignores theming in every consumer app, an inline style overrides the consumer's `className`, and a `:global()` rule leaks into the consumer's page.

## Single producer

`src/tokens/semantic.css` — the only source of values a component may use. New values are added there (backed by `src/tokens/primitives.css`), never in a component.

## Caller rules

- Read the token list in `src/tokens/semantic.css` before writing CSS; if no token fits, add a semantic token first — see [CONTRIBUTING › Styling rules](../../CONTRIBUTING.md#styling-rules).
- Variants and sizes set local `--_*` properties; that pattern is described in the same section.
- Stories (`*.stories.tsx`) are not components and may use inline styles for demo layout.
- A value only known at runtime (a column width the user dragged, a pinned column's offset, a virtual list's height) goes to the CSS Module as a local custom property: `style={{ '--_width': `${width}px` }}`, read by `inline-size: var(--_width)`. Only `--_*` keys in an object literal pass the rule: they set no CSS property themselves, so the consumer's `className` still wins, and the markup is complete on the server. `src/css-custom-properties.d.ts` types them.

## Exceptions

Each exception is listed in the rule's `allow` with the exact declaration, scoped to one file. Add new ones the same way, with a reason here.

| Rule                 | File                                        | Allowed                                               | Reason                                                                                                                                                 |
| -------------------- | ------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-raw-px`          | `src/components/spinner/spinner.module.css` | `inline-size: 1px`, `block-size: 1px`, `margin: -1px` | Visually-hidden label technique: a 1px box keeps the text in the accessibility tree. Intrinsic geometry, an exception in CONTRIBUTING › Styling rules. |
| `no-global-selector` | `src/components/modal/modal.module.css`     | `:global(html):has(.dialog[open])`                    | Page scroll lock while a modal is open — the `html` element cannot be scoped.                                                                          |

## Don't

- Use a primitive (`--ufi-blue-600`, `--ufi-space-4`) or an undefined `--ufi-*` name in component CSS. {#semantic-tokens-only}
- Write a hex color in component CSS. {#no-hex-color}
- Write a raw `px` value in component CSS — including `1px` hairlines, which use `--ufi-border-width`. {#no-raw-px}
- Add a `:global()` selector without adding it to this rule's `allow` list with a reason. {#no-global-selector}
- Pass `style` to an element a component renders — other than an object literal of local `--_*` custom properties. {#no-inline-style}
