import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const dropdownMenuEvents = defineEvents(
  { component: 'DropdownMenu', prefix: 'dropdownmenu' },
  {
    'state.onOpen': {
      description: 'The user opened the menu from its trigger.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'page-actions' } },
    },
    'state.onClose': {
      description: 'The menu closed: an item was chosen, or it was dismissed.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'page-actions' } },
    },
    'interaction.onSelect': {
      description: 'The user chose an item (click, Enter or Space).',
      payload: payload<{ label: string | undefined; source: EventSource }>(),
      fields: {
        label: 'string | undefined — the item’s textValue, or its text when that is plain text',
        source: sourceField + ' — of the DropdownMenuItem',
      },
      example: { label: 'Duplicate', source: { data: { pageId: 42 } } },
    },
  },
);
