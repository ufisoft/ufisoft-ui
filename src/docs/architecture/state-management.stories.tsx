import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { Button } from '../../components/button';
import { DatePicker } from '../../components/date-picker';
import { FormField, FormLabel } from '../../components/form-field';
import { Select } from '../../components/select';
import { Stack } from '../../components/stack';
import { Text } from '../../components/text';
import { createStore } from '../../state/create-store';
import { useStore } from '../../state/use-store';
import { formatPayload } from '../blocks/format-payload';

interface PageFilters {
  category: string;
  page: number;
  publishDate: Date | null;
}

/** One store for the whole page; components read slices of it. */
const filters = createStore<PageFilters>({ category: 'all', page: 1, publishDate: null });

const box = {
  padding: 'var(--ufi-space-sm)',
  border: '1px solid var(--ufi-color-border-default)',
  borderRadius: 'var(--ufi-radius-md)',
};

/** Counts renders and writes the count after each one, without causing another render. */
function RenderCount() {
  const count = useRef(0);
  const output = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    count.current += 1;
    if (output.current) output.current.textContent = String(count.current);
  });
  return (
    <Text size="sm" tone="muted">
      renders: <span ref={output} />
    </Text>
  );
}

const meta = {
  title: 'Architecture/State Management',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadAndUpdate: Story = {
  name: 'Read and update a store',
  render: function Render() {
    const state = useStore(filters);
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <pre style={box}>{`filters.getState() = ${formatPayload(state)}`}</pre>
        <Stack direction="horizontal" gap="sm" wrap>
          <Button onClick={() => filters.setState((s) => ({ page: s.page + 1 }))}>Next page</Button>
          <Button variant="secondary" onClick={() => filters.setState({ category: 'news' })}>
            Category: news
          </Button>
          <Button
            variant="ghost"
            onClick={() => filters.setState({ category: 'all', page: 1, publishDate: null })}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    );
  },
};

function WholeState() {
  const state = useStore(filters);
  return (
    <div style={box}>
      <Text weight="semibold">useStore(filters)</Text>
      <Text size="sm">
        page {state.page}, category {state.category}
      </Text>
      <RenderCount />
    </div>
  );
}

function CategoryOnly() {
  const category = useStore(filters, (state) => state.category);
  return (
    <div style={box}>
      <Text weight="semibold">useStore(filters, (s) =&gt; s.category)</Text>
      <Text size="sm">category {category}</Text>
      <RenderCount />
    </div>
  );
}

export const Selectors: Story = {
  name: 'Selectors avoid renders',
  render: () => (
    <Stack gap="sm" style={{ maxWidth: 560 }}>
      <Stack direction="horizontal" gap="sm" align="stretch">
        <WholeState />
        <CategoryOnly />
      </Stack>
      <Stack direction="horizontal" gap="sm" wrap>
        <Button onClick={() => filters.setState((s) => ({ page: s.page + 1 }))}>
          Next page (only the left one renders)
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            filters.setState((s) => ({ category: s.category === 'news' ? 'all' : 'news' }))
          }
        >
          Toggle category (both render)
        </Button>
      </Stack>
    </Stack>
  ),
};

export const Subscribe: Story = {
  name: 'Subscribe and unsubscribe',
  render: function Render() {
    const [log, setLog] = useState<string[]>([]);
    const [subscribed, setSubscribed] = useState(false);
    useEffect(() => {
      if (!subscribed) return;
      // subscribe returns the unsubscribe function: the effect cleanup calls it.
      return filters.subscribe((state, previous) =>
        setLog((lines) =>
          [`page ${previous.page} → ${state.page}, category ${state.category}`, ...lines].slice(
            0,
            5,
          ),
        ),
      );
    }, [subscribed]);
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <Stack direction="horizontal" gap="sm" wrap>
          <Button variant="secondary" onClick={() => setSubscribed((on) => !on)}>
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
          <Button onClick={() => filters.setState((s) => ({ page: s.page + 1 }))}>Next page</Button>
        </Stack>
        <Text size="sm" tone="muted">
          {subscribed ? 'Listening to every change.' : 'Not listening.'}
        </Text>
        <ul aria-label="Changes">
          {log.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      </Stack>
    );
  },
};

function PublishDateSummary() {
  const date = useStore(filters, (state) => state.publishDate);
  return (
    <Text tone="muted">Summary elsewhere on the page: {date?.toDateString() ?? 'no date'}</Text>
  );
}

export const ControlledComponents: Story = {
  name: 'Controlled components and a store',
  render: function Render() {
    const date = useStore(filters, (state) => state.publishDate);
    const category = useStore(filters, (state) => state.category);
    return (
      <Stack gap="md" style={{ maxWidth: 400 }}>
        <FormField>
          <FormLabel>Publish date (controlled by the store)</FormLabel>
          <DatePicker
            locale={tr}
            value={date}
            onValueChange={(publishDate) => filters.setState({ publishDate })}
          />
        </FormField>
        <FormField>
          <FormLabel>Category (controlled by the store)</FormLabel>
          <Select value={category} onChange={(e) => filters.setState({ category: e.target.value })}>
            <option value="all">All</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
          </Select>
        </FormField>
        <PublishDateSummary />
        <FormField>
          <FormLabel>Uncontrolled date (keeps its own state)</FormLabel>
          <DatePicker locale={tr} defaultValue={new Date(2026, 9, 3)} />
        </FormField>
      </Stack>
    );
  },
};
