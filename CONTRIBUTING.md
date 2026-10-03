# Contributing to UfiSoft UI

**English** · [Türkçe](./CONTRIBUTING.tr.md)

Thanks for helping build the UfiSoft UI Kit. This guide covers how to add or change a component and what “done” means.

## Before you start

- **Is it generic?** The UI Kit has no domain logic. If the component only makes sense in one product (e.g. `OrderStatus`), it belongs in that product.
- **Does it already exist?** Prefer composing existing components (`Stack` + `Button`) over a new one.
- **Discuss the API first** for new components: a short issue with the use cases, proposed props and the native element it renders.

## Component workflow

1. **Create the folder** `src/components/<name>/` (kebab-case) with:

   | File                 | Purpose                         |
   | -------------------- | ------------------------------- |
   | `index.tsx`          | Implementation and public types |
   | `<name>.module.css`  | Styles                          |
   | `<name>.test.tsx`    | Behaviour tests                 |
   | `<name>.stories.tsx` | Stories                         |
   | `<name>.mdx`         | Documentation page              |
   | `events.ts`          | Event definitions (if it emits) |

   Add `use-<name>.ts`, `<name>.types.ts` etc. only when they clearly help. Closely related parts of one component family (e.g. `FormField`, `FormLabel`, `FormMessage`) share one folder.

2. **Implement** following the API rules below.
   - **Events**, only for real state changes or user actions: define them in `events.ts` with `defineEvents`, add one spread line to `src/events/registry.ts`, emit with the internal `useEmit()` right after the matching callback, and wrap UfiSoft components used inside (a calendar button, an inner Modal) in `<EventScope silent>` so only this component emits. Test them in `<name>.events.test.tsx`. See Storybook _Architecture › Event System_.
3. **Style** with semantic tokens only.
4. **Write tests** for user-visible behaviour.
5. **Write stories**: default, variants, sizes, states, edge cases, accessibility.
6. **Document** in MDX (template below).
7. **Export** the component and its public types from `src/index.ts`.
8. **Add a changeset**: `pnpm changeset`.
9. **Verify**: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, and check the Storybook _Accessibility_ panel.

## API rules

- Extend the native element's props: `interface ButtonProps extends ComponentProps<'button'>`.
- `ref` is a regular prop (React 19). Pass it to the root element; if the component also needs the element internally, use `useImperativeHandle`.
- Always merge `className` with `clsx(styles.x, className)` and spread remaining props onto the root.
- Prefer **union props** (`variant: 'primary' | 'secondary'`) over boolean flags (`primary`, `secondary`).
- Keep native behaviour: native `disabled`, `required`, `type`; controlled and uncontrolled usage both work.
- Defaults must be safe: `Button` defaults to `type="button"`.
- Name events after intent: `onOpenChange(open)`, not `onClose` + `onOpen`.
- Use `asChild` (Radix Slot) when a component must render a consumer's element (e.g. router links).
- Form controls call `useFormField(props)` to join a `FormField`.
- Add `'use client'` at the top of modules that use hooks, context or browser APIs.
- No domain names, no app-specific props, no dependency on form libraries or routers.
- Events never replace callbacks: emit next to them, from the same place. Name them `<component>.<state|interaction>.on<Event>`; every payload has `source` (`id`, `name` and the `eventData` prop — components that emit take `EventDataProps`). No events for keystroke-level input or values that may be sensitive (`Input`, `Textarea`), and none invented to fill the pattern.

## Styling rules

- **Semantic tokens only** (`--ufi-color-*`, `--ufi-space-*`, …). No hex values, no raw `px` for spacing, colors, radii, shadows or font sizes. Primitive tokens (`--ufi-blue-600`) are for `semantic.css` only.
  - Exceptions: `0`, `1px` hairlines via `--ufi-border-width`, intrinsic geometry (e.g. a modal width), and percentages.
- **Variants and sizes set local custom properties** (`--_bg`, `--_height`), the base rule reads them. Adding a variant must not touch the base rule.
- Class names that start with a digit or are JS reserved words get a prefix: `size-2xl`, `tone-default`.
- Use logical properties (`padding-inline`, `inline-size`) for RTL readiness.
- Every interactive element has a visible `:focus-visible` style.
- Animations respect `prefers-reduced-motion`. Transitions are disabled globally; meaningful animations (e.g. Spinner) slow down instead of stopping.
- No global CSS in components. `:global()` only for an effect that cannot be scoped (e.g. scroll lock).
- No inline styles in components.

## Testing rules

- Query by **role and accessible name** (`getByRole('button', { name: 'Save' })`). Avoid `getByTestId` and class names.
- Interact with `@testing-library/user-event`, including the keyboard.
- Assert on what the user perceives: visible text, state (`toBeChecked`, `toBeDisabled`, `toBeInvalid`), accessible names and descriptions, callbacks.
- Do not assert on internal state, hooks or CSS classes.
- Cover: default behaviour, keyboard interaction, disabled/loading states, ARIA wiring, `ref` forwarding.

## Documentation template

Every `<name>.mdx` contains these sections, in this order:

```mdx
import { ArgTypes, Canvas, Meta } from '@storybook/addon-docs/blocks';
import * as Stories from './<name>.stories';

<Meta of={Stories} />

# ComponentName

One sentence: what it does.

<Canvas of={Stories.Default} />

## When to use

## When not to use (name the alternative component)

## Props (<ArgTypes of={Stories} /> + notes)

## Variants / Sizes

## States

## Examples (real-world compositions)

## Events (<ComponentEvents component="Name" /> — only for components that emit events)

## Accessibility (semantics, keyboard, ARIA, pitfalls)

## Do / Don't (table)

## Related components
```

Documentation explains **why and when**, not only the props.

## Definition of Done

A component change is done when:

- [ ] It is generic and contains no domain logic.
- [ ] The API follows the rules above and is exported (with its types) from `src/index.ts`.
- [ ] Styles use semantic tokens only; focus, hover, disabled and other states are styled.
- [ ] It works with keyboard only, and the Storybook Accessibility panel shows no violations.
- [ ] Tests cover its behaviour and pass.
- [ ] Its events, if it has any, are in the registry, emitted next to the callbacks and tested.
- [ ] Stories show default, variants, sizes, states and edge cases.
- [ ] The MDX page follows the template.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass.
- [ ] A changeset describes the change for consumers.

## Versioning and releases

We follow [Semantic Versioning](https://semver.org/):

| Bump    | When                                                                             |
| ------- | -------------------------------------------------------------------------------- |
| `major` | Breaking change: removed/renamed export or prop, changed default, removed token. |
| `minor` | New component, prop, variant or token — backwards compatible.                    |
| `patch` | Bug fix or visual fix that doesn't change the API.                               |

While the version is `0.x`, breaking changes bump `minor`.

Release flow (maintainers):

```bash
pnpm changeset version   # bump version, write CHANGELOG.md
# review, commit, merge
pnpm release             # build + publish to GitHub Packages
```

## Commits and hooks

`pnpm install` installs a **pre-commit hook** (simple-git-hooks + lint-staged) that runs ESLint and Prettier on staged files only, so commits stay fast. Type checking and tests are not part of the hook; run them before opening a pull request (and later in CI).

If the hook is missing, run `pnpm exec simple-git-hooks`.

Write commit messages in the imperative mood and describe the change: `Add indeterminate state to Checkbox`.
