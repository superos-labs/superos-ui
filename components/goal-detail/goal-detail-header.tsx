"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIconColorClass } from "@/lib/colors";
import type { IconComponent, LifeArea } from "@/lib/types";
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
  /** Callback when title is edited */
  onTitleChange?: (title: string) => void;
  className?: string;
}

export function GoalDetailHeader({
  icon: Icon,
  title,
  color,
  lifeArea,
  onTitleChange,
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

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Icon */}
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Icon className={cn("size-6", getIconColorClass(color))} />
      </div>

      {/* Title (inline editable) and life area */}
      <div className="flex flex-col gap-0.5">
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
              "focus:outline-none"
            )}
          />
        ) : (
          <h1 className="text-xl font-semibold text-foreground leading-tight">
            {title}
          </h1>
        )}
        {lifeArea && (
          <span className="text-xs text-muted-foreground/60">
            {lifeArea.label}
          </span>
        )}
      </div>
    </div>
  );
}
