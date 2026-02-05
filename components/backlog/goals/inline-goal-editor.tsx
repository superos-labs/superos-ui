"use client";

/**
 * InlineGoalEditor - Inline editor for creating/editing goals during onboarding.
 *
 * Features:
 * - Editable label input
 * - Icon picker (popover)
 * - Color picker (popover)
 * - Life area dropdown
 * - Add/Done/Delete/Cancel actions
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
  RiCheckLine,
  RiStarLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import {
  getIconColorClass,
  getIconBgClass,
  getIconBgSoftClass,
} from "@/lib/colors";
import type { GoalColor } from "@/lib/colors";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface InlineGoalEditorData {
  label: string;
  icon: IconComponent;
  color: GoalColor;
  lifeAreaId: string;
  /** Optional target completion date (ISO date string) */
  deadline?: string;
}

export interface InlineGoalEditorProps {
  /** Initial values (from suggestion or existing goal) */
  initialData: InlineGoalEditorData;
  /** Available life areas */
  lifeAreas: LifeArea[];
  /** Available icons */
  goalIcons: GoalIconOption[];
  /** Called when user confirms */
  onSave: (data: InlineGoalEditorData) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Called when user deletes (only shown in edit mode) */
  onDelete?: () => void;
  /** Mode: "add" shows Add button, "edit" shows Done/Delete */
  mode: "add" | "edit";
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

// Subset of colors for the picker (most distinct/common)
const PICKER_COLORS: GoalColor[] = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
];

// =============================================================================
// Component
// =============================================================================

export function InlineGoalEditor({
  initialData,
  lifeAreas,
  goalIcons,
  onSave,
  onCancel,
  onDelete,
  mode,
  className,
}: InlineGoalEditorProps) {
  // Get fallback values (use RiStarLine as absolute fallback icon)
  const fallbackIcon: IconComponent = goalIcons?.[0]?.icon ?? RiStarLine;
  const fallbackColor: GoalColor = lifeAreas?.[0]?.color ?? "violet";
  const fallbackLifeAreaId = lifeAreas?.[0]?.id ?? "";

  // State for form fields (with fallbacks for safety)
  // Note: icon state needs lazy initializer to avoid React treating the function as an initializer
  const [label, setLabel] = React.useState(initialData?.label ?? "");
  const [icon, setIcon] = React.useState<IconComponent>(
    () => initialData?.icon ?? fallbackIcon
  );
  const [color, setColor] = React.useState<GoalColor>(
    initialData?.color ?? fallbackColor
  );
  const [lifeAreaId, setLifeAreaId] = React.useState(
    initialData?.lifeAreaId ?? fallbackLifeAreaId
  );
  const [deadline, setDeadline] = React.useState<string | undefined>(
    initialData?.deadline
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Get the current life area
  const currentLifeArea = lifeAreas.find((a) => a.id === lifeAreaId);

  // Handle save
  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      icon,
      color,
      lifeAreaId,
      deadline,
    });
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const IconComponent = icon;

  // Early return if no icon available (shouldn't happen in practice)
  if (!IconComponent) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
        {/* Header with icon button and label input */}
        <div className="flex items-center gap-2">
          {/* Icon/Color picker button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  getIconBgSoftClass(color),
                  "hover:opacity-80"
                )}
                title="Change icon and color"
              >
                <IconComponent
                  className={cn("size-4", getIconColorClass(color))}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
              <DropdownMenuLabel className="px-1 py-1">Icon</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1 px-1 pb-2">
                {goalIcons.slice(0, 40).map((iconOption) => {
                  const IconComp = iconOption.icon;
                  const isSelected = icon === iconOption.icon;
                  return (
                    <button
                      key={iconOption.label}
                      onClick={() => setIcon(() => iconOption.icon)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md transition-colors",
                        isSelected
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={iconOption.label}
                    >
                      <IconComp className="size-3.5" />
                    </button>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-1 py-1">Color</DropdownMenuLabel>
              <div className="flex flex-wrap gap-1 px-1 pb-1">
                {PICKER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-md transition-all",
                      color === c &&
                        "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                    )}
                    title={c}
                  >
                    <div
                      className={cn("size-4 rounded-full", getIconBgClass(c))}
                    />
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Label input */}
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Goal name..."
            className={cn(
              "flex-1 bg-transparent text-sm font-medium text-foreground",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none"
            )}
          />

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Life area picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Life area
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-fit items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs transition-colors hover:bg-background/80">
                {currentLifeArea ? (
                  <>
                    {(() => {
                      const AreaIcon = currentLifeArea.icon;
                      return (
                        <AreaIcon
                          className={cn(
                            "size-3.5",
                            getIconColorClass(currentLifeArea.color)
                          )}
                        />
                      );
                    })()}
                    <span>{currentLifeArea.label}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Select...</span>
                )}
                <RiArrowDownSLine className="size-3 text-muted-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground/70">
                Life area
              </DropdownMenuLabel>
              {lifeAreas.map((area) => {
                const AreaIcon = area.icon;
                const isSelected = lifeAreaId === area.id;
                return (
                  <DropdownMenuItem
                    key={area.id}
                    onClick={() => setLifeAreaId(area.id)}
                    className={cn("gap-2", isSelected && "bg-accent")}
                  >
                    <AreaIcon
                      className={cn("size-3.5", getIconColorClass(area.color))}
                    />
                    {area.label}
                    {isSelected && <RiCheckLine className="ml-auto size-3.5" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Target date picker (optional) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Target date (optional)
          </span>
          <DatePicker
            value={deadline}
            onChange={setDeadline}
            placeholder="Set target date"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {mode === "add" ? (
            <button
              onClick={handleSave}
              disabled={!label.trim()}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                label.trim()
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              Add
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  label.trim()
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                Done
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Delete goal"
                >
                  <RiDeleteBinLine className="size-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
