import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from '.';
import { names, recordEvents } from '../../test/record-events';
import { Accordion, AccordionItem } from '../accordion';
import { Pagination } from '../pagination';

describe('navigation events', () => {
  it('Tabs emits tabs.state.onChange with the previous tab', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onValueChange = vi.fn();
    render(
      <Tabs id="editor" defaultValue="content" onValueChange={onValueChange}>
        <TabsList aria-label="Editor">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsPanel value="content">Content panel</TabsPanel>
        <TabsPanel value="seo">SEO panel</TabsPanel>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'SEO' }));
    expect(onValueChange).toHaveBeenCalledWith('seo');
    expect(events).toEqual([
      {
        name: 'tabs.state.onChange',
        payload: { value: 'seo', previousValue: 'content', source: { id: 'editor' } },
      },
    ]);
  });

  it('Accordion emits onOpen and onClose for user toggles, not for items rendered open', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <Accordion>
        <AccordionItem id="shipping" title="Shipping" defaultOpen>
          Ships in 2 days.
        </AccordionItem>
        <AccordionItem id="returns" title="Returns">
          30 days.
        </AccordionItem>
      </Accordion>,
    );
    // The browser fires toggle for an item rendered open; jsdom does not, so no event either way.
    await user.click(screen.getByText('Returns'));
    await user.click(screen.getByText('Shipping'));
    await vi.waitFor(() =>
      expect(events).toEqual([
        { name: 'accordion.state.onOpen', payload: { source: { id: 'returns' } } },
        { name: 'accordion.state.onClose', payload: { source: { id: 'shipping' } } },
      ]),
    );
  });

  it('Pagination emits pagination.state.onChange and no button events', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onPageChange = vi.fn();
    render(<Pagination id="results" page={2} pageCount={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Page 4' }));
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange.mock.calls).toEqual([[4], [1]]);
    expect(names(events)).toEqual(['pagination.state.onChange', 'pagination.state.onChange']);
    expect(events.map((event) => event.payload)).toEqual([
      { page: 4, previousPage: 2, source: { id: 'results' } },
      { page: 1, previousPage: 2, source: { id: 'results' } },
    ]);
  });
});
