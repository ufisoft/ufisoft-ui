---
name: ship-pilot
description: >-
  Gets a change in @ufisoft/ui ready to leave the machine: runs every gate, checks the
  changeset, then commits (and pushes) with explicit paths. Use when the
  user says "ship it", "is this ready to push?", "run the gates", "commit this", "open it
  for review" or runs /ship-pilot. NOT used for publishing or versioning a release
  (`pnpm release`, `pnpm changeset version`), and not for writing the change itself.
triggers:
  slash: /ship-pilot
modes:
  check: Run the gates and report. Changes nothing.
  ship: check, then commit with explicit paths and push `main` — each step only after the user approves it.
---

# ship-pilot

## 1. Gates

Run all of them from the repo root, then read the summary:

```bash
node team-skills/ship-pilot/scripts/gates.mjs
```

The script runs every gate even after a failure and exits `1` if any failed. Report each failure with its output; do not "fix" a gate by weakening it.

| Gate         | Command                                          | What it catches / the trap                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint         | `pnpm lint`                                      | ESLint incl. jsx-a11y and react-hooks over `.ts/.tsx/.js/.mjs`. Trap: it never reads `*.module.css`.                                                                                                                                                                                                                                                                                                                                |
| typecheck    | `pnpm typecheck`                                 | `tsc --noEmit` over `src`, `.storybook`, `vite.config.ts`, `eslint.config.js`. Trap: `.mjs` scripts (`scripts/`, `team-skills/`) are outside `tsconfig.json` `include`.                                                                                                                                                                                                                                                             |
| test         | `pnpm test`                                      | Vitest + Testing Library in jsdom. Trap: `<dialog>` is a shim in `src/test/setup.ts` — real Modal behaviour (focus, Escape, top layer) is not covered.                                                                                                                                                                                                                                                                              |
| build        | `pnpm build`                                     | Vite library build + `tsc -p tsconfig.build.json` declarations. Trap: tests and stories are excluded from the build's type check, so they only fail in `typecheck`.                                                                                                                                                                                                                                                                 |
| format:check | `pnpm format:check`                              | Prettier over the whole repo. Trap: also fails on new `.md`/`.mdx`/`.json` files that never went through the pre-commit hook.                                                                                                                                                                                                                                                                                                       |
| contracts    | `pnpm check:contracts`                           | `css-regex` and `structure` rules of `docs/contracts/*.md` (tokens, hex, px, `:global`, public exports). Trap: ESLint-backed rules run in `lint`; here it only checks they are wired into `eslint.config.js`. Exceptions go in the contract's `allow`, never in the script.                                                                                                                                                         |
| detectors    | `pnpm check:contracts:selftest`                  | Every contract rule still fires on `scripts/ci/contract-fixtures/` — catches a broken regex, selector or parser that would leave a gate silently green. Trap: it writes a temporary `src/components/zz-contract-fixture/`; if a run is interrupted, delete that folder before the next one.                                                                                                                                         |
| changeset    | `pnpm exec changeset status --since=origin/main` | A committed change with no changeset. Traps: (1) it sees edits to tracked files but **not untracked files** — a new changeset counts only once committed, and a branch of only new files looks clean until committed; run it again after committing; (2) the package root is the repo root, so docs-only commits need one too; (3) it compares with `origin/main` — `git fetch` first, or a stale remote ref hides or adds commits. |
| a11y         | Storybook _Accessibility_ panel                  | **Not a gate** — checked by hand in `pnpm storybook`. Say whether you checked it.                                                                                                                                                                                                                                                                                                                                                   |

### When a gate is red

- **Never weaken a rule to get green** — no lowering `severity`, no new `allow`/`exclude_globs` entry, no detector edit to silence a finding. If the rule itself is wrong, change the contract with its reason in a separate change, reviewed through CODEOWNERS.
- **A finding in a file you touched but not on your line** is a hidden violation: fix it. Do not revert your intended change to make the finding disappear.

## 2. Changeset discipline

- Anything consumers can see — exports in `src/index.ts`, props, defaults, tokens, styles — needs a changeset: `pnpm changeset`.
- Bump level: [CONTRIBUTING › Versioning and releases](../../CONTRIBUTING.md#versioning-and-releases). While the version is `0.x`, a breaking change is `minor`.
- A change with nothing to release (docs, agent files, scripts): `pnpm changeset --empty`. The gate fails without it.

## 3. Commit discipline

- Stage with an **explicit path list**: `git add <path> <path> …`. Never `git add -A` / `git add .` — list the files and show the user first.
- Never `--no-verify`: the pre-commit hook (lint-staged) is the only formatter run on commit.
- Never `git stash`: in a checkout that another session also uses, it swallows that session's unfinished work.
- Never force-push, never amend a commit that is already pushed. A non-fast-forward rejection means fetch and rebuild on top, not force.
- Message: imperative mood, describes the change — [CONTRIBUTING › Commits and hooks](../../CONTRIBUTING.md#commits-and-hooks).

## 4. Branch flow

**Current phase: trunk-based.** While the library is in early development, commit directly to `main` — no feature branches, no pull requests. The team switches back to feature branches + PRs once the library matures; this section changes then.

- Before committing: `git fetch` and make sure `main` is not behind `origin/main` (`git status -sb`). If it is, `git pull --ff-only` first.
- Push `main` only after the user approves. A non-fast-forward rejection means `git pull --rebase` (your unpushed commits only) and run the gates again — never force.
- Anything beyond that (release branches, tags) → ask the user.
- No issue tracker is used, so there is no claim step before starting work.
- **More than one agent session (or your editor) working in this checkout at the same time?** Work in an isolated worktree on a short-lived branch, or you may commit someone else's half-done work or onto a stale tip. Bring it to `main` with a fast-forward:

  ```bash
  git worktree add ../ufisoft-ui-wt-<topic> -b wt/<topic> origin/main
  # make and commit the change there, then from the main checkout:
  git merge --ff-only wt/<topic>
  git worktree remove ../ufisoft-ui-wt-<topic> && git branch -d wt/<topic>
  ```

## 5. Release

`pnpm release` builds and publishes to GitHub Packages. **The agent never runs it**, nor `pnpm changeset version` — both are the maintainer's release flow.
