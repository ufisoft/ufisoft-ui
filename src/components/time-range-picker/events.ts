import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { TimeRange } from '.';

export const timeRangePickerEvents = defineEvents(
  { component: 'TimeRangePicker', prefix: 'timerangepicker' },
  {
    'state.onChange': {
      description: 'The start or end time changed: picked, typed, or cleared.',
      payload: payload<{ value: TimeRange; previousValue: TimeRange; source: EventSource }>(),
      fields: {
        value: '{ from, to } — the new range as HH:mm; either end is null while not chosen',
        previousValue: '{ from, to } — the range before the change',
        source: sourceField,
      },
      example: {
        value: { from: '09:00', to: '17:30' },
        previousValue: { from: '09:00', to: null },
        source: { id: 'opening-hours' },
      },
    },
  },
);
