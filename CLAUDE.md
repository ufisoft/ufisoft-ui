@AGENTS.md

# Working style

How to work in this repo. What the rules are and where they live: see `AGENTS.md` (imported above).

1. **Think before coding.** State the change, the files it touches and how you will verify it before editing.
   → New component? First check `src/index.ts` — it may already exist or be a composition (`Stack` + `Button`). See [CONTRIBUTING › Before you start](./CONTRIBUTING.md#before-you-start).

2. **Work on evidence.** Read the code you change; never guess a name, prop or token.
   → Token names come from `src/tokens/semantic.css`; a sibling's API from its `src/components/<name>/index.tsx`.
   → Architecture is where agents most often go wrong here (owner's report). Before structuring code, read [README › Architecture principles](./README.md#architecture-principles) and [CONTRIBUTING › API rules](./CONTRIBUTING.md#api-rules).

3. **Simplicity first.** The smallest change that meets the goal.
   → No factories, service layers or per-component architectures; extra files like `use-<name>.ts` only when they clearly help (README › Architecture principles).

4. **Surgical edits.** Touch only what the task needs.
   → One component = one folder `src/components/<name>/`. Outside it, a new component only adds its export lines to `src/index.ts`.
   → Don't reformat or "tidy" unrelated files; the pre-commit hook formats staged files only.

5. **Goal-driven.** Done means [CONTRIBUTING › Definition of Done](./CONTRIBUTING.md#definition-of-done), proven by running it.
   → `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm format:check`, `pnpm changeset status --since=main`.
   → Accessibility: the Storybook _Accessibility_ panel (`pnpm storybook`) is checked by hand — say so if you could not check it.
   → Report what you ran and what failed; never present unrun work as done.
