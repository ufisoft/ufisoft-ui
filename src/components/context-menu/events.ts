import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const contextMenuEvents = defineEvents(
  { component: 'ContextMenu', prefix: 'contextmenu' },
  {
    'state.onOpen': {
      description: 'The menu opened: right-click, long-press, the Menu key or Shift+F10.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { data: { fileId: 'f-7' } } },
    },
    'state.onClose': {
      description: 'The menu closed: an item was chosen, or it was dismissed.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { data: { fileId: 'f-7' } } },
    },
    'interaction.onSelect': {
      description: 'The user chose an item (click, Enter or Space).',
      payload: payload<{ label: string | undefined; source: EventSource }>(),
      fields: {
        label: 'string | undefined — the item’s textValue, or its text when that is plain text',
        source: sourceField + ' — of the ContextMenuItem',
      },
      example: { label: 'Rename', source: { data: { fileId: 'f-7' } } },
    },
  },
);
