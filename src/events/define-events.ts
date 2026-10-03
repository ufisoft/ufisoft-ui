/**
 * Event definitions: the single source of truth for an event's name, payload type, description,
 * payload fields and example. Types (the event map), the console logger, Storybook's Event
 * Discovery and the component docs are all derived from these definitions.
 */

/**
 * Who emitted an event: the component's own `id` and `name` props and its `eventData` prop.
 * Generated ids (useId, FormField) are left out: they identify nothing for a listener.
 */
export interface EventSource {
  id?: string;
  name?: string;
  /** Whatever the application passed in `eventData`, e.g. a record id. */
  data?: unknown;
}

/** Props of every component that emits events. */
export interface EventDataProps {
  /** Passed to listeners as `payload.source.data`, e.g. the id of the record this control edits. */
  eventData?: unknown;
}

/**
 * `state`: a value or open state changed. `interaction`: the user did something that does not
 * change the component's state (chose a menu item, clicked a button).
 */
export type EventDomain = 'state' | 'interaction';

/** The part after the component prefix: `state.onChange`, `interaction.onClick`. */
export type EventKey = `${EventDomain}.on${Capitalize<string>}`;

declare const payloadType: unique symbol;

/** Carries a payload type at the type level only; at runtime it is an empty object. */
export interface PayloadType<T> {
  readonly [payloadType]?: T;
}

/** Declares an event's payload type: `payload: payload<{ value: Date | null }>()`. */
export function payload<T extends object>(): PayloadType<T> {
  return {};
}

export interface EventDefinition<T> {
  /** When the event is emitted, in one sentence. */
  description: string;
  payload: PayloadType<T>;
  /** One line per payload field: its type and meaning. Must list exactly the payload's keys. */
  fields: NoInfer<{ [K in keyof T]-?: string }>;
  /** A realistic payload, shown in the docs. Checked against the payload type. */
  example: NoInfer<T>;
}

/** One registered event, as used at runtime by the logger and the docs. */
export interface EventEntry<T = unknown> {
  /** Full event name, e.g. `datepicker.state.onChange`. */
  name: string;
  /** Component display name, e.g. `DatePicker`. */
  component: string;
  description: string;
  fields: Readonly<Record<string, string>>;
  example: T;
  payload: PayloadType<T>;
}

export interface EventGroup<P extends string> {
  /** Component display name, used to group events in the docs. */
  component: string;
  /** Lower-case component name without separators, the first part of every event name. */
  prefix: P;
}

/** A registry: full event name → entry. */
export type EventRegistry = Readonly<Record<string, EventEntry>>;

type Entries<P extends string, T> = {
  [K in keyof T & string as `${P}.${K}`]: EventEntry<T[K]>;
};

/**
 * Defines a component's events. Names become `<prefix>.<domain>.on<Event>`:
 *
 * ```ts
 * defineEvents({ component: 'DatePicker', prefix: 'datepicker' }, {
 *   'state.onChange': { description, payload: payload<{ value: Date | null }>(), fields, example },
 * });
 * ```
 */
export function defineEvents<P extends Lowercase<string>, T extends Record<EventKey, object>>(
  group: EventGroup<P>,
  // The second part rejects keys outside the convention (`changed` instead of `state.onChange`).
  definitions: { [K in keyof T]: EventDefinition<T[K]> } & Record<
    Exclude<keyof T, EventKey>,
    never
  >,
): Entries<P, T> {
  const entries: Record<string, EventEntry> = {};
  for (const [key, definition] of Object.entries(definitions) as [
    string,
    EventDefinition<Record<string, unknown>>,
  ][]) {
    const name = `${group.prefix}.${key}`;
    entries[name] = { name, component: group.component, ...definition };
  }
  return entries as Entries<P, T>;
}

/** The payload type of each event in a registry. */
export type EventMapOf<R> = {
  [N in keyof R]: R[N] extends EventEntry<infer T extends object> ? T : never;
};

/** The shared description of the `source` field, so every event documents it the same way. */
export const sourceField =
  '{ id?, name?, data? } — the emitting component’s id and name props, and its eventData';

/** The `source` of a payload from a component's props; absent props are left out. */
export function eventSource(
  id: string | undefined,
  name: string | undefined,
  data: unknown,
): EventSource {
  const source: EventSource = {};
  if (id !== undefined) source.id = id;
  if (name !== undefined) source.name = name;
  if (data !== undefined) source.data = data;
  return source;
}
