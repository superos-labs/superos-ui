"use client";

/**
 * BlueprintEssentialsSection - Embedded essentials creation for blueprint setup.
 *
 * Allows users to create, edit, and delete essentials directly within the
 * blueprint backlog panel. Essentials are auto-imported to the calendar
 * as they are created.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAddLine,
  RiRestaurantLine,
  RiCarLine,
  RiHome4Line,
  RiCloseLine,
} from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import type { GoalColor } from "@/lib/colors";
import { getIconColorClass } from "@/lib/colors";
import type { GoalIconOption, IconComponent } from "@/lib/types";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { ScheduleEssential } from "@/lib/unified-schedule";
import { SleepRow, EssentialRow, InlineEssentialCreator } from "@/components/backlog/essentials";
import type { EssentialItem, NewEssentialData } from "@/components/backlog/essentials";
import { DAY_LABELS, DAY_FULL_LABELS } from "@/lib/time-utils";
import { TimeInput } from "@/components/ui/time-input";

// =============================================================================
// Types
// =============================================================================

interface SuggestedEssential {
  id: string;
  label: string;
  icon: IconComponent;
  color: GoalColor;
  /** Default days (0-6, 0 = first day of week) */
  defaultDays: number[];
  /** Default start time in minutes from midnight */
  defaultStartMinutes: number;
  /** Default duration in minutes */
  defaultDurationMinutes: number;
}

export interface BlueprintEssentialsSectionProps {
  /** Sleep essential item */
  sleepEssential: EssentialItem;
  /** Whether sleep row is expanded */
  isSleepExpanded: boolean;
  /** Toggle sleep row expansion */
  onToggleSleepExpand: () => void;
  /** Sleep wake up time in minutes */
  wakeUpMinutes: number;
  /** Sleep wind down time in minutes */
  windDownMinutes: number;
  /** Handler for sleep times change */
  onSleepTimesChange: (wakeUp: number, windDown: number) => void;
  /** Whether sleep is configured */
  isSleepConfigured: boolean;
  /** Essentials that have been added (to display) */
  essentials: ScheduleEssential[];
  /** Templates for essentials (for schedule display) */
  essentialTemplates: EssentialTemplate[];
  /** Handler for adding a new essential (should auto-import to calendar) */
  onAddEssential: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Handler to save schedule for an essential */
  onSaveSchedule: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Handler to delete an essential (should also delete calendar events) */
  onDeleteEssential: (essentialId: string) => void;
  /** Available icons for custom essential creation */
  essentialIcons: GoalIconOption[];
  className?: string;
}

// =============================================================================
// Suggested Essentials Data with Sensible Defaults
// =============================================================================

const SUGGESTED_ESSENTIALS: SuggestedEssential[] = [
  {
    id: "lunch",
    label: "Lunch",
    icon: RiRestaurantLine,
    color: "amber",
    defaultDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    defaultStartMinutes: 750, // 12:30 PM
    defaultDurationMinutes: 60, // 1 hour
  },
  {
    id: "dinner",
    label: "Dinner",
    icon: RiRestaurantLine,
    color: "amber",
    defaultDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    defaultStartMinutes: 1140, // 7:00 PM
    defaultDurationMinutes: 60, // 1 hour
  },
  {
    id: "commute",
    label: "Commute",
    icon: RiCarLine,
    color: "slate",
    defaultDays: [0, 1, 2, 3, 4], // Mon-Fri (weekdays)
    defaultStartMinutes: 480, // 8:00 AM
    defaultDurationMinutes: 30, // 30 min
  },
  {
    id: "chores",
    label: "Chores",
    icon: RiHome4Line,
    color: "orange",
    defaultDays: [5, 6], // Sat-Sun (weekend)
    defaultStartMinutes: 600, // 10:00 AM
    defaultDurationMinutes: 120, // 2 hours
  },
];

// =============================================================================
// Inline Suggestion Editor
// =============================================================================

interface SuggestionEditorProps {
  suggestion: SuggestedEssential;
  onSave: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  onCancel: () => void;
}

function SuggestionEditor({
  suggestion,
  onSave,
  onCancel,
}: SuggestionEditorProps) {
  const [selectedDays, setSelectedDays] = React.useState<number[]>(
    suggestion.defaultDays,
  );
  const [startMinutes, setStartMinutes] = React.useState(
    suggestion.defaultStartMinutes,
  );
  const [durationMinutes, setDurationMinutes] = React.useState(
    suggestion.defaultDurationMinutes,
  );

  const IconComponent = suggestion.icon;

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const handleEndChange = (newEnd: number) => {
    const newDuration = newEnd - startMinutes;
    if (newDuration > 0) {
      setDurationMinutes(newDuration);
    }
  };

  const handleSave = () => {
    if (selectedDays.length === 0) return;

    const slots: EssentialSlot[] = [
      {
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        days: selectedDays,
        startMinutes,
        durationMinutes,
      },
    ];

    onSave(
      {
        label: suggestion.label,
        icon: suggestion.icon,
        color: suggestion.color,
      },
      slots,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
        {/* Header with icon, label, and cancel button */}
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <IconComponent
              className={cn("size-4", getIconColorClass(suggestion.color))}
            />
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">
            {suggestion.label}
          </span>
          <button
            onClick={onCancel}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Day selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Days
          </span>
          <div className="flex gap-1">
            {DAY_LABELS.map((dayLabel, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-foreground/20 text-foreground"
                      : "bg-background text-muted-foreground/50 hover:bg-background/80 hover:text-muted-foreground",
                  )}
                  title={DAY_FULL_LABELS[index]}
                >
                  {dayLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time range */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Time
          </span>
          <div className="flex items-center gap-2">
            <TimeInput
              value={startMinutes}
              onChange={setStartMinutes}
              className="bg-background"
            />
            <span className="text-muted-foreground/70">–</span>
            <TimeInput
              value={startMinutes + durationMinutes}
              onChange={handleEndChange}
              className="bg-background"
            />
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleSave}
          disabled={selectedDays.length === 0}
          className={cn(
            "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            selectedDays.length > 0
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Placeholder Suggestion Row
// =============================================================================

interface PlaceholderRowProps {
  suggestion: SuggestedEssential;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  onCancel: () => void;
}

function PlaceholderRow({
  suggestion,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: PlaceholderRowProps) {
  const IconComponent = suggestion.icon;
  const [isHovered, setIsHovered] = React.useState(false);

  if (isEditing) {
    return (
      <SuggestionEditor
        suggestion={suggestion}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <button
      onClick={onStartEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/60",
      )}
    >
      {/* Icon */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 transition-colors group-hover:bg-muted/60">
        <IconComponent
          className={cn(
            "size-4 transition-colors",
            isHovered
              ? getIconColorClass(suggestion.color)
              : "text-muted-foreground/40",
          )}
        />
      </div>

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-sm transition-colors",
          isHovered ? "text-muted-foreground" : "text-muted-foreground/50",
        )}
      >
        {suggestion.label}
      </span>

      {/* Plus icon - animated on hover */}
      <motion.div
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0.3,
          scale: isHovered ? 1 : 0.9,
        }}
        transition={{ duration: 0.15 }}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground"
      >
        <RiAddLine className="size-4" />
      </motion.div>
    </button>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function BlueprintEssentialsSection({
  sleepEssential,
  isSleepExpanded,
  onToggleSleepExpand,
  wakeUpMinutes,
  windDownMinutes,
  onSleepTimesChange,
  isSleepConfigured,
  essentials,
  essentialTemplates,
  onAddEssential,
  onSaveSchedule,
  onDeleteEssential,
  essentialIcons,
  className,
}: BlueprintEssentialsSectionProps) {
  // Track which suggestion is being edited (null = none)
  const [editingSuggestionId, setEditingSuggestionId] = React.useState<
    string | null
  >(null);
  // State for showing the inline creator
  const [isCreating, setIsCreating] = React.useState(false);
  // Track which essential is expanded for editing
  const [expandedEssentialId, setExpandedEssentialId] = React.useState<
    string | null
  >(null);

  // Helper to get template for an essential
  const getTemplate = (essentialId: string) =>
    essentialTemplates.find((t) => t.essentialId === essentialId);

  // Get IDs of already-added essentials (excluding sleep)
  const addedEssentialIds = essentials
    .filter((e) => e.id !== "sleep")
    .map((e) => e.id);

  // Convert ScheduleEssential to EssentialItem for display
  const essentialItems: EssentialItem[] = essentials
    .filter((e) => e.id !== "sleep")
    .map((e) => ({
      id: e.id,
      label: e.label,
      icon: e.icon,
      color: e.color,
    }));

  // Sort essentials by earliest start time
  const sortedEssentials = [...essentialItems].sort((a, b) => {
    const aTemplate = getTemplate(a.id);
    const bTemplate = getTemplate(b.id);
    const aStart = aTemplate?.slots[0]?.startMinutes ?? Infinity;
    const bStart = bTemplate?.slots[0]?.startMinutes ?? Infinity;
    return aStart - bStart;
  });

  // Filter out already-added suggestions and sort by time (earliest first)
  const availableSuggestions = SUGGESTED_ESSENTIALS.filter(
    (s) => !addedEssentialIds.includes(s.id),
  ).sort((a, b) => a.defaultStartMinutes - b.defaultStartMinutes);

  const handleToggleEssentialExpand = (id: string) => {
    setExpandedEssentialId((prev) => (prev === id ? null : id));
    // Close any editing suggestion or creator
    setEditingSuggestionId(null);
    setIsCreating(false);
  };

  const handleStartEdit = (suggestionId: string) => {
    setEditingSuggestionId(suggestionId);
    setIsCreating(false);
    setExpandedEssentialId(null);
    // Collapse sleep if it was expanded
    if (isSleepExpanded) {
      onToggleSleepExpand();
    }
  };

  const handleCancelEdit = () => {
    setEditingSuggestionId(null);
  };

  const handleSaveEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    onAddEssential(data, slots);
    setEditingSuggestionId(null);
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setEditingSuggestionId(null);
    setExpandedEssentialId(null);
    // Collapse sleep if it was expanded
    if (isSleepExpanded) {
      onToggleSleepExpand();
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSaveNewEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    onAddEssential(data, slots);
    setIsCreating(false);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Section header */}
      <div className="px-4 pb-1">
        <h4 className="text-xs font-medium text-muted-foreground">Essentials</h4>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 px-2">
        {/* Sleep Row - with subtle emphasis when not configured */}
        <div
          className={cn(
            "rounded-xl transition-colors",
            !isSleepConfigured && !isSleepExpanded && "bg-muted/20",
          )}
        >
          <SleepRow
            essential={sleepEssential}
            isExpanded={isSleepExpanded}
            onToggleExpand={onToggleSleepExpand}
            wakeUpMinutes={wakeUpMinutes}
            windDownMinutes={windDownMinutes}
            onTimesChange={onSleepTimesChange}
            isConfigured={isSleepConfigured}
          />
        </div>

        {/* Added essentials - shown as editable rows */}
        {sortedEssentials.map((essential) => (
          <EssentialRow
            key={essential.id}
            essential={essential}
            template={getTemplate(essential.id)}
            isExpanded={expandedEssentialId === essential.id}
            onToggleExpand={() => handleToggleEssentialExpand(essential.id)}
            onSaveSchedule={(slots) => onSaveSchedule(essential.id, slots)}
            onDelete={() => onDeleteEssential(essential.id)}
          />
        ))}

        {/* Suggested essentials - placeholder style with inline editing */}
        <AnimatePresence mode="sync">
          {availableSuggestions.map((suggestion) => (
            <PlaceholderRow
              key={suggestion.id}
              suggestion={suggestion}
              isEditing={editingSuggestionId === suggestion.id}
              onStartEdit={() => handleStartEdit(suggestion.id)}
              onSave={handleSaveEssential}
              onCancel={handleCancelEdit}
            />
          ))}
        </AnimatePresence>

        {/* Inline essential creator */}
        {isCreating && (
          <InlineEssentialCreator
            essentialIcons={essentialIcons}
            onSave={handleSaveNewEssential}
            onCancel={handleCancelCreate}
          />
        )}

        {/* Add essential button */}
        {!isCreating && (
          <button
            onClick={handleStartCreating}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <RiAddLine className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Add essential</span>
          </button>
        )}
      </div>
    </div>
  );
}
