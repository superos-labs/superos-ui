/**
 * =============================================================================
 * File: essentials-cta.tsx
 * =============================================================================
 *
 * Call-to-action surface for defining backlog "Essentials" during onboarding
 * or setup flows.
 *
 * This component orchestrates the entire essentials configuration experience:
 * - Sleep configuration (special case).
 * - Display of already-added essentials.
 * - Inline editing of suggested essentials.
 * - Creation of custom essentials.
 *
 * It coordinates UI state and delegates persistence upward via callbacks.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render header, list, and footer actions.
 * - Manage which row is expanded or being edited.
 * - Sort and filter essentials and suggestions.
 * - Bridge child editors to parent handlers.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting essentials or schedules.
 * - Defining suggestion data.
 * - Performing domain validation.
 *
 * -----------------------------------------------------------------------------
 * KEY DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - EssentialRow / SleepRow
 * - InlineEssentialCreator
 * - PlaceholderRow (suggestion-editor)
 * - SUGGESTED_ESSENTIALS
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Progress is defined as sleep configured or at least one essential added.
 * - Only one suggestion or essential can be edited at a time.
 * - Sleep row visually emphasized until configured.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - EssentialsCTA
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RiAddLine } from "@remixicon/react";
import { AnimatePresence } from "framer-motion";
import type { GoalIconOption } from "@/lib/types";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { EssentialItem, NewEssentialData } from "./essential-types";
import { SleepRow, EssentialRow } from "./essential-row";
import { InlineEssentialCreator } from "./inline-essential-creator";
import { SUGGESTED_ESSENTIALS } from "./suggested-essentials";
import { PlaceholderRow } from "./suggestion-editor";

// =============================================================================
// Types
// =============================================================================

export interface EssentialsCTAProps {
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
  /** Handler for adding a suggested essential */
  onAddEssential: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** IDs of essentials that have already been added (to hide from suggestions) */
  addedEssentialIds: string[];
  /** Essentials that have been added during CTA flow (to display) */
  addedEssentials: EssentialItem[];
  /** Templates for added essentials (for schedule display) */
  addedEssentialTemplates: EssentialTemplate[];
  /** Handler to save schedule for an added essential */
  onSaveSchedule: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Handler to delete an added essential */
  onDeleteEssential: (essentialId: string) => void;
  /** Called when user clicks "Skip" - hides essentials section */
  onSkip: () => void;
  /** Called when user clicks "Done" - transitions to standard list */
  onDone: () => void;
  /** Available icons for custom essential creation */
  essentialIcons: GoalIconOption[];
  className?: string;
}

// =============================================================================
// Main CTA Component
// =============================================================================

export function EssentialsCTA({
  sleepEssential,
  isSleepExpanded,
  onToggleSleepExpand,
  wakeUpMinutes,
  windDownMinutes,
  onSleepTimesChange,
  isSleepConfigured,
  onAddEssential,
  addedEssentialIds,
  addedEssentials,
  addedEssentialTemplates,
  onSaveSchedule,
  onDeleteEssential,
  onSkip,
  onDone,
  essentialIcons,
  className,
}: EssentialsCTAProps) {
  // Track which suggestion is being edited (null = none)
  const [editingSuggestionId, setEditingSuggestionId] = React.useState<
    string | null
  >(null);
  // State for showing the inline creator
  const [isCreating, setIsCreating] = React.useState(false);
  // Track which added essential is expanded
  const [expandedEssentialId, setExpandedEssentialId] = React.useState<
    string | null
  >(null);

  // Helper to get template for an added essential
  const getTemplate = (essentialId: string) =>
    addedEssentialTemplates.find((t) => t.essentialId === essentialId);

  // Sort added essentials by earliest start time
  const sortedAddedEssentials = [...addedEssentials].sort((a, b) => {
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

  // Determine if user has made progress (sleep configured OR essentials added)
  const hasProgress = isSleepConfigured || addedEssentialIds.length > 0;

  const handleToggleEssentialExpand = (id: string) => {
    setExpandedEssentialId((prev) => (prev === id ? null : id));
    // Close any editing suggestion or creator
    setEditingSuggestionId(null);
    setIsCreating(false);
  };

  const handleStartEdit = (suggestionId: string) => {
    setEditingSuggestionId(suggestionId);
    setIsCreating(false);
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
    <div className={cn("flex flex-col px-3 pt-2 pb-4", className)}>
      {/* Header */}
      <div className="flex flex-col gap-1 px-3 py-4">
        <h3 className="text-base font-semibold text-foreground">
          Define your essentials
        </h3>
        <p className="text-sm text-muted-foreground">
          Routine activities you do on a weekly basis and help see your
          availability more clearly. Added during weekly planning.
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5">
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

        {/* Added essentials - shown as confirmed rows */}
        {sortedAddedEssentials.map((essential) => (
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
        {/* Sorted by earliest time, filtered to exclude already-added */}
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

      {/* Footer with Skip/Continue button - full width with subtle animation */}
      <div className="px-3 pt-2">
        <button
          onClick={hasProgress ? onDone : onSkip}
          className={cn(
            "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            hasProgress
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="inline-block transition-opacity duration-150">
            {hasProgress ? "Continue" : "Skip"}
          </span>
        </button>
      </div>
    </div>
  );
}
