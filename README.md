# UfiSoft UI

**English** · [Türkçe](./README.tr.md)

`@ufisoft/ui` is the shared React component library for UfiSoft products — UfiSoft CMS, UfiSoft Frontend and future applications.

```tsx
import '@ufisoft/ui/styles.css';
import { Button, FormField, FormLabel, Input, Modal } from '@ufisoft/ui';
```

## Why it exists

Every UfiSoft product needs the same buttons, form controls and overlays. Building them once gives:

- **Consistency** — one visual language across products, driven by design tokens.
- **Accessibility built in** — keyboard support, focus management and ARIA wiring solved once.
- **Independence** — no dependency on a heavy UI framework (MUI, Ant Design, Chakra…), a form library or a router.

The library contains **only generic UI primitives**. Domain components such as `ProductCard`, `OrderStatus` or `UserManagement` belong in the applications and are built _from_ these primitives.

## Tech stack

| Area        | Choice                                                            |
| ----------- | ----------------------------------------------------------------- |
| Language    | TypeScript (strict)                                               |
| UI          | React 19                                                          |
| Styling     | CSS Modules + CSS custom properties (design tokens)               |
| Build       | Vite (library mode, ESM, per-module output)                       |
| Docs & dev  | Storybook (MDX docs + accessibility addon)                        |
| Tests       | Vitest + React Testing Library + jsdom                            |
| Quality     | ESLint (incl. jsx-a11y) + Prettier + simple-git-hooks/lint-staged |
| Releases    | Changesets (Semantic Versioning) → GitHub Packages                |
| Package mgr | pnpm                                                              |

Runtime dependencies are deliberately minimal: `clsx` (class names) and `@radix-ui/react-slot` (the `asChild` pattern).

## Development setup

Requirements: **Node.js ≥ 22** and **pnpm** (version pinned in `package.json` → `packageManager`; `corepack enable` picks it up).

```bash
pnpm install       # also installs the git pre-commit hook
pnpm storybook     # http://localhost:6006
```

## Commands

| Command                | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `pnpm storybook`       | Start Storybook — the main development environment.        |
| `pnpm test`            | Run unit tests once.                                       |
| `pnpm test:watch`      | Run tests in watch mode.                                   |
| `pnpm lint`            | Lint all files (ESLint).                                   |
| `pnpm typecheck`       | Type-check the project (`tsc --noEmit`).                   |
| `pnpm format`          | Format all files (Prettier). `format:check` only verifies. |
| `pnpm build`           | Build the library into `dist/`.                            |
| `pnpm build-storybook` | Build static Storybook into `storybook-static/`.           |
| `pnpm changeset`       | Describe a change for the next release.                    |
| `pnpm release`         | Build and publish pending releases (maintainers).          |

## Project structure

```text
ufisoft-ui/
├── .changeset/              Changesets config and pending release notes
├── .storybook/              Storybook configuration
├── src/
│   ├── components/
│   │   └── button/
│   │       ├── index.tsx            implementation (public exports)
│   │       ├── button.module.css    styles (semantic tokens only)
│   │       ├── button.test.tsx      behaviour tests
│   │       ├── button.stories.tsx   stories: states, variants, edge cases
│   │       └── button.mdx           documentation page
│   ├── tokens/
│   │   ├── primitives.css   raw values  (--ufi-blue-600, --ufi-space-4)
│   │   ├── semantic.css     roles       (--ufi-color-action-primary-bg, --ufi-space-md)
│   │   └── index.ts         JS-side tokens (breakpoints, types)
│   ├── styles/              global CSS: tokens + reset + base (→ dist/styles.css)
│   ├── docs/                Storybook pages: Introduction, Tokens
│   ├── test/setup.ts        test environment setup
│   └── index.ts             public API — the only supported entry point
└── dist/                    build output (git-ignored)
```

Component folders are flat; categories (Foundations, Actions, Forms, Feedback, Overlay) exist only as Storybook titles. A folder may contain extra files such as `use-*.ts` or `*.types.ts` when they earn their place.

### Current components

| Category    | Components                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Foundations | `Heading`, `Text`, `Label`, `Stack`                                                             |
| Actions     | `Button`, `IconButton`                                                                          |
| Forms       | `FormField`, `FormLabel`, `FormDescription`, `FormMessage`, `useFormField`, `Input`, `Checkbox` |
| Feedback    | `Alert`, `Spinner`                                                                              |
| Overlay     | `Modal`                                                                                         |

## Architecture principles

- **Generic, not domain-specific.** No business logic. `Button` knows nothing about the CMS.
- **Native first.** Components render the native element, accept all of its props and forward `ref` (React 19 ref-as-prop). Platform behaviour is preferred over re-implementation — `Modal` is a native `<dialog>`, `Checkbox` is a real `<input type="checkbox">`.
- **Accessible by default.** Semantic HTML, keyboard support, visible focus, correct ARIA. Not an add-on.
- **Tokens, not values.** Primitive → semantic → component. Components use semantic tokens only; theming overrides the semantic layer.
- **Composable, small APIs.** `FormField` + `Input` instead of an `Input` with `label`, `error`, `hint` props. Union types (`variant`, `size`) instead of boolean flags.
- **Open for extension.** Variants set local CSS custom properties, so a new variant never edits the base rule. `className` is always merged. `asChild` and `useFormField` let consumers bring their own elements.
- **No lock-in.** No form library, router or icon set is required.
- **No premature abstraction.** No factories, service layers or per-component architectures. Add a file or an abstraction when a second real use case appears.

### Dependencies

Before adding one, ask: _does it solve a real problem we shouldn't solve ourselves?_ Mature libraries are welcome for hard problems (positioning, date picking, virtualization, drag & drop, rich text). A UI framework as the foundation is not.

## Storybook

Storybook is both the development environment and the documentation site. Each component has:

- **Stories** (`*.stories.tsx`) — default, variants, sizes, states, edge cases, accessibility examples.
- **A docs page** (`*.mdx`) — what it does, when to use / not use, props, variants, states, accessibility, examples, do / don't, related components.

The accessibility addon runs axe on every story; violations show in the _Accessibility_ panel.

## Testing

Tests describe **user-visible behaviour**, not implementation: query by role and accessible name, interact with `user-event`, assert on what the user would perceive.

```tsx
await user.click(screen.getByRole('button', { name: 'Save' }));
expect(onSave).toHaveBeenCalledOnce();
```

jsdom does not implement `<dialog>`; `src/test/setup.ts` adds a minimal shim. Real dialog behaviour (focus, Escape, top layer) is verified in Storybook.

## Build

`pnpm build` produces:

```text
dist/
├── index.js, index.d.ts     public entry
├── components/**            one ES module + .d.ts per source module (tree-shakeable)
└── styles.css               tokens, reset, base and all component styles
```

- **ESM only**, `sideEffects` limited to CSS, React as a peer dependency.
- Modules that use hooks keep their `'use client'` directive for React Server Components (Next.js).
- Base styles live in low-priority cascade layers (`ufi-reset`, `ufi-base`), so application CSS wins without specificity battles.

## Using the package (GitHub Packages)

`@ufisoft/ui` is **private** and published to GitHub Packages; members of the `ufisoft` GitHub organization can install it.

1. Create a GitHub personal access token (classic) with the `read:packages` scope.
2. In the consuming project, add an `.npmrc` (never commit the token itself):

   ```ini
   @ufisoft:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. Expose the token as `GITHUB_TOKEN` in your shell or CI, then:

   ```bash
   pnpm add @ufisoft/ui
   ```

4. Import the stylesheet once at the app root: `import '@ufisoft/ui/styles.css';`

Only the exports of `src/index.ts` are public API. Deep imports and generated class names (`ufi-button-x1y2z`) are internal and may change in any release; customise through `className` and semantic tokens.

## Publishing

Versioning follows **Semantic Versioning** via Changesets:

1. Each change that affects consumers includes a changeset (`pnpm changeset`).
2. A maintainer runs `pnpm changeset version` — bumps the version and writes `CHANGELOG.md`.
3. After review and merge, a maintainer with a token that has `write:packages` runs `pnpm release`.

`publishConfig.registry` points to GitHub Packages and `access` is `restricted`, so the package cannot be published to the public npm registry by accident. The license is `UNLICENSED` (proprietary).

The project is structured so that this flow can later move into GitHub Actions without changes.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the component workflow, the Definition of Done and conventions.
