# Memory policy

Team memory records **decisions** — why something is the way it is — that the code, `git log` and `CONTRIBUTING.md` cannot tell you.

## Recall

Read in this order and stop as soon as you have what you need:

1. [CORE.md](./CORE.md) — always, it is small.
2. [INDEX.md](./INDEX.md) — scan the section of the topic you are working in, and any line whose `paths` match files you are about to change.
3. Only the entries in `entries/` that the index points you to.

Never bulk-read `entries/`.

## Capture test

Record something only if **all three** are true:

1. **It will recur** — someone will face the same question again.
2. **It cannot be derived** — not readable from the code, its comments, `git log`, `CONTRIBUTING.md` or a contract.
3. **Not knowing it is expensive** — getting it wrong costs real rework, a consumer breakage or a wrong release.

Two out of three is not enough.

**Never captured:** work or ticket status, personal preferences, anything a contract or `CONTRIBUTING.md` already says, commit-message material, and speculation that has not become a decision.

## Capture steps

1. **Dedup** — search INDEX.md for the topic; if an entry already covers it, update that entry instead of adding one.
2. **Contradiction check (mandatory)** — read the entries of the same topic. If the new decision contradicts one, set the old entry to `status: superseded` with `superseded_by`, and say so in the new entry's Context.
3. **Write** `entries/YYYY-MM-DD-<slug>.md` in the format below.
4. **Rebuild** INDEX.md (one line under its topic: `- [title](entries/<file>.md) — summary (paths: <globs>)`) and, only if it affects most tasks, CORE.md (respect the 40-line limit).
5. **Announce** it to the user in one line: `Memory: recorded <title> (<topic>).`

## Entry format

```markdown
---
id: <slug>
date: YYYY-MM-DD
topic: <id from topics.yaml>
paths: [] # globs the decision applies to, e.g. ['src/components/spinner/**', 'src/tokens/semantic.css']
status: active # or: superseded
superseded_by: # entry id, when superseded
related: [] # entry ids or contract ids
---

# <Decision as a short statement>

## Context

## Decision

## Rejected alternatives

## Consequences
```

**Rejected alternatives** is never empty: name what was considered and why it lost. If nobody knows, ask before recording.

**`paths`** lets an agent find the entry from the files it is changing, not only from the topic. Leave it empty only for decisions that apply to the whole repo.

## Plan boundaries

| What it is                                    | Where it goes                                    |
| --------------------------------------------- | ------------------------------------------------ |
| An enforced rule (detectable, must not break) | A contract in [`docs/contracts/`](../contracts/) |
| A written contribution rule                   | [`CONTRIBUTING.md`](../../CONTRIBUTING.md)       |
| A decision and its reasons                    | This memory (`entries/`)                         |
| A personal preference or working note         | The agent's own (personal) memory, not the repo  |
| Work status: tickets, deploys, who does what  | The tracker / issue, and `git log`               |

## Rules

- Memory is not a status board. Ticket/deploy status is read live from the tracker and `git log`, never mirrored here. Stale status is worse than no status.
- A durable technical rule goes into a contract (or CONTRIBUTING.md), not into memory. If an entry states a rule the team must follow, that is a signal to open a contract.

## Redaction

Entries are visible to everyone with repository access. Never write secrets, tokens, credentials, connection strings, or customer or personal identifiers into memory.
