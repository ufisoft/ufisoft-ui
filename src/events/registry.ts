/**
 * Every event UfiSoft UI components emit, and the shared bus they emit on. A component that
 * emits events defines them in its own folder (`<name>/events.ts`) and adds one line here.
 */

import { accordionEvents } from '../components/accordion/events';
import { buttonEvents } from '../components/button/events';
import { checkboxEvents } from '../components/checkbox/events';
import { comboboxEvents } from '../components/combobox/events';
import { contextMenuEvents } from '../components/context-menu/events';
import { dataTableEvents } from '../components/data-table/events';
import { datePickerEvents } from '../components/date-picker/events';
import { dateRangePickerEvents } from '../components/date-range-picker/events';
import { drawerEvents } from '../components/drawer/events';
import { dropdownMenuEvents } from '../components/dropdown-menu/events';
import { filePreviewEvents } from '../components/file-preview/events';
import { fileUploadEvents } from '../components/file-upload/events';
import { iconButtonEvents } from '../components/icon-button/events';
import { modalEvents } from '../components/modal/events';
import { paginationEvents } from '../components/pagination/events';
import { popoverEvents } from '../components/popover/events';
import { radioGroupEvents } from '../components/radio/events';
import { selectEvents } from '../components/select/events';
import { switchEvents } from '../components/switch/events';
import { tabsEvents } from '../components/tabs/events';
import { timePickerEvents } from '../components/time-picker/events';
import { timeRangePickerEvents } from '../components/time-range-picker/events';
import { toastEvents } from '../components/toast/events';
import type { EventMapOf } from './define-events';
import { createEventBus } from './event-bus';

/** Grouped like the Storybook sidebar: actions, forms, feedback, overlay, navigation, data display. */
export const eventRegistry = {
  ...buttonEvents,
  ...iconButtonEvents,
  ...checkboxEvents,
  ...radioGroupEvents,
  ...switchEvents,
  ...selectEvents,
  ...comboboxEvents,
  ...datePickerEvents,
  ...dateRangePickerEvents,
  ...timePickerEvents,
  ...timeRangePickerEvents,
  ...fileUploadEvents,
  ...toastEvents,
  ...modalEvents,
  ...drawerEvents,
  ...popoverEvents,
  ...dropdownMenuEvents,
  ...contextMenuEvents,
  ...tabsEvents,
  ...accordionEvents,
  ...paginationEvents,
  ...dataTableEvents,
  ...filePreviewEvents,
};

/** Event name → payload type, for every event of UfiSoft UI. */
export type UfiEventMap = EventMapOf<typeof eventRegistry>;
export type UfiEventName = keyof UfiEventMap;
export type UfiEventPayload<N extends UfiEventName> = UfiEventMap[N];

/**
 * The bus UfiSoft UI components emit on, unless an `EventBusProvider` supplies another.
 * It logs every event to the console in development.
 *
 * On the server (Next.js), subscribe inside effects or event handlers, not at module scope:
 * this instance is shared by every request.
 */
export const eventBus = createEventBus({ registry: eventRegistry });
