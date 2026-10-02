---
id: client-directive
scope: "Component source modules that call a React hook or createContext start with the 'use client' directive."
read_trigger: 'Open when adding a hook call (useState, useEffect, useId, use…), createContext or a context provider to a file under src/components/, or creating a new hook file there.'
status: active
domain: ui
audience: [maintainers, agents]
keywords:
  [use client, directive, server components, rsc, next.js, hook, context, istemci, sunucu bileşeni]
related: [public-api]
source: 'CONTRIBUTING.md#api-rules'

rules:
  - id: use-client-for-hooks
    section: "Don't"
    text: "A component module that calls a hook or createContext starts with 'use client'."
    severity: error
    detectors:
      - kind: eslint
        params:
          {
            rule: no-restricted-syntax,
            selector: 'Program:not(:has(ExpressionStatement[directive="use client"])) CallExpression:matches([callee.name=/^(use|use[A-Z][A-Za-z0-9]*|createContext)$/], [callee.property.name=/^(use|use[A-Z][A-Za-z0-9]*|createContext)$/])',
          }
    applies_to:
      include_globs: ['src/components/**/*.ts', 'src/components/**/*.tsx']
      exclude_globs: ['src/components/**/*.stories.tsx', 'src/components/**/*.test.tsx']
---

# Client directive contract

Codified from [CONTRIBUTING.md › API rules](../../CONTRIBUTING.md#api-rules). The library build keeps each module's `'use client'` directive (`preserveModules`); a hook module without it fails to render when a Next.js consumer imports it from a Server Component.

## Single producer

Each module's own first statement. The build (`vite.config.ts`, `preserveModules: true`) emits one output file per source module and carries the directive through.

## Caller rules

- Put `'use client'` on the module that calls the hook — the directive does not propagate to modules that merely import it.
- Modules without hooks (e.g. `button/index.tsx`, which only renders `Spinner`) stay without it so they remain usable in Server Components.
- Browser APIs without hooks are not detected; follow [CONTRIBUTING › API rules](../../CONTRIBUTING.md#api-rules) by hand.

## Don't

- Call a hook or `createContext` in a component module that does not start with `'use client'`. {#use-client-for-hooks}
