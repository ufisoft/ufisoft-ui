import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const radioGroupEvents = defineEvents(
  { component: 'RadioGroup', prefix: 'radiogroup' },
  {
    'state.onChange': {
      description: 'The user selected another radio in the group.',
      payload: payload<{ value: string; previousValue: string | null; source: EventSource }>(),
      fields: {
        value: 'string — the selected radio’s value',
        previousValue: 'string | null — the value selected before, null when none was',
        source: sourceField + ' — of the RadioGroup',
      },
      example: { value: 'express', previousValue: 'standard', source: { name: 'shipping' } },
    },
  },
);
