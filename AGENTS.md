# AGENTS.md

Router for coding agents working on `@ufisoft/ui`. It points to where rules live; it does not restate them.

## Where things are

| What                                              | Path                                                                         | Read when                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Written contribution rules (single source)        | [`CONTRIBUTING.md`](./CONTRIBUTING.md)                                       | See the router table below for which section              |
| Public API — the only supported entry point       | [`src/index.ts`](./src/index.ts)                                             | Adding, renaming or removing anything consumers import    |
| Tokens components may use (semantic layer)        | [`src/tokens/semantic.css`](./src/tokens/semantic.css)                       | Writing any `*.module.css`                                |
| Raw values (primitive layer) — not for components | [`src/tokens/primitives.css`](./src/tokens/primitives.css)                   | Only when adding a semantic token                         |
| Architecture principles                           | [`README.md` › Architecture principles](./README.md#architecture-principles) | Before structuring a new component or API                 |
| Contracts (enforced rules + detectors)            | [`docs/contracts/README.md`](./docs/contracts/README.md)                     | Before editing anything a contract's `read_trigger` names |
| Team memory (decisions)                           | [`docs/memory/`](./docs/memory/)                                             | See "Team memory" below                                   |
| Team skills                                       | [`team-skills/`](./team-skills/)                                             | See "Team skills" below                                   |

## Non-negotiable rules

Enforced by `node scripts/ci/check_contracts.mjs` and `pnpm lint`. Details and exceptions live in each contract.

- Component CSS takes values only from `src/tokens/semantic.css` → [component-styling](./docs/contracts/component-styling.md)
- Every component export is also exported from `src/index.ts` → [public-api](./docs/contracts/public-api.md)
- A component module that calls a hook starts with `'use client'` → [client-directive](./docs/contracts/client-directive.md)

## Router table

| Area               | When you touch it                                                      | Read                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| New component      | Creating `src/components/<name>/`                                      | [CONTRIBUTING › Component workflow](./CONTRIBUTING.md#component-workflow) + [public-api](./docs/contracts/public-api.md)     |
| Component API      | Props, `ref`, `className`, defaults, events, `asChild`, `'use client'` | [CONTRIBUTING › API rules](./CONTRIBUTING.md#api-rules) + [client-directive](./docs/contracts/client-directive.md)           |
| Styles             | Any `*.module.css`                                                     | [CONTRIBUTING › Styling rules](./CONTRIBUTING.md#styling-rules) + [component-styling](./docs/contracts/component-styling.md) |
| Tests              | Any `*.test.tsx`                                                       | [CONTRIBUTING › Testing rules](./CONTRIBUTING.md#testing-rules)                                                              |
| Docs               | Any `*.mdx`                                                            | [CONTRIBUTING › Documentation template](./CONTRIBUTING.md#documentation-template)                                            |
| Finishing a change | Before saying "done"                                                   | [CONTRIBUTING › Definition of Done](./CONTRIBUTING.md#definition-of-done)                                                    |
| Versioning         | Anything consumers see (exports, props, defaults, tokens)              | [CONTRIBUTING › Versioning and releases](./CONTRIBUTING.md#versioning-and-releases)                                          |
| Commits            | Committing                                                             | [CONTRIBUTING › Commits and hooks](./CONTRIBUTING.md#commits-and-hooks)                                                      |

## Team skills

- **ship-pilot** (`/ship-pilot`) — before any commit or push: gates, changeset, commit discipline → [`team-skills/ship-pilot/SKILL.md`](./team-skills/ship-pilot/SKILL.md)

## Team memory

Decisions and their reasons — not rules, not status. Full policy: [`docs/memory/POLICY.md`](./docs/memory/POLICY.md).

- **Read** at task start: [`CORE.md`](./docs/memory/CORE.md), then the topic's section in [`INDEX.md`](./docs/memory/INDEX.md), then only the entries it points to. Never bulk-read `entries/`.
- **Capture** only if it recurs, cannot be derived from code/`git log`/CONTRIBUTING, and is expensive not to know — all three.
- **Before writing**: dedup against INDEX.md and check same-topic entries for contradictions (supersede, never silently overwrite).
- **When a task closes**: sweep it once for a decision that passes the test; announce any capture in one line.
- A rule the team must follow → a contract, not memory. Ticket/deploy status → tracker and `git log`, never memory.

## Managing this file

- This file is loaded automatically in every session (via `CLAUDE.md`). Keep it small.
- It stays a router: it says where a rule lives, never what the rule says.
- A new rule → one line in its index (e.g. `docs/contracts/README.md`) + at most one line here.
- No rule text is ever copied into this file — including text from `CONTRIBUTING.md`.
