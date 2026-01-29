"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiMoonLine,
} from "@remixicon/react";
import { getIconColorClass } from "@/lib/colors";
import type { EssentialSlot, EssentialTemplate } from "@/lib/essentials";
import type { GoalIconOption } from "@/lib/types";
import type { EssentialItem, NewEssentialData } from "./essential-types";
import { EssentialRow, SleepRow } from "./essential-row";
import { InlineEssentialCreator } from "./inline-essential-creator";
import { EssentialsCTA } from "./essentials-cta";

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of icons to show in collapsed state before showing overflow */
const MAX_COLLAPSED_ICONS = 6;

// =============================================================================
// CollapsedIconStrip Component
// =============================================================================

interface CollapsedIconStripProps {
  essentials: EssentialItem[];
  onClick?: () => void;
}

/**
 * Horizontal strip of essential icons shown when the section is collapsed.
 * Displays up to MAX_COLLAPSED_ICONS icons with a "+N" overflow indicator.
 */
function CollapsedIconStrip({ essentials, onClick }: CollapsedIconStripProps) {
  const visibleEssentials = essentials.slice(0, MAX_COLLAPSED_ICONS);
  const overflowCount = essentials.length - MAX_COLLAPSED_ICONS;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/30"
    >
      {visibleEssentials.map((essential) => {
        const IconComponent = essential.icon;
        return (
          <div
            key={essential.id}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60"
            title={essential.label}
          >
            <IconComponent
              className={cn("size-4", getIconColorClass(essential.color))}
            />
          </div>
        );
      })}
      {overflowCount > 0 && (
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60"
          title={`${overflowCount} more essential${overflowCount > 1 ? "s" : ""}`}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{overflowCount}
          </span>
        </div>
      )}
    </button>
  );
}

// =============================================================================
// Types
// =============================================================================

export interface EssentialsSectionProps {
  /** Enabled essentials to display (should include Sleep) */
  essentials: EssentialItem[];
  /** Templates with schedule data */
  templates: EssentialTemplate[];
  /** Called when an essential's schedule is saved */
  onSaveSchedule: (essentialId: string, slots: EssentialSlot[]) => void;
  /** Called when a new essential is created */
  onCreateEssential: (data: NewEssentialData, slots: EssentialSlot[]) => void;
  /** Called when an essential is deleted */
  onDeleteEssential: (essentialId: string) => void;
  /** Sleep wake up time in minutes from midnight */
  wakeUpMinutes: number;
  /** Sleep wind down time in minutes from midnight */
  windDownMinutes: number;
  /** Called when sleep times change */
  onSleepTimesChange: (wakeUp: number, windDown: number) => void;
  /** Whether sleep visualization is configured/enabled */
  isSleepConfigured?: boolean;
  /** Available icons for essential creation */
  essentialIcons: GoalIconOption[];
  /** Whether the section is collapsed */
  isCollapsed?: boolean;
  /** Callback to toggle the collapsed state */
  onToggleCollapse?: () => void;
  /** Whether the essentials section is hidden (user clicked Skip) */
  isHidden?: boolean;
  /** Callback when user clicks Skip to hide essentials */
  onHide?: () => void;
  /** Callback when onboarding is completed (Continue/Skip clicked during onboarding) */
  onOnboardingComplete?: () => void;
  className?: string;
}

// =============================================================================
// Main Component
// =============================================================================

export function EssentialsSection({
  essentials,
  templates,
  onSaveSchedule,
  onCreateEssential,
  onDeleteEssential,
  wakeUpMinutes,
  windDownMinutes,
  onSleepTimesChange,
  isSleepConfigured = false,
  essentialIcons,
  isCollapsed = false,
  onToggleCollapse,
  isHidden = false,
  onHide,
  onOnboardingComplete,
  className,
}: EssentialsSectionProps) {
  // Internal state for accordion expansion
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  // State for showing the inline creator
  const [isCreating, setIsCreating] = React.useState(false);
  // Track IDs of essentials added during CTA flow (to hide from suggestions)
  const [ctaAddedIds, setCtaAddedIds] = React.useState<string[]>([]);
  // Manual control: show CTA until user clicks Done (or Skip)
  const [ctaDismissed, setCtaDismissed] = React.useState(false);

  // Capture whether CTA should be shown on initial mount (lazy initializer)
  // This ensures CTA stays visible until explicitly dismissed, even after
  // sleep is configured or essentials are added during the CTA flow
  const [ctaModeEntered] = React.useState(() => {
    // Enter CTA mode if no config exists yet
    return (
      !isSleepConfigured &&
      essentials.filter((e) => e.id !== "sleep").length === 0
    );
  });

  const getTemplate = (essentialId: string) =>
    templates.find((t) => t.essentialId === essentialId);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    // Close creator when expanding an existing essential
    if (isCreating) {
      setIsCreating(false);
    }
  };

  const handleStartCreating = () => {
    setIsCreating(true);
    setExpandedId(null); // Collapse any expanded essential
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleSaveNewEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    onCreateEssential(data, slots);
    setIsCreating(false);
  };

  // Handler for adding essential from CTA (tracks the ID for filtering)
  const handleCTAAddEssential = (
    data: NewEssentialData,
    slots: EssentialSlot[],
  ) => {
    // Generate a stable ID based on the label (lowercase, no spaces)
    const essentialId = data.label.toLowerCase().replace(/\s+/g, "-");
    setCtaAddedIds((prev) => [...prev, essentialId]);
    onCreateEssential(data, slots);
  };

  // Handler for Skip button
  const handleSkip = () => {
    setCtaDismissed(true);
    onHide?.();
    onOnboardingComplete?.();
  };

  // Handler for Done/Continue button
  const handleDone = () => {
    setCtaDismissed(true);
    onOnboardingComplete?.();
  };

  // Separate Sleep from other essentials
  const sleepEssential = essentials.find((e) => e.id === "sleep");
  const otherEssentials = essentials.filter((e) => e.id !== "sleep");

  // Sort essentials by earliest start time
  const sortedEssentials = [...otherEssentials].sort((a, b) => {
    const aTemplate = templates.find((t) => t.essentialId === a.id);
    const bTemplate = templates.find((t) => t.essentialId === b.id);
    const aStart = aTemplate?.slots[0]?.startMinutes ?? Infinity;
    const bStart = bTemplate?.slots[0]?.startMinutes ?? Infinity;
    return aStart - bStart;
  });

  // Create a default Sleep essential if not provided
  const defaultSleep: EssentialItem = {
    id: "sleep",
    label: "Sleep",
    icon: RiMoonLine,
    color: "indigo",
  };

  const sleep = sleepEssential ?? defaultSleep;

  // Show CTA until user explicitly dismisses it (via Skip or Done)
  // ctaModeEntered captures the initial condition; once in CTA mode, only ctaDismissed exits it
  const shouldShowCTA = ctaModeEntered && !ctaDismissed;

  // If hidden, render nothing
  if (isHidden) {
    return null;
  }

  return (
    <div className={cn("group/essentials flex flex-col", className)}>
      {shouldShowCTA && !isCollapsed ? (
        // CTA empty state - no animation wrapper
        <EssentialsCTA
          sleepEssential={sleep}
          isSleepExpanded={expandedId === "sleep"}
          onToggleSleepExpand={() => handleToggleExpand("sleep")}
          wakeUpMinutes={wakeUpMinutes}
          windDownMinutes={windDownMinutes}
          onSleepTimesChange={onSleepTimesChange}
          isSleepConfigured={isSleepConfigured}
          onAddEssential={handleCTAAddEssential}
          addedEssentialIds={ctaAddedIds}
          addedEssentials={otherEssentials.filter((e) =>
            ctaAddedIds.includes(e.label.toLowerCase().replace(/\s+/g, "-")),
          )}
          addedEssentialTemplates={templates.filter((t) => {
            const essential = otherEssentials.find(
              (e) => e.id === t.essentialId,
            );
            return (
              essential &&
              ctaAddedIds.includes(
                essential.label.toLowerCase().replace(/\s+/g, "-"),
              )
            );
          })}
          onSaveSchedule={onSaveSchedule}
          onDeleteEssential={onDeleteEssential}
          onSkip={handleSkip}
          onDone={handleDone}
          essentialIcons={essentialIcons}
        />
      ) : (
        // Configured state - standard list view with collapse animation
        <div className="px-3 py-2">
          {/* Header - hidden when collapsed */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-foreground">
                    Essentials
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Non-negotiables that shape your time
                  </p>
                </div>
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover/essentials:opacity-100"
                    aria-label="Collapse essentials"
                  >
                    <RiArrowUpSLine className="size-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated content area */}
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              // Collapsed state - horizontal icon strip
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <CollapsedIconStrip
                  essentials={[sleep, ...sortedEssentials]}
                  onClick={onToggleCollapse}
                />
              </motion.div>
            ) : (
              // Expanded state - full list
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-0.5"
              >
                {/* Sleep - always first, special UI, non-deletable */}
                <SleepRow
                  essential={sleep}
                  isExpanded={expandedId === "sleep"}
                  onToggleExpand={() => handleToggleExpand("sleep")}
                  wakeUpMinutes={wakeUpMinutes}
                  windDownMinutes={windDownMinutes}
                  onTimesChange={onSleepTimesChange}
                  isConfigured={isSleepConfigured}
                />

                {/* Other essentials - sorted by earliest time */}
                {sortedEssentials.map((essential) => (
                  <EssentialRow
                    key={essential.id}
                    essential={essential}
                    template={getTemplate(essential.id)}
                    isExpanded={expandedId === essential.id}
                    onToggleExpand={() => handleToggleExpand(essential.id)}
                    onSaveSchedule={(slots) =>
                      onSaveSchedule(essential.id, slots)
                    }
                    onDelete={() => onDeleteEssential(essential.id)}
                  />
                ))}

                {/* Inline essential creator */}
                {isCreating && (
                  <InlineEssentialCreator
                    essentialIcons={essentialIcons}
                    onSave={handleSaveNewEssential}
                    onCancel={handleCancelCreate}
                  />
                )}

                {/* New essential button */}
                {!isCreating && (
                  <button
                    onClick={handleStartCreating}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <RiAddLine className="size-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Add essential
                    </span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
