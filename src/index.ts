/**
 * Public API of @ufisoft/ui.
 * Only what is exported here is supported; deep imports are internal.
 * Styles ship separately: `import '@ufisoft/ui/styles.css'`.
 */

// Bundled into dist/styles.css at build time (tokens, reset, base).
import './styles/index.css';

// Foundations
export {
  Heading,
  type HeadingProps,
  type HeadingLevel,
  type HeadingSize,
} from './components/heading';
export {
  Text,
  type TextProps,
  type TextElement,
  type TextSize,
  type TextWeight,
  type TextTone,
} from './components/text';
export { Label, type LabelProps } from './components/label';
export {
  Stack,
  type StackProps,
  type StackElement,
  type StackDirection,
  type StackAlign,
  type StackJustify,
} from './components/stack';
export {
  Container,
  Row,
  Col,
  type ContainerProps,
  type ContainerElement,
  type ContainerSize,
  type RowProps,
  type RowElement,
  type RowAlign,
  type ColProps,
  type ColElement,
  type ColSpan,
  type ColValue,
} from './components/container';
export {
  Grid,
  type GridProps,
  type GridElement,
  type GridAlign,
  type GridColumnCount,
  type GridColumns,
} from './components/grid';
export { Divider, type DividerProps, type DividerOrientation } from './components/divider';
export {
  Image,
  type ImageProps,
  type ImageFit,
  type ImageRatio,
  type ImageRadius,
} from './components/image';
export { Card, type CardProps, type CardVariant, type CardPadding } from './components/card';
export { Avatar, type AvatarProps, type AvatarSize } from './components/avatar';

// Actions
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/button';
export { IconButton, type IconButtonProps } from './components/icon-button';
export {
  ButtonGroup,
  type ButtonGroupProps,
  type ButtonGroupOrientation,
} from './components/button-group';

// Forms
export {
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  useFormField,
  type FormFieldProps,
  type FormLabelProps,
  type FormDescriptionProps,
  type FormMessageProps,
  type FormFieldControlProps,
} from './components/form-field';
export { Input, type InputProps, type InputSize } from './components/input';
export { Textarea, type TextareaProps, type TextareaSize } from './components/textarea';
export { Select, type SelectProps, type SelectSize } from './components/select';
export {
  Combobox,
  type ComboboxProps,
  type ComboboxItem,
  type ComboboxSize,
} from './components/combobox';
export { DatePicker, type DatePickerProps, type DatePickerSize } from './components/date-picker';
export {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangePickerSize,
  type DateRange,
} from './components/date-range-picker';
export { TimePicker, type TimePickerProps, type TimePickerSize } from './components/time-picker';
export {
  TimeRangePicker,
  type TimeRangePickerProps,
  type TimeRangePickerSize,
  type TimeRange,
} from './components/time-range-picker';
export { Checkbox, type CheckboxProps } from './components/checkbox';
export {
  Radio,
  RadioGroup,
  type RadioProps,
  type RadioGroupProps,
  type RadioGroupOrientation,
} from './components/radio';
export { Switch, type SwitchProps } from './components/switch';
export { FileUpload, type FileUploadProps, type FileRejection } from './components/file-upload';

// Feedback
export { Alert, type AlertProps, type AlertTone } from './components/alert';
export { Spinner, type SpinnerProps, type SpinnerSize } from './components/spinner';
export { Badge, type BadgeProps, type BadgeTone, type BadgeSize } from './components/badge';
export {
  Skeleton,
  type SkeletonProps,
  type SkeletonShape,
  type SkeletonSize,
} from './components/skeleton';
export {
  Progress,
  type ProgressProps,
  type ProgressSize,
  type ProgressTone,
} from './components/progress';
export {
  ToastProvider,
  useToast,
  type ToastProviderProps,
  type ToastOptions,
  type ToastTone,
} from './components/toast';

// Overlay
export { Modal, type ModalProps, type ModalSize } from './components/modal';
export { Drawer, type DrawerProps, type DrawerSide, type DrawerSize } from './components/drawer';
export { Tooltip, type TooltipProps, type TooltipSide } from './components/tooltip';
export {
  Popover,
  type PopoverProps,
  type PopoverSide,
  type PopoverAlign,
} from './components/popover';
export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  type DropdownMenuProps,
  type DropdownMenuItemProps,
  type DropdownMenuSeparatorProps,
  type DropdownMenuLabelProps,
  type DropdownMenuSide,
  type DropdownMenuAlign,
  type DropdownMenuItemTone,
} from './components/dropdown-menu';
export {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  type ContextMenuProps,
  type ContextMenuItemProps,
  type ContextMenuSeparatorProps,
  type ContextMenuLabelProps,
  type ContextMenuItemTone,
} from './components/context-menu';

// Navigation
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsPanelProps,
  type TabsOrientation,
} from './components/tabs';
export {
  Accordion,
  AccordionItem,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionType,
} from './components/accordion';
export {
  Breadcrumb,
  BreadcrumbItem,
  type BreadcrumbProps,
  type BreadcrumbItemProps,
} from './components/breadcrumb';
export { Pagination, type PaginationProps } from './components/pagination';

// Data display
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type TableCellAlign,
} from './components/table';
export {
  DataTable,
  type DataTableProps,
  type DataTableColumn,
  type DataTableQuery,
  type DataTableLabels,
  type DataTableMode,
  type DataTableDensity,
  type DataTableMaxHeight,
  type DataTableSort,
  type DataTableSortDirection,
} from './components/data-table';
export { FilePreview, type FilePreviewProps, type FileInfo } from './components/file-preview';

// State & events
export {
  createStore,
  shallowEqual,
  type Store,
  type StoreListener,
  type StoreUpdate,
} from './state/create-store';
export { useStore } from './state/use-store';
export {
  createEventBus,
  type EventBus,
  type EventBusOptions,
  type EventListener,
  type EventMeta,
  type AnyEvent,
  type EventMap,
  type Unsubscribe,
} from './events/event-bus';
export {
  defineEvents,
  payload,
  type EventDefinition,
  type EventEntry,
  type EventGroup,
  type EventRegistry,
  type EventMapOf,
  type EventKey,
  type EventDomain,
  type EventSource,
  type EventDataProps,
  type PayloadType,
} from './events/define-events';
export {
  eventBus,
  eventRegistry,
  type UfiEventMap,
  type UfiEventName,
  type UfiEventPayload,
} from './events/registry';
export {
  EventBusProvider,
  useEventBus,
  useEventListener,
  type EventBusProviderProps,
} from './events/react';

// Tokens
export { breakpoints, type Breakpoint, type SpaceToken } from './tokens';
