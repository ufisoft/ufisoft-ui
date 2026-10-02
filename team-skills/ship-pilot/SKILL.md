---
name: ship-pilot
description: >-
  Gets a change in @ufisoft/ui ready to leave the machine: runs every gate, checks the
  changeset, then commits (and pushes a feature branch) with explicit paths. Use when the
  user says "ship it", "is this ready to push?", "run the gates", "commit this", "open it
  for review" or runs /ship-pilot. NOT used for publishing or versioning a release
  (`pnpm release`, `pnpm changeset version`), and not for writing the change itself.
triggers:
  slash: /ship-pilot
modes:
  check: Run the gates and report. Changes nothing.
  ship: check, then commit with explicit paths and push the feature branch — each step only after the user approves it.
---

# ship-pilot

## 1. Gates

Run all of them from the repo root, then read the summary:

```bash
node team-skills/ship-pilot/scripts/gates.mjs
```

The script runs every gate even after a failure and exits `1` if any failed. Report each failure with its output; do not "fix" a gate by weakening it.

| Gate         | Command                                   | What it catches / the trap                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| lint         | `pnpm lint`                               | ESLint incl. jsx-a11y and react-hooks over `.ts/.tsx/.js/.mjs`. Trap: it never reads `*.module.css`.                                                                                                                                                                                                                                                               |
| typecheck    | `pnpm typecheck`                          | `tsc --noEmit` over `src`, `.storybook`, `vite.config.ts`, `eslint.config.js`. Trap: `.mjs` scripts (`scripts/`, `team-skills/`) are outside `tsconfig.json` `include`.                                                                                                                                                                                            |
| test         | `pnpm test`                               | Vitest + Testing Library in jsdom. Trap: `<dialog>` is a shim in `src/test/setup.ts` — real Modal behaviour (focus, Escape, top layer) is not covered.                                                                                                                                                                                                             |
| build        | `pnpm build`                              | Vite library build + `tsc -p tsconfig.build.json` declarations. Trap: tests and stories are excluded from the build's type check, so they only fail in `typecheck`.                                                                                                                                                                                                |
| format:check | `pnpm format:check`                       | Prettier over the whole repo. Trap: also fails on new `.md`/`.mdx`/`.json` files that never went through the pre-commit hook.                                                                                                                                                                                                                                      |
| contracts    | `pnpm check:contracts`                    | `css-regex` and `structure` rules of `docs/contracts/*.md` (tokens, hex, px, `:global`, public exports). Trap: ESLint-backed rules run in `lint`; here it only checks they are wired into `eslint.config.js`. Exceptions go in the contract's `allow`, never in the script.                                                                                        |
| changeset    | `pnpm exec changeset status --since=main` | A committed change with no changeset. Traps: (1) it sees edits to tracked files but **not untracked files** — a new changeset counts only once committed, and a branch of only new files looks clean until committed; run it again after committing; (2) the package root is the repo root, so docs-only commits need one too; (3) it needs a local `main` branch. |
| a11y         | Storybook _Accessibility_ panel           | **Not a gate** — checked by hand in `pnpm storybook`. Say whether you checked it.                                                                                                                                                                                                                                                                                  |

## 2. Changeset discipline

- Anything consumers can see — exports in `src/index.ts`, props, defaults, tokens, styles — needs a changeset: `pnpm changeset`.
- Bump level: [CONTRIBUTING › Versioning and releases](../../CONTRIBUTING.md#versioning-and-releases). While the version is `0.x`, a breaking change is `minor`.
- A change with nothing to release (docs, agent files, scripts): `pnpm changeset --empty`. The gate fails without it.

## 3. Commit discipline

- Stage with an **explicit path list**: `git add <path> <path> …`. Never `git add -A` / `git add .` — list the files and show the user first.
- Never `--no-verify`: the pre-commit hook (lint-staged) is the only formatter run on commit.
- Never force-push, never amend a commit that is already pushed.
- Message: imperative mood, describes the change — [CONTRIBUTING › Commits and hooks](../../CONTRIBUTING.md#commits-and-hooks).

## 4. Branch flow

- `main` + feature branches. Work on a feature branch; do not commit to `main`.
- Push only the feature branch, only after the user approves. Anything beyond that (release branches, tags, merging) → ask the user.

## 5. Release

`pnpm release` builds and publishes to GitHub Packages. **The agent never runs it**, nor `pnpm changeset version` — both are the maintainer's release flow.
