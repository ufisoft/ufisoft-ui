import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, AccordionItem } from '.';

function Faq(props: { type?: 'single' | 'multiple' }) {
  return (
    <Accordion type={props.type}>
      <AccordionItem title="Shipping" defaultOpen>
        Ships in 2 days.
      </AccordionItem>
      <AccordionItem title="Returns">Free within 30 days.</AccordionItem>
    </Accordion>
  );
}

function item(title: string) {
  const details = screen.getByText(title).closest('details');
  if (!details) throw new Error(`No <details> around "${title}"`);
  return details;
}

describe('Accordion', () => {
  it('starts with the defaultOpen item open', () => {
    render(<Faq />);
    expect(item('Shipping')).toHaveAttribute('open');
    expect(item('Returns')).not.toHaveAttribute('open');
  });

  // jsdom does not activate <summary> with Enter/Space; that is verified in Storybook.
  it('toggles an item from its header and reaches headers with Tab', async () => {
    const user = userEvent.setup();
    render(<Faq />);

    await user.tab();
    expect(screen.getByText('Shipping')).toHaveFocus();

    await user.click(screen.getByText('Returns'));
    expect(item('Returns')).toHaveAttribute('open');
    await user.click(screen.getByText('Returns'));
    expect(item('Returns')).not.toHaveAttribute('open');
  });

  it('gives items a shared name only when type is single', () => {
    const { unmount } = render(<Faq type="single" />);
    const name = item('Shipping').getAttribute('name');
    expect(name).toBeTruthy();
    expect(item('Returns')).toHaveAttribute('name', name);
    unmount();

    render(<Faq type="multiple" />);
    expect(item('Shipping')).not.toHaveAttribute('name');
  });

  it('reports toggles through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Accordion>
          <AccordionItem
            title="Details"
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              onOpenChange(next);
            }}
          >
            More
          </AccordionItem>
        </Accordion>
      );
    }
    render(<Controlled />);

    await user.click(screen.getByText('Details'));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(item('Details')).toHaveAttribute('open');
  });

  it('forwards ref to the details element', () => {
    const ref = createRef<HTMLDetailsElement>();
    render(
      <Accordion>
        <AccordionItem title="Details" ref={ref}>
          More
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDetailsElement);
  });
});
