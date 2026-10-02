# Contracts

A contract carries the **enforcement** of a rule — scope, detector, exceptions. The rule's wording lives in its `source` (usually [`CONTRIBUTING.md`](../../CONTRIBUTING.md)); a contract links to it and never restates it.

| Contract                                    | Scope                                                                                          | Read when                                                                       | Source                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [component-styling](./component-styling.md) | Visual values in components: semantic tokens only; no hex, raw px, inline style or `:global()` | Editing any `*.module.css`, or adding a value or `style` to a component         | [CONTRIBUTING › Styling rules](../../CONTRIBUTING.md#styling-rules)           |
| [public-api](./public-api.md)               | Every export of `src/components/*/index.tsx` is exported from `src/index.ts`                   | Creating a component, changing a component's exports, or editing `src/index.ts` | [CONTRIBUTING › Component workflow](../../CONTRIBUTING.md#component-workflow) |
| [client-directive](./client-directive.md)   | Component modules that call a hook or `createContext` start with `'use client'`                | Adding a hook call, context or hook file under `src/components/`                | [CONTRIBUTING › API rules](../../CONTRIBUTING.md#api-rules)                   |

## Running

```bash
node scripts/ci/check_contracts.mjs
```

Runs `css-regex` and `structure` detectors; `eslint` detectors run in `pnpm lint` (the checker only verifies their selector is wired into `eslint.config.js`). Exit code `1` on any `error` finding.

## Adding a contract

1. The rule must already exist in `CONTRIBUTING.md` (or come from a real incident) — contracts never invent rules.
2. Find the single producer (the file that owns the thing the rule protects). No producer → no contract.
3. Pick the simplest detector: `eslint` (built-in `no-restricted-syntax` / `no-restricted-imports` / `no-restricted-properties`) for `.ts/.tsx`, `css-regex` for `.module.css`, `structure` for file layout.
4. Run the checker on the codebase and calibrate before setting `severity: error`.
5. Add one row to the table above and at most one line to [`AGENTS.md`](../../AGENTS.md).

## Governance — later

There is no CI yet, so a protected-path guard would run nowhere; none is written. When CI exists, `.github/CODEOWNERS` plus branch protection is the enforcement point, and a guard script can join the gates.

Protected — changes here change the rules, so they need an owner's review:

- Instruction files: `AGENTS.md`, `CLAUDE.md`, `.claude/commands/`
- Written rules: `CONTRIBUTING.md`, `CONTRIBUTING.tr.md`
- Enforcement: `docs/contracts/`, `scripts/ci/` (including the future guard itself), `eslint.config.js`, `team-skills/`
- Memory policy: `docs/memory/POLICY.md`, `docs/memory/topics.yaml`
- Design and API surface: `src/tokens/`, `src/index.ts`
- `.github/CODEOWNERS` itself

Deliberately unprotected — govern the rule, not the record:

- `.changeset/*.md` and `CHANGELOG.md` — release notes written by every change; the changeset gate already checks they exist.
- `docs/memory/entries/`, `INDEX.md`, `CORE.md` — records and derived files; their rules live in the protected `POLICY.md`.
- `src/components/**` — covered by the contracts' detectors, not by review routing.

Conscious trade-off: `src/index.ts` is protected, so every new component's export lines need an owner's review. Public API changes decide the version bump, so this is intended; revisit it if it becomes a bottleneck.
