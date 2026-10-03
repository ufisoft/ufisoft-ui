import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Col, Container, Row } from '.';

describe('Container', () => {
  it('renders its children in the chosen element', () => {
    render(
      <Container as="main" size="lg">
        <p>Content</p>
      </Container>,
    );
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Content'));
  });

  it('merges className and forwards ref and native props', () => {
    const ref = createRef<HTMLElement>();
    render(<Container ref={ref} className="page" aria-label="Page" role="region" />);
    const region = screen.getByRole('region', { name: 'Page' });
    expect(ref.current).toBe(region);
    expect(region).toHaveClass('page');
  });
});

describe('Row and Col', () => {
  it('lays out columns in a row', () => {
    render(
      <Row aria-label="Columns" role="group">
        <Col span={{ base: 12, md: 6 }}>Left</Col>
        <Col span={{ base: 12, md: 6 }}>Right</Col>
      </Row>,
    );
    const row = screen.getByRole('group', { name: 'Columns' });
    expect(row).toContainElement(screen.getByText('Left'));
    expect(row).toContainElement(screen.getByText('Right'));
  });

  it('keeps list semantics as ul and li', () => {
    render(
      <Row as="ul">
        <Col as="li" span={4}>
          One
        </Col>
        <Col as="li" span={4} start={9}>
          Two
        </Col>
      </Row>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('forwards ref and className on Row and Col', () => {
    const rowRef = createRef<HTMLElement>();
    const colRef = createRef<HTMLElement>();
    render(
      <Row ref={rowRef} as="section" aria-label="Stats" className="stats">
        <Col ref={colRef} as="article" aria-label="Revenue" className="stat" />
      </Row>,
    );
    expect(rowRef.current).toBe(screen.getByRole('region', { name: 'Stats' }));
    expect(rowRef.current).toHaveClass('stats');
    expect(colRef.current).toBe(screen.getByRole('article', { name: 'Revenue' }));
    expect(colRef.current).toHaveClass('stat');
  });
});
