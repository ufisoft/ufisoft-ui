import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const paginationEvents = defineEvents(
  { component: 'Pagination', prefix: 'pagination' },
  {
    'state.onChange': {
      description: 'The user asked for another page (previous, next or a page number).',
      payload: payload<{ page: number; previousPage: number; source: EventSource }>(),
      fields: {
        page: 'number — the requested page, starting at 1',
        previousPage: 'number — the current page when it was requested',
        source: sourceField,
      },
      example: { page: 3, previousPage: 2, source: { id: 'results' } },
    },
  },
);
