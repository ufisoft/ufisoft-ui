import { describe, expect, expectTypeOf, it } from 'vitest';
import { defineEvents, eventSource, payload, type EventMapOf } from './define-events';
import { createEventBus } from './event-bus';

const cartEvents = defineEvents(
  { component: 'Cart', prefix: 'cart' },
  {
    'state.onChange': {
      description: 'The number of items changed.',
      payload: payload<{ count: number; previousCount: number }>(),
      fields: { count: 'number — items now', previousCount: 'number — items before' },
      example: { count: 2, previousCount: 1 },
    },
    'interaction.onCheckout': {
      description: 'The user started checkout.',
      payload: payload<{ total: number }>(),
      fields: { total: 'number — the cart total' },
      example: { total: 99 },
    },
  },
);

describe('defineEvents', () => {
  it('registers events under <prefix>.<domain>.<event> with their metadata', () => {
    expect(Object.keys(cartEvents)).toEqual(['cart.state.onChange', 'cart.interaction.onCheckout']);
    expect(cartEvents['cart.state.onChange']).toMatchObject({
      name: 'cart.state.onChange',
      component: 'Cart',
      description: 'The number of items changed.',
      fields: { count: 'number — items now', previousCount: 'number — items before' },
      example: { count: 2, previousCount: 1 },
    });
  });

  it('derives the event map type from the definitions', () => {
    type Map = EventMapOf<typeof cartEvents>;
    expectTypeOf<Map['cart.state.onChange']>().toEqualTypeOf<{
      count: number;
      previousCount: number;
    }>();
    expectTypeOf<Map['cart.interaction.onCheckout']>().toEqualTypeOf<{ total: number }>();

    const bus = createEventBus({ registry: cartEvents, debug: false });
    bus.on('cart.interaction.onCheckout', (event) => expectTypeOf(event.total).toBeNumber());
    // @ts-expect-error — wrong payload for this event
    bus.emit('cart.interaction.onCheckout', { count: 1 });
  });

  it('checks fields and example against the payload type', () => {
    defineEvents(
      { component: 'Cart', prefix: 'cart' },
      {
        'state.onChange': {
          description: 'x',
          payload: payload<{ count: number }>(),
          // @ts-expect-error — a payload field is not documented
          fields: {},
          example: { count: 1 },
        },
      },
    );
    defineEvents(
      { component: 'Cart', prefix: 'cart' },
      {
        'state.onChange': {
          description: 'x',
          payload: payload<{ count: number }>(),
          fields: { count: 'number' },
          // @ts-expect-error — the example does not match the payload
          example: { count: 'one' },
        },
      },
    );
  });

  it('enforces the naming convention', () => {
    defineEvents(
      // @ts-expect-error — the prefix is lower case
      { component: 'Cart', prefix: 'Cart' },
      {},
    );
    defineEvents(
      { component: 'Cart', prefix: 'cart' },
      {
        // @ts-expect-error — the domain is state or interaction, the event starts with "on"
        changed: {
          description: 'x',
          payload: payload<{ count: number }>(),
          fields: { count: 'number' },
          example: { count: 1 },
        },
      },
    );
  });
});

describe('eventSource', () => {
  it('keeps only the props that are set', () => {
    expect(eventSource(undefined, undefined, undefined)).toEqual({});
    expect(eventSource('a', 'b', { pageId: 1 })).toEqual({
      id: 'a',
      name: 'b',
      data: { pageId: 1 },
    });
    expect(eventSource(undefined, 'b', 0)).toEqual({ name: 'b', data: 0 });
  });
});
