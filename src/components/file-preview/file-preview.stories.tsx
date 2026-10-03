import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { FilePreview } from '.';
import { Button } from '../button';
import { Stack } from '../stack';

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="hsl(200 70% 75%)"/><path d="M0 3 L1.5 1.4 L2.5 2.3 L4 1.2 V3Z" fill="hsl(150 35% 40%)"/></svg>',
)}`;

const meta = {
  title: 'Data display/FilePreview',
  component: FilePreview,
  args: {
    file: { name: 'quarterly-report.pdf', size: 1_572_864, type: 'application/pdf' },
  },
  argTypes: {
    file: { control: 'object' },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ImageFile: Story = {
  args: { file: { name: 'beach.jpg', size: 482_000, type: 'image/jpeg', url: photo } },
};

export const Removable: Story = {
  args: { onRemove: () => {} },
};

export const Uploading: Story = {
  args: { progress: 45, onRemove: () => {} },
};

export const Failed: Story = {
  args: {
    file: { name: 'holiday-video.mp4', size: 734_003_200, type: 'video/mp4' },
    error: 'File is too large (max. 100 MB)',
    onRemove: () => {},
  },
};

export const LongName: Story = {
  name: 'Long file name',
  args: {
    file: {
      name: 'final-final-v3-reviewed-by-legal-and-marketing-team-2026.docx',
      size: 52_300,
    },
    onRemove: () => {},
  },
};

export const Turkish: Story = {
  name: 'Example: Turkish',
  args: {
    file: { name: 'rapor.pdf', size: 1_572_864 },
    locale: 'tr',
    onRemove: () => {},
    removeLabel: 'Kaldır: rapor.pdf',
  },
};

export const UploadList: Story = {
  name: 'Example: upload list',
  render: function Render(args) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      if (progress >= 100) return;
      const timer = setTimeout(() => setProgress((p) => Math.min(100, p + 10)), 300);
      return () => clearTimeout(timer);
    }, [progress]);
    return (
      <Stack gap="sm">
        <Stack as="ul" gap="xs" aria-label="Uploaded files">
          <li>
            <FilePreview
              {...args}
              file={{ name: 'beach.jpg', size: 482_000, type: 'image/jpeg', url: photo }}
            />
          </li>
          <li>
            <FilePreview
              {...args}
              file={{ name: 'contract.pdf', size: 2_400_000 }}
              progress={progress}
            />
          </li>
          <li>
            <FilePreview
              {...args}
              file={{ name: 'notes.exe', size: 9_000 }}
              error="This file type is not allowed"
            />
          </li>
        </Stack>
        <Button variant="secondary" onClick={() => setProgress(0)}>
          Restart upload
        </Button>
      </Stack>
    );
  },
};
