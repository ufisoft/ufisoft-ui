/**
 * Token values that JavaScript needs at runtime.
 * Everything else lives in CSS (primitives.css → semantic.css).
 */

/** Minimum viewport widths. Mirrors `--ufi-breakpoint-*` in primitives.css. */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Spacing scale accepted by layout components such as `Stack`. */
export type SpaceToken = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
