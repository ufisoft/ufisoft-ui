import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const tabsEvents = defineEvents(
  { component: 'Tabs', prefix: 'tabs' },
  {
    'state.onChange': {
      description: 'The user selected another tab (click, arrow keys or Enter).',
      payload: payload<{ value: string; previousValue: string | null; source: EventSource }>(),
      fields: {
        value: 'string — the selected tab’s value',
        previousValue: 'string | null — the tab selected before, null when none was',
        source: sourceField,
      },
      example: { value: 'seo', previousValue: 'content', source: { id: 'page-editor' } },
    },
  },
);
