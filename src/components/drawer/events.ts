import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { DrawerSide } from '.';

export const drawerEvents = defineEvents(
  { component: 'Drawer', prefix: 'drawer' },
  {
    'state.onOpen': {
      description: 'The drawer opened (its open prop became true).',
      payload: payload<{ side: DrawerSide; source: EventSource }>(),
      fields: {
        side: "'start' | 'end' | 'bottom' — the edge it is attached to",
        source: sourceField,
      },
      example: { side: 'end', source: { id: 'filters' } },
    },
    'state.onClose': {
      description: 'The drawer closed (its open prop became false).',
      payload: payload<{ side: DrawerSide; source: EventSource }>(),
      fields: {
        side: "'start' | 'end' | 'bottom' — the edge it is attached to",
        source: sourceField,
      },
      example: { side: 'end', source: { id: 'filters' } },
    },
  },
);
