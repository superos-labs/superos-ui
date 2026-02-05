"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIconColorClass, getIconBgClass } from "@/lib/colors";
import { RiArrowDownSLine, RiCheckLine, RiAddLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import type { IconComponent, LifeArea, GoalIconOption } from "@/lib/types";
import type { GoalColor } from "@/lib/colors";

export interface GoalDetailHeaderProps {
  /** Goal icon component */
  icon: IconComponent;
  /** Goal title */
  title: string;
  /** Goal color */
  color: GoalColor;
  /** Associated life area */
  lifeArea?: LifeArea;
  /** Optional target completion date (ISO date string) */
  deadline?: string;
  /** Available life areas for editing */
  lifeAreas?: LifeArea[];
  /** Available icons for editing */
  goalIcons?: GoalIconOption[];
  /** Callback when title is edited */
  onTitleChange?: (title: string) => void;
  /** Callback when icon is changed */
  onIconChange?: (icon: IconComponent) => void;
  /** Callback when color is changed */
  onColorChange?: (color: GoalColor) => void;
  /** Callback when life area is changed */
  onLifeAreaChange?: (lifeAreaId: string) => void;
  /** Callback when deadline is changed (undefined to clear) */
  onDeadlineChange?: (deadline: string | undefined) => void;
  /** Callback to open the add life area modal */
  onAddLifeArea?: () => void;
  className?: string;
}

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

export function GoalDetailHeader({
  icon: Icon,
  title,
  color,
  lifeArea,
  deadline,
  lifeAreas,
  goalIcons,
  onTitleChange,
  onIconChange,
  onColorChange,
  onLifeAreaChange,
  onDeadlineChange,
  onAddLifeArea,
  className,
}: GoalDetailHeaderProps) {
  const [editValue, setEditValue] = React.useState(title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync edit value when title prop changes
  React.useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleBlur = () => {
    if (editValue.trim() && editValue.trim() !== title) {
      onTitleChange?.(editValue.trim());
    } else {
      setEditValue(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(title);
      inputRef.current?.blur();
    }
  };

  // Whether icon/color editing is enabled
  const canEditIconColor = goalIcons && (onIconChange || onColorChange);
  // Whether life area editing is enabled
  const canEditLifeArea = lifeAreas && lifeAreas.length > 0 && onLifeAreaChange;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Icon - editable if callbacks provided */}
      {canEditIconColor ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-12 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted/80"
              title="Change icon and color"
            >
              <Icon className={cn("size-6", getIconColorClass(color))} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2">
            <DropdownMenuLabel className="px-1 py-1">Icon</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {goalIcons.map((iconOption) => {
                const IconComp = iconOption.icon;
                const isSelected = Icon === iconOption.icon;
                return (
                  <button
                    key={iconOption.label}
                    onClick={() => onIconChange?.(iconOption.icon)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                  onClick={() => onColorChange?.(c)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-md transition-all",
                    color === c &&
                      "ring-2 ring-foreground ring-offset-1 ring-offset-background",
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
      ) : (
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <Icon className={cn("size-6", getIconColorClass(color))} />
        </div>
      )}

      {/* Title (inline editable) */}
      {onTitleChange ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Goal title..."
          className={cn(
            "w-full bg-transparent text-xl font-semibold text-foreground leading-tight",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none",
          )}
        />
      ) : (
        <h1 className="text-xl font-semibold text-foreground leading-tight">
          {title}
        </h1>
      )}

      {/* Metadata pills row */}
      <div className="flex items-center gap-2">
        {/* Life area pill */}
        {canEditLifeArea ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs transition-colors hover:bg-muted/80">
                {lifeArea ? (
                  <>
                    {(() => {
                      const AreaIcon = lifeArea.icon;
                      return (
                        <AreaIcon
                          className={cn(
                            "size-3.5",
                            getIconColorClass(lifeArea.color),
                          )}
                        />
                      );
                    })()}
                    <span>{lifeArea.label}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Set life area</span>
                )}
                <RiArrowDownSLine className="size-3 text-muted-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel className="text-xs text-muted-foreground/70 font-normal">
                Life area
              </DropdownMenuLabel>
              {lifeAreas.map((area) => {
                const AreaIcon = area.icon;
                const isSelected = lifeArea?.id === area.id;
                return (
                  <DropdownMenuItem
                    key={area.id}
                    onClick={() => onLifeAreaChange(area.id)}
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
              {onAddLifeArea && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onAddLifeArea}
                    className="gap-2 text-muted-foreground"
                  >
                    <RiAddLine className="size-3.5" />
                    Add new...
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : lifeArea ? (
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs">
            {(() => {
              const AreaIcon = lifeArea.icon;
              return (
                <AreaIcon
                  className={cn("size-3.5", getIconColorClass(lifeArea.color))}
                />
              );
            })()}
            <span>{lifeArea.label}</span>
          </div>
        ) : null}

        {/* Deadline pill */}
        {onDeadlineChange ? (
          <DatePicker
            value={deadline}
            onChange={onDeadlineChange}
            placeholder="Set target date"
            className="bg-muted hover:bg-muted/80"
          />
        ) : deadline ? (
          <DatePicker
            value={deadline}
            placeholder="Target date"
            className="bg-muted pointer-events-none"
            disabled
          />
        ) : null}
      </div>
    </div>
  );
}
