/**
 * Real components next to a live event log: every interaction shows the event it emits.
 * Storybook only (Architecture › Event Playground).
 */

import { useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { DatePicker } from '../../components/date-picker';
import { DropdownMenu, DropdownMenuItem } from '../../components/dropdown-menu';
import { FormField, FormLabel } from '../../components/form-field';
import { Grid } from '../../components/grid';
import { Modal } from '../../components/modal';
import { Select } from '../../components/select';
import { Stack } from '../../components/stack';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from '../../components/tabs';
import { EventLog } from './event-log';

export function EventPlayground() {
  const [open, setOpen] = useState(false);
  return (
    <Grid columns={{ base: 1, md: 2 }} gap="lg" align="start">
      <Stack gap="md">
        <FormField>
          <FormLabel>Publish date</FormLabel>
          <DatePicker name="publishDate" locale={tr} eventData={{ pageId: 42 }} />
        </FormField>
        <FormField>
          <FormLabel>Language</FormLabel>
          <Select name="language" defaultValue="en">
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
            <option value="de">Deutsch</option>
          </Select>
        </FormField>
        <Checkbox name="featured">Featured page</Checkbox>
        <Tabs id="editor" defaultValue="content">
          <TabsList aria-label="Editor">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          <TabsPanel value="content">Content fields</TabsPanel>
          <TabsPanel value="seo">SEO fields</TabsPanel>
        </Tabs>
        <Stack direction="horizontal" gap="sm" wrap>
          <Button variant="secondary" id="open-dialog" onClick={() => setOpen(true)}>
            Open dialog
          </Button>
          <DropdownMenu
            id="page-actions"
            content={
              <>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
              </>
            }
          >
            <Button variant="secondary">Page actions</Button>
          </DropdownMenu>
        </Stack>
        <Modal
          id="confirm"
          open={open}
          onOpenChange={setOpen}
          title="Publish page?"
          footer={<Button onClick={() => setOpen(false)}>Publish</Button>}
        >
          The page goes live immediately.
        </Modal>
      </Stack>
      <EventLog />
    </Grid>
  );
}
