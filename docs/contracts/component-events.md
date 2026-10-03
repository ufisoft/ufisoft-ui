---
id: component-events
scope: 'Component events: every events.ts is registered, documented on the component page and tested; components emit through useEmit, never the global bus.'
read_trigger: 'Open before adding or changing a src/components/*/events.ts, emitting an event from a component, or editing src/events/registry.ts.'
status: active
domain: ui
audience: [maintainers, agents]
keywords:
  [
    event,
    events.ts,
    defineEvents,
    registry,
    eventBus,
    useEmit,
    EventScope,
    ComponentEvents,
    olay,
    event bus,
  ]
related: [public-api, client-directive]
source: 'CONTRIBUTING.md#component-workflow'

rules:
  - id: events-registered
    section: "Don't"
    text: 'Every component events.ts is spread into eventRegistry in src/events/registry.ts.'
    severity: error
    detectors:
      - kind: structure
        params: { check: events-registered, registry: 'src/events/registry.ts' }
    applies_to:
      include_globs: ['src/components/*/events.ts']
      exclude_globs: []
  - id: events-documented
    section: "Don't"
    text: 'A component with events.ts shows them with <ComponentEvents component="…" /> in its MDX page.'
    severity: error
    detectors:
      - kind: structure
        params: { check: events-documented }
    applies_to:
      include_globs: ['src/components/*/events.ts']
      exclude_globs: []
  - id: events-tested
    section: "Don't"
    text: 'Every event a component defines is named in at least one test.'
    severity: error
    detectors:
      - kind: structure
        params: { check: events-tested, tests: 'src/**/*.test.*' }
    applies_to:
      include_globs: ['src/components/*/events.ts']
      exclude_globs: []
  - id: emit-through-use-emit
    section: "Don't"
    text: 'Components emit with useEmit(), never by importing the global eventBus.'
    severity: error
    detectors:
      - kind: eslint
        params: { rule: no-restricted-imports, selector: '**/events/registry' }
    applies_to:
      include_globs: ['src/components/**/*.tsx']
      exclude_globs: ['src/components/**/*.stories.tsx', 'src/components/**/*.test.tsx']
---

# Component events contract

Codified from [CONTRIBUTING.md › Component workflow](../../CONTRIBUTING.md#component-workflow) (step 2, Events) and [API rules](../../CONTRIBUTING.md#api-rules). An event that is not in the registry has no payload type, no console description and no docs; an event that is not on its component page cannot be discovered; an untested event can silently stop firing; and a component that emits on the global `eventBus` directly ignores `EventScope` (so composites emit twice) and `EventBusProvider` (so requests and tests are not isolated).

## Single producer

`src/events/registry.ts` — `eventRegistry`, the single source of truth that the types (`UfiEventMap`), the console logger, Storybook's Event Discovery and every component's `## Events` section are derived from. Each component contributes one `src/components/<name>/events.ts`.

## Caller rules

- Define a component's events in its own `events.ts` with `export const <name>Events = defineEvents({ component, prefix }, { … })`, and add `...<name>Events` to `eventRegistry`. The event names and payload types are checked by TypeScript; this contract checks the wiring around them.
- On the component's MDX page, add `## Events` with `<ComponentEvents component="<Component>" />` (the `component` of `defineEvents`), before `## Accessibility`.
- Name every event (`'<prefix>.<domain>.on<Event>'`) in a test that asserts it is emitted — usually `<name>.events.test.tsx`; related components may share one file.
- Emit with the internal `useEmit()` from `src/events/react.tsx`. It honours `<EventScope silent>` and the nearest `EventBusProvider`.
- `events-tested` matches the quoted name anywhere in `src/**/*.test.*`; it proves the name is exercised, not that every payload field is asserted — reviews still check that.

## Exceptions

None. A component that emits nothing has no `events.ts`, and the rules do not apply to it.

## Don't

- Add an `events.ts` without spreading it into `eventRegistry`. {#events-registered}
- Leave a component's events off its docs page. {#events-documented}
- Define an event that no test names. {#events-tested}
- Import `eventBus` (`src/events/registry`) in a component to emit. {#emit-through-use-emit}
