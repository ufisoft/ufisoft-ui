import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const datePickerEvents = defineEvents(
  { component: 'DatePicker', prefix: 'datepicker' },
  {
    'state.onChange': {
      description:
        'The date changed: picked in the calendar, typed and committed (blur or Enter), or cleared.',
      payload: payload<{ value: Date | null; previousValue: Date | null; source: EventSource }>(),
      fields: {
        value: 'Date | null — the new date at local midnight, null when cleared',
        previousValue: 'Date | null — the date before the change',
        source: sourceField,
      },
      example: {
        value: new Date(2026, 9, 3),
        previousValue: null,
        source: { name: 'publishDate' },
      },
    },
    'state.onOpen': {
      description: 'The calendar opened.',
      payload: payload<{ value: Date | null; source: EventSource }>(),
      fields: { value: 'Date | null — the current date', source: sourceField },
      example: { value: null, source: { name: 'publishDate' } },
    },
    'state.onClose': {
      description: 'The calendar closed: a day was picked, or it was dismissed.',
      payload: payload<{ value: Date | null; source: EventSource }>(),
      fields: { value: 'Date | null — the date after closing', source: sourceField },
      example: { value: new Date(2026, 9, 3), source: { name: 'publishDate' } },
    },
    'state.onClear': {
      description: 'The field was emptied. Emitted right after state.onChange (value: null).',
      payload: payload<{ previousValue: Date; source: EventSource }>(),
      fields: { previousValue: 'Date — the date that was cleared', source: sourceField },
      example: { previousValue: new Date(2026, 9, 3), source: { name: 'publishDate' } },
    },
  },
);
