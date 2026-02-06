/**
 * =============================================================================
 * File: essentials-types.ts
 * =============================================================================
 *
 * Type definitions and defaults for configuring "Essentials" and their
 * recurring weekly time slots.
 *
 * Essentials represent non-negotiable life activities (e.g., eating, commuting,
 * exercising) that can be templated and later imported into schedules or
 * blueprints.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Define core types for essential slots, templates, and configuration.
 * - Provide default slot presets for common essentials.
 * - Define import option types for converting essentials to calendar events.
 * - Define hook option/return contracts for managing essential configuration.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting essential configuration.
 * - Rendering essential configuration UI.
 * - Performing calendar import logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Slots are expressed in minutes-from-midnight for consistency.
 * - Templates can contain multiple slots per essential.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EssentialSlot
 * - EssentialTemplate
 * - EssentialConfig
 * - DEFAULT_ESSENTIAL_SLOTS
 * - ImportEssentialsOptions
 * - UseEssentialConfigOptions
 * - UseEssentialConfigReturn
 */

// =============================================================================
// Essential Slot
// =============================================================================

/**
 * A single scheduled time slot for an essential.
 * Represents a recurring time block (e.g., "Lunch at 12:30pm for 1 hour").
 */
export interface EssentialSlot {
  /** Unique identifier for this slot */
  id: string;
  /** Days this slot applies to (0-6, where 0 = first day of week per user preference) */
  days: number[];
  /** Start time in minutes from midnight (e.g., 750 = 12:30 PM) */
  startMinutes: number;
  /** Duration in minutes (e.g., 60 = 1 hour) */
  durationMinutes: number;
}

// =============================================================================
// Essential Template
// =============================================================================

/**
 * Template for an essential's typical weekly schedule.
 * Contains one or more time slots for the essential.
 */
export interface EssentialTemplate {
  /** The essential this template is for */
  essentialId: string;
  /** Time slots for this essential (can have multiple, e.g., lunch and dinner for "Eat") */
  slots: EssentialSlot[];
}

// =============================================================================
// Essential Config
// =============================================================================

/**
 * User's complete essential configuration.
 * Stores which essentials are enabled and their schedule templates.
 */
export interface EssentialConfig {
  /** Which essentials are enabled for tracking */
  enabledIds: string[];
  /** Schedule templates for enabled essentials */
  templates: EssentialTemplate[];
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default slot presets for common essentials.
 * Used as suggestions when a user enables an essential.
 */
export const DEFAULT_ESSENTIAL_SLOTS: Record<string, EssentialSlot[]> = {
  eat: [
    // Lunch: every day at 12:30 PM for 1 hour
    {
      id: "eat-lunch",
      days: [0, 1, 2, 3, 4, 5, 6],
      startMinutes: 750,
      durationMinutes: 60,
    },
    // Dinner: every day at 7:00 PM for 1 hour
    {
      id: "eat-dinner",
      days: [0, 1, 2, 3, 4, 5, 6],
      startMinutes: 1140,
      durationMinutes: 60,
    },
  ],
  exercise: [
    // Mon/Wed/Fri at 11:00 AM for 1 hour
    {
      id: "exercise-1",
      days: [0, 2, 4],
      startMinutes: 660,
      durationMinutes: 60,
    },
  ],
  commute: [
    // Mon-Fri morning at 8:00 AM for 30 min
    {
      id: "commute-am",
      days: [0, 1, 2, 3, 4],
      startMinutes: 480,
      durationMinutes: 30,
    },
    // Mon-Fri evening at 6:00 PM for 30 min
    {
      id: "commute-pm",
      days: [0, 1, 2, 3, 4],
      startMinutes: 1080,
      durationMinutes: 30,
    },
  ],
  downtime: [
    // Every day at 9:00 PM for 1 hour
    {
      id: "downtime-1",
      days: [0, 1, 2, 3, 4, 5, 6],
      startMinutes: 1260,
      durationMinutes: 60,
    },
  ],
  chores: [
    // Sat/Sun at 10:00 AM for 2 hours
    { id: "chores-1", days: [5, 6], startMinutes: 600, durationMinutes: 120 },
  ],
};

// =============================================================================
// Import Utilities Types
// =============================================================================

/**
 * Parameters for importing essential templates to calendar events.
 */
export interface ImportEssentialsOptions {
  /** Essential templates to import */
  templates: EssentialTemplate[];
  /** Week dates (7 Date objects, starting from the first day of the week) */
  weekDates: Date[];
  /** Essential data (for label, color, etc.) */
  essentials: { id: string; label: string; color: string }[];
}

// =============================================================================
// Hook Types
// =============================================================================

export interface UseEssentialConfigOptions {
  /** Initial enabled essential IDs */
  initialEnabledIds?: string[];
  /** Initial templates (if any) */
  initialTemplates?: EssentialTemplate[];
}

export interface UseEssentialConfigReturn {
  /** Current essential configuration */
  config: EssentialConfig;

  /** Enable an essential (with default slots) */
  enableEssential: (essentialId: string) => void;

  /** Disable an essential (removes from enabled and clears template) */
  disableEssential: (essentialId: string) => void;

  /** Toggle essential enabled state */
  toggleEssential: (essentialId: string) => void;

  /** Check if an essential is enabled */
  isEnabled: (essentialId: string) => boolean;

  /** Get template for an essential (returns undefined if not enabled) */
  getTemplate: (essentialId: string) => EssentialTemplate | undefined;

  /** Add a slot to an essential's template */
  addSlot: (essentialId: string, slot: Omit<EssentialSlot, "id">) => void;

  /** Update a slot in an essential's template */
  updateSlot: (
    essentialId: string,
    slotId: string,
    updates: Partial<Omit<EssentialSlot, "id">>
  ) => void;

  /** Remove a slot from an essential's template */
  removeSlot: (essentialId: string, slotId: string) => void;

  /** Replace all slots for an essential */
  setSlots: (essentialId: string, slots: EssentialSlot[]) => void;
}
