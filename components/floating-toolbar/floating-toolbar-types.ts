import type { RemixiconComponentType } from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

/**
 * Icon type compatible with Remix Icons
 */
export type IconType = RemixiconComponentType;

/**
 * A suggestion item for commitments or goals popups
 */
export interface SuggestionItem {
  label: string;
  icon: IconType;
  color: string;
}

/**
 * A tab definition for goals categories
 */
export interface GoalsTabDefinition {
  id: string;
  label: string;
}

/**
 * Goals organized by tab ID
 */
export type GoalsByTab = Record<string, SuggestionItem[]>;

/**
 * A time allocation item for the hours breakdown
 */
export interface TimeAllocationItem {
  label: string;
  hours: number;
  icon: IconType;
  /** Background color class (e.g., "bg-indigo-500") */
  color: string;
}

/**
 * Color option for the icon picker
 */
export interface ColorOption {
  textColor: string;
  bgColor: string;
}

/**
 * Day of week definition
 */
export interface DayOfWeek {
  id: string;
  label: string;
}

/**
 * Selected item in the edit view
 */
export interface SelectedItem {
  label: string;
  icon: IconType;
  color: string;
  isCustom?: boolean;
}

// =============================================================================
// Props Interfaces
// =============================================================================

/**
 * Props for the ItemEditView component
 */
export interface ItemEditViewProps {
  item: SelectedItem;
  availableIcons: IconType[];
  availableColors: ColorOption[];
  daysOfWeek: DayOfWeek[];
  onBack: () => void;
}

/**
 * Props for the FloatingToolbar component
 */
export interface FloatingToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Commitment suggestions to display in the commitments popup */
  commitmentSuggestions: SuggestionItem[];
  /** Tab definitions for goals categories */
  goalsTabs: GoalsTabDefinition[];
  /** Goals organized by tab ID */
  goalsByTab: GoalsByTab;
  /** Time allocations for the hours breakdown (when hasAllocations is true) */
  timeAllocations?: TimeAllocationItem[];
  /** Whether to show time allocations breakdown */
  hasAllocations?: boolean;
  /** Available icons for the icon picker */
  availableIcons: IconType[];
  /** Available colors for the color picker */
  availableColors: ColorOption[];
  /** Days of week for repeat selection */
  daysOfWeek: DayOfWeek[];
}
