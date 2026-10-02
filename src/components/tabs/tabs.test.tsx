import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsList, TabsPanel, TabsTrigger, type TabsProps } from '.';

function Settings(props: Omit<TabsProps, 'children'>) {
  return (
    <Tabs defaultValue="general" {...props}>
      <TabsList aria-label="Settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsPanel value="general">General settings</TabsPanel>
      <TabsPanel value="billing">Billing settings</TabsPanel>
      <TabsPanel value="members">Member list</TabsPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the panel of the selected tab and links them', () => {
    render(<Settings />);
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: 'General' });
    expect(tab).toHaveAttribute('aria-selected', 'true');

    const panel = screen.getByRole('tabpanel', { name: 'General' });
    expect(panel).toHaveTextContent('General settings');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(screen.queryByText('Member list')).not.toBeInTheDocument();
  });

  it('switches panels on click', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await user.click(screen.getByRole('tab', { name: 'Members' }));
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Members' })).toHaveTextContent('Member list');
  });

  it('moves between tabs with the arrow keys, skipping disabled ones', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await user.tab();
    expect(screen.getByRole('tab', { name: 'General' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Member list');

    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Members' })).toHaveFocus();
  });

  it('works as controlled tabs', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('members');
      return (
        <Settings
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Member list');

    await user.click(screen.getByRole('tab', { name: 'General' }));
    expect(onValueChange).toHaveBeenCalledWith('general');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('General settings');
  });

  it('uses up and down arrows when vertical', async () => {
    const user = userEvent.setup();
    render(<Settings orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');

    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
  });

  it('forwards refs to the tab and panel elements', () => {
    const tabRef = createRef<HTMLButtonElement>();
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" ref={tabRef}>
            A
          </TabsTrigger>
        </TabsList>
        <TabsPanel value="a" ref={panelRef}>
          Panel A
        </TabsPanel>
      </Tabs>,
    );
    expect(tabRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(panelRef.current).toHaveAttribute('role', 'tabpanel');
  });
});
