import type { Preview } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { eventBus } from '../src/events/registry';
import '../src/styles/index.css';

// Every UfiSoft event also appears in the Actions panel of the story that emitted it.
eventBus.onAny(({ name, payload }) => action(name)(payload));

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      sort: 'requiredFirst',
    },
    a11y: {
      // Fail the a11y panel on violations instead of only listing them.
      test: 'error',
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Tokens',
          'Foundations',
          'Actions',
          'Forms',
          'Feedback',
          'Overlay',
          // Listed only to keep their previous (alphabetical) order ahead of Architecture.
          'Data display',
          'Navigation',
          'Architecture',
          ['State Management', 'Event System', 'Event Discovery', 'Event Playground'],
        ],
      },
    },
  },
};

export default preview;
