import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { DateRange } from '.';

export const dateRangePickerEvents = defineEvents(
  { component: 'DateRangePicker', prefix: 'daterangepicker' },
  {
    'state.onChange': {
      description: 'Either end of the range changed: picked in the calendar, typed, or cleared.',
      payload: payload<{ value: DateRange; previousValue: DateRange; source: EventSource }>(),
      fields: {
        value: '{ from, to } — the new range; either end is null while not chosen',
        previousValue: '{ from, to } — the range before the change',
        source: sourceField,
      },
      example: {
        value: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) },
        previousValue: { from: new Date(2026, 9, 12), to: null },
        source: { id: 'stay' },
      },
    },
    'state.onOpen': {
      description: 'The calendar opened.',
      payload: payload<{ value: DateRange; source: EventSource }>(),
      fields: { value: '{ from, to } — the current range', source: sourceField },
      example: { value: { from: null, to: null }, source: { id: 'stay' } },
    },
    'state.onClose': {
      description: 'The calendar closed: both ends were picked, or it was dismissed.',
      payload: payload<{ value: DateRange; source: EventSource }>(),
      fields: { value: '{ from, to } — the range after closing', source: sourceField },
      example: {
        value: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) },
        source: { id: 'stay' },
      },
    },
  },
);
