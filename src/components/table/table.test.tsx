import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '.';

function Pages() {
  return (
    <Table caption="Pages">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead align="end">Views</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">Pricing</TableHead>
          <TableCell align="end">1,204</TableCell>
        </TableRow>
        <TableRow>
          <TableHead scope="row">About us</TableHead>
          <TableCell align="end">312</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('is a table named by its caption', () => {
    render(<Pages />);
    expect(screen.getByRole('table', { name: 'Pages' })).toBeInTheDocument();
  });

  it('associates cells with their column and row headers', () => {
    render(<Pages />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Title',
      'Views',
    ]);
    expect(screen.getAllByRole('rowheader').map((h) => h.textContent)).toEqual([
      'Pricing',
      'About us',
    ]);
    const row = screen.getByRole('row', { name: /Pricing/ });
    expect(within(row).getByRole('cell')).toHaveTextContent('1,204');
  });

  it('wraps the table in a focusable region named by the caption, for scrolling', async () => {
    const user = userEvent.setup();
    render(<Pages />);
    const region = screen.getByRole('region', { name: 'Pages' });
    expect(within(region).getByRole('table')).toBeInTheDocument();

    await user.tab();
    expect(region).toHaveFocus();
  });

  it('defaults header cells to column scope', () => {
    render(<Pages />);
    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('rowheader', { name: 'Pricing' })).toHaveAttribute('scope', 'row');
  });

  it('forwards ref to the table element', () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table caption="Empty" ref={ref}>
        <TableBody />
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });
});
