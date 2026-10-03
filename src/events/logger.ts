/**
 * Development logging for the event bus: one collapsed console group per event, with the
 * payload, the time and how to listen to it — so the console doubles as event discovery.
 */

/**
 * True in development builds. `process.env.NODE_ENV` is left in the library build on purpose:
 * the application's bundler (Vite, Next.js, webpack) replaces it, so production builds get
 * `false` and minifiers drop the logging code entirely.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export interface LoggedEvent {
  name: string;
  payload: unknown;
  timestamp: number;
  /** From the event registry, when the event is registered. */
  description?: string;
}

export function logEvent({ name, payload, timestamp, description }: LoggedEvent): void {
  // Local time, as in the rest of the console.
  const date = new Date(timestamp);
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
  console.groupCollapsed(`%c[UfiSoft Event]%c ${name}`, 'color: #7c3aed; font-weight: 600', '');
  if (description) console.log(description);
  console.log('payload:', payload);
  console.log(`time:    ${time}`);
  console.log(`listen:  eventBus.on('${name}', (payload) => { … })`);
  console.groupEnd();
}
