import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const comboboxEvents = defineEvents(
  { component: 'Combobox', prefix: 'combobox' },
  {
    'state.onChange': {
      description: 'The user picked another option from the list.',
      payload: payload<{
        value: string | null;
        previousValue: string | null;
        source: EventSource;
      }>(),
      fields: {
        value: 'string | null — the picked option’s value',
        previousValue: 'string | null — the value before the change',
        source: sourceField,
      },
      example: { value: 'ist', previousValue: null, source: { name: 'city' } },
    },
    'state.onOpen': {
      description: 'The option list opened.',
      payload: payload<{ value: string | null; source: EventSource }>(),
      fields: { value: 'string | null — the current value', source: sourceField },
      example: { value: null, source: { name: 'city' } },
    },
    'state.onClose': {
      description: 'The option list closed.',
      payload: payload<{ value: string | null; source: EventSource }>(),
      fields: { value: 'string | null — the current value', source: sourceField },
      example: { value: 'ist', source: { name: 'city' } },
    },
  },
);
