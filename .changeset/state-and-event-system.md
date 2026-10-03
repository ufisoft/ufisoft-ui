---
'@ufisoft/ui': minor
---

Add state management and a typed event system.

- **State:** `createStore` (`getState`, `setState`, `subscribe`) and `useStore(store, selector?, isEqual?)` with `shallowEqual`. Framework-independent core, React adapter on `useSyncExternalStore`.
- **Events:** `eventBus` (global) and `createEventBus` with `emit`, `on`, `once`, `off`, `onAny`, `setDebug` and `clear`; `EventBusProvider`, `useEventBus` and `useEventListener` for React. Payloads are typed by event name (`UfiEventMap`, `UfiEventName`, `UfiEventPayload`). In development every event is logged to the console as `[UfiSoft Event] <name>`; production builds log nothing.
- **Registry:** `defineEvents` and `payload` define events once (description, payload fields, example); `eventRegistry` lists every component event and feeds the types, the console and Storybook's new _Architecture_ pages (State Management, Event System, Event Discovery, Event Playground).
- **Component events**, emitted next to the existing callbacks (which are unchanged): Button, IconButton, Checkbox, RadioGroup, Switch, Select, Combobox, DatePicker, DateRangePicker, TimePicker, TimeRangePicker, FileUpload, Toast, Modal, Drawer, Popover, DropdownMenu, ContextMenu, Tabs, Accordion, Pagination and FilePreview. Each of them takes a new `eventData` prop (Toast: an `eventData` option), passed to listeners as `payload.source.data`.
- `Button`, `IconButton` and `Pagination` now start with `'use client'`.
