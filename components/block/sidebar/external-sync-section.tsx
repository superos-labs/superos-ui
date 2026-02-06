"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloseLine,
  RiPencilLine,
  RiEyeLine,
} from "@remixicon/react";
import type {
  BlockSyncState,
  BlockSyncSettings,
} from "@/lib/unified-schedule";
import type { AppearanceOverride } from "@/lib/calendar-sync";
import { ProviderBadge } from "@/components/integrations";
import { BlockSidebarSection } from "./sidebar-sections";

// =============================================================================
// External Calendar Sync Section
// =============================================================================

/** Appearance options for block sync override */
const APPEARANCE_OVERRIDE_OPTIONS: {
  value: AppearanceOverride;
  label: string;
}[] = [
  { value: "use_default", label: "Use goal setting" },
  { value: "blocked_superos", label: "Blocked with SuperOS" },
  { value: "busy", label: "Busy" },
  { value: "goal_title", label: "Goal name" },
  { value: "block_title", label: "Block title" },
  { value: "custom", label: "Custom" },
];

interface ExternalCalendarSyncSectionProps {
  /** Computed sync state for this block */
  syncState: BlockSyncState;
  /** Current block-level sync settings */
  blockSyncSettings?: BlockSyncSettings;
  /** Callback to update block sync appearance override */
  onSyncAppearanceChange?: (appearance: AppearanceOverride) => void;
  /** Callback to update block sync custom label */
  onSyncCustomLabelChange?: (label: string) => void;
  /** Goal name (for showing in "Goal name" option) */
  goalName?: string;
  /** Block title (for showing in "Block title" option) */
  blockTitle?: string;
}

export function ExternalCalendarSyncSection({
  syncState,
  blockSyncSettings,
  onSyncAppearanceChange,
  onSyncCustomLabelChange,
  goalName,
  blockTitle,
}: ExternalCalendarSyncSectionProps) {
  // Track which destination is being edited (by index)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  // Track pending override value during editing
  const [pendingOverride, setPendingOverride] =
    React.useState<AppearanceOverride | null>(null);
  // Track pending custom label during editing
  const [pendingCustomLabel, setPendingCustomLabel] = React.useState<string>("");

  const currentAppearance =
    blockSyncSettings?.appearanceOverride ?? "use_default";
  const currentCustomLabel = blockSyncSettings?.customLabel ?? "";

  const destinations = syncState.destinations ?? [];

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setPendingOverride(currentAppearance);
    setPendingCustomLabel(currentCustomLabel);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setPendingOverride(null);
    setPendingCustomLabel("");
  };

  const handleSaveEdit = () => {
    if (pendingOverride && onSyncAppearanceChange) {
      onSyncAppearanceChange(pendingOverride);
    }
    if (pendingOverride === "custom" && onSyncCustomLabelChange) {
      onSyncCustomLabelChange(pendingCustomLabel);
    }
    setEditingIndex(null);
    setPendingOverride(null);
    setPendingCustomLabel("");
  };

  const hasAppearanceChanges =
    pendingOverride !== null && pendingOverride !== currentAppearance;
  const hasCustomLabelChanges =
    pendingOverride === "custom" && pendingCustomLabel !== currentCustomLabel;
  const hasChanges = hasAppearanceChanges || hasCustomLabelChanges;

  // Compute display text based on pending override (for live preview while editing)
  const getDisplayTextForAppearance = (
    appearance: AppearanceOverride,
    dest: (typeof destinations)[0]
  ): string => {
    switch (appearance) {
      case "blocked_superos":
        return "Blocked with SuperOS";
      case "busy":
        return "Busy";
      case "goal_title":
        return goalName || dest.displayText;
      case "block_title":
        return blockTitle || dest.displayText;
      case "custom":
        return pendingCustomLabel || currentCustomLabel || "Custom";
      case "use_default":
        return dest.displayText;
      default:
        return dest.displayText;
    }
  };

  return (
    <BlockSidebarSection
      icon={<RiEyeLine className="size-3.5" />}
      label="Display externally as"
    >
      <div className="flex flex-col gap-2">
        {destinations.map((dest, index) => {
          const isEditing = editingIndex === index;

          return (
            <div
              key={`${dest.provider}-${dest.calendarName}-${index}`}
              className="flex flex-col"
            >
              {/* Destination row */}
              <div className="flex items-center gap-2.5">
                {/* Provider icon */}
                <ProviderBadge provider={dest.provider} size="md" />

                {/* Provider and calendar info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm text-foreground">
                      {dest.providerName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {dest.calendarName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isEditing && pendingOverride
                      ? getDisplayTextForAppearance(pendingOverride, dest)
                      : dest.displayText}
                  </span>
                </div>

                {/* Edit/Save/Cancel button */}
                {onSyncAppearanceChange && (
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        {hasChanges ? (
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className={cn(
                              "flex size-7 items-center justify-center rounded-lg",
                              "text-emerald-600 dark:text-emerald-400",
                              "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                              "transition-colors duration-150",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                            aria-label="Save changes"
                          >
                            <RiCheckLine className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className={cn(
                              "flex size-7 items-center justify-center rounded-lg",
                              "text-muted-foreground",
                              "hover:bg-muted hover:text-foreground",
                              "transition-colors duration-150",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                            aria-label="Cancel"
                          >
                            <RiCloseLine className="size-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(index)}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg",
                          "text-muted-foreground",
                          "hover:bg-muted hover:text-foreground",
                          "transition-colors duration-150",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                        aria-label="Edit appearance"
                      >
                        <RiPencilLine className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Override options (shown when editing) */}
              {isEditing && (
                <div className="mt-2 ml-7 flex flex-col gap-0.5">
                  {APPEARANCE_OVERRIDE_OPTIONS.map((option) => {
                    const isSelected = pendingOverride === option.value;

                    // Get the actual label to display
                    let displayLabel = option.label;
                    if (option.value === "goal_title" && goalName) {
                      displayLabel = goalName;
                    } else if (option.value === "block_title" && blockTitle) {
                      displayLabel = blockTitle;
                    }

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setPendingOverride(option.value)}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg py-1.5 text-left",
                          "transition-colors duration-150",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full transition-all duration-150",
                            isSelected
                              ? "bg-foreground"
                              : "ring-1 ring-inset ring-border bg-background group-hover:ring-foreground/20"
                          )}
                        >
                          {isSelected && (
                            <span className="size-1.5 rounded-full bg-background" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {displayLabel}
                        </span>
                      </button>
                    );
                  })}
                  {/* Custom label input - shown when custom is selected */}
                  {pendingOverride === "custom" && (
                    <input
                      type="text"
                      value={pendingCustomLabel}
                      onChange={(e) => setPendingCustomLabel(e.target.value)}
                      placeholder="Enter custom label..."
                      className={cn(
                        "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                        "placeholder:text-muted-foreground/60",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BlockSidebarSection>
  );
}
