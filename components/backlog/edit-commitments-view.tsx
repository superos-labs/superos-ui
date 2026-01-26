"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloseLine,
  RiLockLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { BacklogItem } from "./backlog-types";

export interface EditCommitmentsViewProps {
  allCommitments: BacklogItem[];
  enabledIds: Set<string>;
  mandatoryIds: Set<string>;
  onToggle: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditCommitmentsView({
  allCommitments,
  enabledIds,
  mandatoryIds,
  onToggle,
  onSave,
  onCancel,
}: EditCommitmentsViewProps) {
  return (
    <div className="flex flex-col px-3 py-2">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-foreground">Edit Commitments</h3>
          <p className="text-xs text-muted-foreground">Choose which to track</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600"
            title="Save changes"
          >
            <RiCheckLine className="size-4" />
          </button>
          <button
            onClick={onCancel}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            title="Cancel"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {allCommitments.map((commitment) => {
          const isMandatory = mandatoryIds.has(commitment.id);
          const isEnabled = enabledIds.has(commitment.id);
          const IconComponent = commitment.icon;

          return (
            <button
              key={commitment.id}
              onClick={() => !isMandatory && onToggle(commitment.id)}
              disabled={isMandatory}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                isMandatory
                  ? "cursor-default"
                  : "cursor-pointer hover:bg-muted/60",
              )}
            >
              {/* Checkbox */}
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
                  isMandatory
                    ? "bg-muted text-muted-foreground"
                    : isEnabled
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-transparent",
                )}
              >
                {isMandatory ? (
                  <RiLockLine className="size-3" />
                ) : (
                  <RiCheckLine className="size-3" />
                )}
              </div>

              {/* Icon */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <IconComponent
                  className={cn(
                    "size-4",
                    isEnabled
                      ? getIconColorClass(commitment.color)
                      : "text-muted-foreground",
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "flex-1 text-left text-sm font-medium",
                  isEnabled ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {commitment.label}
              </span>

              {/* Required badge */}
              {isMandatory && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
