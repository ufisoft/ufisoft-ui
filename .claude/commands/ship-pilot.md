---
description: Run the gates and ship the current change (wrapper for team-skills/ship-pilot)
argument-hint: '[check|ship]'
---

Load the canonical skill `team-skills/ship-pilot/SKILL.md` and apply it in mode `$ARGUMENTS` (default: `check`). Do not work from this summary alone.

Load-bearing rules:

- Run `node team-skills/ship-pilot/scripts/gates.mjs` and report every gate; never weaken a rule to get green (severity, `allow`, `exclude_globs`, detector) — a wrong rule is changed in a separate change.
- Every commit needs a changeset (`pnpm changeset`, or `pnpm changeset --empty` when nothing is released).
- Stage explicit paths only — no `git add -A`, no `git stash`, no `--no-verify`, no force-push, no amending pushed commits.
- Commit to `main` and push it only after the user approves each step (trunk-based for now — see SKILL.md › Branch flow).
- Never run `pnpm release` or `pnpm changeset version`.
