import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { eventBus } from '../events/registry';

afterEach(() => {
  cleanup();
  // The global bus is shared by every test: listeners from one test must not see the next one.
  eventBus.clear();
});

// jsdom has no ResizeObserver; Radix positioning (Tooltip) needs one. Layout is verified in Storybook.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom has no pointer capture; Radix swipe handling (Toast) calls it on pointer events.
if (typeof Element.prototype.hasPointerCapture !== 'function') {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom hides [popover] elements but cannot open them (no showPopover). Show them as normal
// content so their children can be queried. Real top-layer behaviour (Toast) is verified in Storybook.
if (typeof HTMLElement.prototype.showPopover !== 'function') {
  const style = document.createElement('style');
  // !important: jsdom's cascade lets its more specific built-in `:not(:popover-open)` rule win.
  style.textContent = '[popover] { display: block !important; }';
  document.head.append(style);
}

// jsdom does not implement <dialog> methods. Minimal shim: open state and the `close` event.
// Real browser behaviour (top layer, focus, Escape) is verified in Storybook.
if (!('open' in HTMLDialogElement.prototype)) {
  Object.defineProperty(HTMLDialogElement.prototype, 'open', {
    get(this: HTMLDialogElement) {
      return this.hasAttribute('open');
    },
  });
}
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.show = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
