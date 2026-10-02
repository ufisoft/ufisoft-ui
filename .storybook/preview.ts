import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.css';

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
        order: ['Introduction', 'Tokens', 'Foundations', 'Actions', 'Forms', 'Feedback', 'Overlay'],
      },
    },
  },
};

export default preview;
