import 'react';

// Lets a component pass its CSS Module a local custom property, e.g. a resized column's width:
// `style={{ '--_width': '240px' }}`. Only `--_*` names are allowed — see
// docs/contracts/component-styling.md#no-inline-style. Not emitted: consumers' types are unchanged.
declare module 'react' {
  interface CSSProperties {
    [property: `--_${string}`]: string | number | undefined;
  }
}
