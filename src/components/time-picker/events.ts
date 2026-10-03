import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const timePickerEvents = defineEvents(
  { component: 'TimePicker', prefix: 'timepicker' },
  {
    'state.onChange': {
      description:
        'The time changed: picked from the list, typed and committed (blur or Enter), or cleared.',
      payload: payload<{
        value: string | null;
        previousValue: string | null;
        source: EventSource;
      }>(),
      fields: {
        value: 'string | null — the new time as HH:mm, null when cleared',
        previousValue: 'string | null — the time before the change',
        source: sourceField,
      },
      example: { value: '14:30', previousValue: '09:00', source: { name: 'start' } },
    },
    'state.onOpen': {
      description: 'The list of suggested times opened.',
      payload: payload<{ value: string | null; source: EventSource }>(),
      fields: { value: 'string | null — the current time', source: sourceField },
      example: { value: '09:00', source: { name: 'start' } },
    },
    'state.onClose': {
      description: 'The list of suggested times closed.',
      payload: payload<{ value: string | null; source: EventSource }>(),
      fields: { value: 'string | null — the time after closing', source: sourceField },
      example: { value: '14:30', source: { name: 'start' } },
    },
    'state.onClear': {
      description: 'The field was emptied. Emitted right after state.onChange (value: null).',
      payload: payload<{ previousValue: string; source: EventSource }>(),
      fields: { previousValue: 'string — the time that was cleared, HH:mm', source: sourceField },
      example: { previousValue: '14:30', source: { name: 'start' } },
    },
  },
);
