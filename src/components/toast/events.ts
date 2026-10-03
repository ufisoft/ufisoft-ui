import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { ToastTone } from '.';

export const toastEvents = defineEvents(
  { component: 'Toast', prefix: 'toast' },
  {
    'state.onOpen': {
      description: 'A toast was shown with toast().',
      payload: payload<{
        id: number;
        tone: ToastTone;
        title: string | undefined;
        source: EventSource;
      }>(),
      fields: {
        id: 'number — the id toast() returned',
        tone: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
        title: 'string | undefined — the title, when it is plain text',
        source: sourceField + ' — data comes from the toast options’ eventData',
      },
      example: { id: 1, tone: 'success', title: 'Page saved', source: {} },
    },
    'state.onClose': {
      description:
        'A toast closed: its time ran out, the user closed or swiped it, or dismiss() was called.',
      payload: payload<{ id: number; source: EventSource }>(),
      fields: { id: 'number — the id toast() returned', source: sourceField },
      example: { id: 1, source: {} },
    },
    'interaction.onAction': {
      description: 'The user pressed the toast’s action button, e.g. Undo.',
      payload: payload<{ id: number; label: string; source: EventSource }>(),
      fields: {
        id: 'number — the id toast() returned',
        label: 'string — the action’s label',
        source: sourceField,
      },
      example: { id: 1, label: 'Undo', source: { data: { pageId: 42 } } },
    },
  },
);
