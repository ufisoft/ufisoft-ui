'use client';

/**
 * DataTable's column header menu and saved views popover. Internal: DataTable is the public
 * component.
 */

import { Fragment, useId, useState, type FormEvent } from 'react';
import { EventScope } from '../../events/react';
import { Button } from '../button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '../dropdown-menu';
import { FormField, FormLabel } from '../form-field';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { Popover } from '../popover';
import styles from './data-table.module.css';
import type { DataTableView } from './views';
import type { DataTableLabels } from '.';

export interface ColumnMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
}

interface ColumnMenuProps {
  /** The trigger's name, e.g. “Column options for Name”. */
  label: string;
  /** Groups of items, separated in the menu (sorting, grouping, pinning, visibility). */
  sections: ColumnMenuItem[][];
}

/** The “⋮” button in a column header: sort, group, pin and hide the column. */
export function ColumnMenu({ label, sections }: ColumnMenuProps) {
  const filled = sections.filter((section) => section.length > 0);
  if (filled.length === 0) return null;
  return (
    // The menu and its button are DataTable's own parts: only the resulting datatable events are emitted.
    <EventScope silent>
      <DropdownMenu
        align="end"
        content={filled.map((section, index) => (
          <Fragment key={section[0]?.id}>
            {index > 0 && <DropdownMenuSeparator />}
            {section.map((item) => (
              <DropdownMenuItem key={item.id} onSelect={item.onSelect}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      >
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={label}
          className={styles.filterButton}
          icon={<KebabIcon />}
        />
      </DropdownMenu>
    </EventScope>
  );
}

interface ViewsMenuProps {
  views: DataTableView[];
  onApply: (view: DataTableView) => void;
  onDelete: (view: DataTableView) => void;
  onSave: (name: string) => void;
  labels: DataTableLabels;
}

/** The “Views” button: apply, delete and save named views of the table. */
export function ViewsMenu({ views, onApply, onDelete, onSave, labels }: ViewsMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(labels.viewNameRequired);
      return;
    }
    onSave(trimmed);
    setName('');
    setError(null);
    setAnnouncement(labels.viewSaved(trimmed));
  }

  return (
    // The popover and its controls are DataTable's own parts: only datatable events are emitted.
    <EventScope silent>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setAnnouncement('');
        }}
        align="end"
        aria-label={labels.views}
        className={styles.chooserPopover}
        content={
          <EventScope silent>
            <div className={styles.chooser}>
              <p className={styles.filterTitle}>{labels.views}</p>
              {views.length === 0 ? (
                <p className={styles.viewsEmpty}>{labels.noViews}</p>
              ) : (
                <ul className={styles.chooserList} aria-label={labels.savedViews}>
                  {views.map((view) => (
                    <li key={view.id} className={styles.chooserItem}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={styles.viewName}
                        aria-label={labels.applyView(view.name)}
                        onClick={() => {
                          onApply(view);
                          setOpen(false);
                        }}
                      >
                        {view.name}
                      </Button>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label={labels.deleteView(view.name)}
                        icon={<TrashIcon />}
                        onClick={() => {
                          onDelete(view);
                          setAnnouncement(labels.viewDeleted(view.name));
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <form className={styles.viewForm} onSubmit={submit} noValidate>
                <FormField invalid={error !== null}>
                  <FormLabel>{labels.viewName}</FormLabel>
                  <Input
                    size="sm"
                    value={name}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) => setName(event.target.value)}
                  />
                </FormField>
                {error && (
                  <span id={`${id}-error`} role="alert" className={styles.cellError}>
                    {error}
                  </span>
                )}
                <div className={styles.filterActions}>
                  <Button size="sm" type="submit">
                    {labels.saveView}
                  </Button>
                </div>
              </form>
              <p role="status" className={styles.visuallyHidden}>
                {announcement}
              </p>
            </div>
          </EventScope>
        }
      >
        <Button size="sm" variant="secondary">
          {labels.views}
        </Button>
      </Popover>
    </EventScope>
  );
}

function KebabIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3.5" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="8" cy="12.5" r="1.25" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" strokeLinejoin="round" />
    </svg>
  );
}
