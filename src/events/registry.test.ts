import { describe, expect, expectTypeOf, it } from 'vitest';
import type { EventSource } from './define-events';
import { eventBus, eventRegistry, type UfiEventPayload } from './registry';

const entries = Object.values(eventRegistry);

describe('eventRegistry', () => {
  it('names every event <component>.<state|interaction>.on<Event>', () => {
    for (const entry of entries) {
      expect(entry.name).toMatch(/^[a-z]+\.(state|interaction)\.on[A-Z][A-Za-z]+$/);
      expect(entry.name.split('.')[0]).toBe(entry.component.toLowerCase());
    }
  });

  it('documents every event: description, fields matching the example, a source field', () => {
    for (const entry of entries) {
      expect(entry.description.length, entry.name).toBeGreaterThan(10);
      expect(Object.keys(entry.fields).sort(), entry.name).toEqual(
        Object.keys(entry.example as object).sort(),
      );
      expect(entry.fields, entry.name).toHaveProperty('source');
    }
  });

  it('keys every entry by its own name', () => {
    for (const [key, entry] of Object.entries(eventRegistry)) expect(entry.name).toBe(key);
  });

  it('covers the components that emit events', () => {
    expect([...new Set(entries.map((entry) => entry.component))]).toEqual([
      'Button',
      'IconButton',
      'Checkbox',
      'RadioGroup',
      'Switch',
      'Select',
      'Combobox',
      'DatePicker',
      'DateRangePicker',
      'TimePicker',
      'TimeRangePicker',
      'FileUpload',
      'Toast',
      'Modal',
      'Drawer',
      'Popover',
      'DropdownMenu',
      'ContextMenu',
      'Tabs',
      'Accordion',
      'Pagination',
      'FilePreview',
    ]);
  });

  it('gives the global bus the payload types of the registry', () => {
    expectTypeOf<UfiEventPayload<'datepicker.state.onChange'>>().toEqualTypeOf<{
      value: Date | null;
      previousValue: Date | null;
      source: EventSource;
    }>();
    eventBus.on('datepicker.state.onChange', (payload) => {
      expectTypeOf(payload.previousValue).toEqualTypeOf<Date | null>();
    });
    // @ts-expect-error — the payload must have previousValue and source
    eventBus.emit('datepicker.state.onChange', { value: new Date() });
  });
});
