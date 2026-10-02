import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Card } from '.';

describe('Card', () => {
  it('renders its content in a div by default', () => {
    render(<Card>Monthly report</Card>);
    const card = screen.getByText('Monthly report');
    expect(card.tagName).toBe('DIV');
  });

  it('renders the child element with asChild', () => {
    render(
      <Card asChild>
        <article aria-label="Monthly report">Revenue grew 12%.</article>
      </Card>,
    );
    expect(screen.getByRole('article', { name: 'Monthly report' })).toHaveTextContent(
      'Revenue grew 12%.',
    );
  });

  it('works as a list item inside a list', () => {
    render(
      <ul aria-label="Projects">
        <Card asChild>
          <li>Website</li>
        </Card>
        <Card asChild>
          <li>Mobile app</li>
        </Card>
      </ul>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('passes native props through', () => {
    render(
      <Card asChild>
        <section aria-labelledby="title">
          <h2 id="title">Billing</h2>
        </section>
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Billing' })).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
