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

// Actions
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/button';
export { IconButton, type IconButtonProps } from './components/icon-button';

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
export { Checkbox, type CheckboxProps } from './components/checkbox';
export {
  Radio,
  RadioGroup,
  type RadioProps,
  type RadioGroupProps,
  type RadioGroupOrientation,
} from './components/radio';
export { Switch, type SwitchProps } from './components/switch';

// Feedback
export { Alert, type AlertProps, type AlertTone } from './components/alert';
export { Spinner, type SpinnerProps, type SpinnerSize } from './components/spinner';

// Overlay
export { Modal, type ModalProps, type ModalSize } from './components/modal';
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

// Tokens
export { breakpoints, type Breakpoint, type SpaceToken } from './tokens';
