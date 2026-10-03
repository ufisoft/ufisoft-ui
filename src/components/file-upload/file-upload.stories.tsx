import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { FileUpload, type FileRejection } from '.';
import { FilePreview } from '../file-preview';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Stack } from '../stack';

const meta = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  args: {
    'aria-label': 'Attachments',
    onFilesChange: fn(),
    onFilesReject: fn(),
  },
  argTypes: {
    children: { control: 'text' },
    maxSize: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AcceptAndSize: Story = {
  name: 'Accept and max size',
  args: {
    accept: 'image/png,image/jpeg',
    maxSize: 2 * 1024 * 1024,
    multiple: true,
    children: 'Drop PNG or JPEG images here (up to 2 MB each), or click to choose',
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Invoice</FormLabel>
      <FileUpload {...args} accept=".pdf">
        Drop a PDF here or click to choose
      </FileUpload>
      <FormDescription>One PDF, up to 10 MB.</FormDescription>
      <FormMessage>Attach the invoice.</FormMessage>
    </FormField>
  ),
};

export const WithPreviews: Story = {
  name: 'Example: with a file list',
  args: { 'aria-label': undefined },
  render: function Render(args) {
    const [files, setFiles] = useState<File[]>([]);
    const [rejected, setRejected] = useState<FileRejection[]>([]);
    return (
      <FormField>
        <Stack gap="sm">
          <FormLabel>Photos</FormLabel>
          <FileUpload
            {...args}
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            multiple
            onFilesChange={(picked) => setFiles((current) => [...current, ...picked])}
            onFilesReject={setRejected}
          >
            Drop images here or click to choose
          </FileUpload>
          <FormDescription>Images up to 5 MB each.</FormDescription>
          {(files.length > 0 || rejected.length > 0) && (
            <Stack as="ul" gap="xs" aria-label="Selected photos">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <FilePreview
                    file={file}
                    onRemove={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  />
                </li>
              ))}
              {rejected.map(({ file, reason }) => (
                <li key={`rejected-${file.name}`}>
                  <FilePreview
                    file={file}
                    error={reason === 'size' ? 'Larger than 5 MB' : 'Not an image'}
                    onRemove={() =>
                      setRejected((current) => current.filter((r) => r.file !== file))
                    }
                  />
                </li>
              ))}
            </Stack>
          )}
        </Stack>
      </FormField>
    );
  },
};

export const Turkish: Story = {
  name: 'Example: Turkish',
  args: {
    'aria-label': 'Ekler',
    children: 'Dosyaları buraya bırakın veya seçmek için tıklayın',
  },
};
