// Contract fixture — deliberately violates the structure rules of docs/contracts/component-events.md:
// not spread into eventRegistry (events-registered), no <ComponentEvents> in an MDX page next to it
// (events-documented), and an event no test names (events-tested).
// check_contracts.selftest.mjs copies it into src/components/ as events.ts.
import { defineEvents, payload } from '../../events/define-events';

export const contractFixtureEvents = defineEvents(
  { component: 'ContractFixture', prefix: 'contractfixture' },
  {
    'state.onFixtureChange': {
      description: 'Never emitted: exists only to trip the contract detectors.',
      payload: payload<{ value: number }>(),
      fields: { value: 'number' },
      example: { value: 1 },
    },
  },
);
