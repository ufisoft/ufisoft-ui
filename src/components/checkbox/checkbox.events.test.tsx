import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '.';
import { names, recordEvents } from '../../test/record-events';
import { RadioGroup, Radio } from '../radio';
import { Select } from '../select';
import { Switch } from '../switch';

describe('form control events', () => {
  it('Checkbox emits checkbox.state.onChange and keeps onChange', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onChange = vi.fn();
    render(
      <Checkbox name="newsletter" eventData="signup" onChange={onChange}>
        Newsletter
      </Checkbox>,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Newsletter' }));
    await user.click(screen.getByRole('checkbox', { name: 'Newsletter' }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(events).toEqual([
      {
        name: 'checkbox.state.onChange',
        payload: { checked: true, source: { name: 'newsletter', data: 'signup' } },
      },
      {
        name: 'checkbox.state.onChange',
        payload: { checked: false, source: { name: 'newsletter', data: 'signup' } },
      },
    ]);
  });

  it('Switch emits switch.state.onChange', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <Switch id="notify" defaultChecked>
        Notifications
      </Switch>,
    );

    await user.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(events).toEqual([
      { name: 'switch.state.onChange', payload: { checked: false, source: { id: 'notify' } } },
    ]);
  });

  it('RadioGroup emits radiogroup.state.onChange with the previous value', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        aria-label="Shipping"
        name="shipping"
        defaultValue="standard"
        onValueChange={onValueChange}
      >
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', { name: 'Express' }));
    await user.click(screen.getByRole('radio', { name: 'Standard' }));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(names(events)).toEqual(['radiogroup.state.onChange', 'radiogroup.state.onChange']);
    expect(events.map((event) => event.payload)).toEqual([
      { value: 'express', previousValue: 'standard', source: { name: 'shipping' } },
      { value: 'standard', previousValue: 'express', source: { name: 'shipping' } },
    ]);
  });

  it('Select emits select.state.onChange with the previous value', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onChange = vi.fn();
    render(
      <Select aria-label="Language" name="language" defaultValue="en" onChange={onChange}>
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
      </Select>,
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'tr');
    expect(onChange).toHaveBeenCalledOnce();
    expect(events).toEqual([
      {
        name: 'select.state.onChange',
        payload: { value: 'tr', previousValue: 'en', source: { name: 'language' } },
      },
    ]);
  });
});
