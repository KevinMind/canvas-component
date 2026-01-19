import type { Preview } from '@storybook/react';
import React from 'react';
import { FpsMonitor } from './FpsMonitor';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <FpsMonitor>
        <Story />
      </FpsMonitor>
    ),
  ],
};

export default preview;
