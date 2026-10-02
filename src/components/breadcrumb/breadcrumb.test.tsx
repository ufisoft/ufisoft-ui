import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Breadcrumb, BreadcrumbItem } from '.';

function Trail() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/pages">Pages</BreadcrumbItem>
      <BreadcrumbItem current>Pricing</BreadcrumbItem>
    </Breadcrumb>
  );
}

describe('Breadcrumb', () => {
  it('is a navigation landmark with an ordered list of levels', () => {
    render(<Trail />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const items = within(nav).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Home', 'Pages', 'Pricing']);
    expect(within(nav).getByRole('list').tagName).toBe('OL');
  });

  it('links ancestors and marks the current page without a link', () => {
    render(<Trail />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Pages' })).toHaveAttribute('href', '/pages');
    expect(screen.queryByRole('link', { name: 'Pricing' })).not.toBeInTheDocument();
    expect(screen.getByText('Pricing')).toHaveAttribute('aria-current', 'page');
  });

  it('reaches the links with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Trail />);

    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Pages' })).toHaveFocus();
  });

  it('accepts a custom landmark name', () => {
    render(
      <Breadcrumb aria-label="Folder path">
        <BreadcrumbItem current>Media</BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByRole('navigation', { name: 'Folder path' })).toBeInTheDocument();
  });

  it('renders a router link with asChild and forwards ref to it', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Breadcrumb>
        <BreadcrumbItem asChild ref={ref}>
          <a href="/settings" data-router-link="">
            Settings
          </a>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('data-router-link');
    expect(ref.current).toBe(link);
  });
});
