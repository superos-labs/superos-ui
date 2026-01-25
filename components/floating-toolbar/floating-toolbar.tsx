"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiDraggable,
} from "@remixicon/react";
import type {
  FloatingToolbarProps,
  ItemEditViewProps,
  SelectedItem,
  SuggestionItem,
} from "./floating-toolbar-types";

// =============================================================================
// Constants
// =============================================================================

const TOTAL_WEEKLY_HOURS = 168;

// Shared transition config for internal view switches
const slideTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
};

const slideExitTransition = {
  duration: 0.15,
  ease: [0.4, 0, 1, 1] as const,
};

// Variants for sliding forward (deeper into navigation)
const slideForwardVariants = {
  initial: { opacity: 0, x: 60, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: slideTransition,
  },
  exit: {
    opacity: 0,
    x: -40,
    scale: 0.98,
    transition: slideExitTransition,
  },
};

// Variants for sliding backward (back in navigation)
const slideBackVariants = {
  initial: { opacity: 0, x: -60, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: slideTransition,
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.98,
    transition: slideExitTransition,
  },
};

// Animation variants for popups
const popupVariants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: "easeOut" as const,
    },
  },
};

// =============================================================================
// Sub-components
// =============================================================================

interface ToolbarTextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

function ToolbarTextButton({
  children,
  isActive,
  className,
  ...props
}: ToolbarTextButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface ToolbarIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  isActive?: boolean;
}

function ToolbarIconButton({
  icon,
  isActive,
  className,
  ...props
}: ToolbarIconButtonProps) {
  return (
    <button
      className={cn(
        "flex size-8 items-center justify-center rounded-lg transition-colors",
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border/60" />;
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({
  percentage,
  size = 14,
  strokeWidth = 2,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="opacity-60"
      />
    </svg>
  );
}

// =============================================================================
// ItemEditView
// =============================================================================

function ItemEditView({
  item,
  availableIcons,
  availableColors,
  daysOfWeek,
  onBack,
}: ItemEditViewProps) {
  const [name, setName] = React.useState(item.label);
  const [selectedIconIndex, setSelectedIconIndex] = React.useState(() => {
    const index = availableIcons.findIndex((i) => i === item.icon);
    return index >= 0 ? index : 0;
  });
  const [selectedColorIndex, setSelectedColorIndex] = React.useState(() => {
    const index = availableColors.findIndex((c) => c.textColor === item.color);
    return index >= 0 ? index : 0;
  });
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [selectedDays, setSelectedDays] = React.useState<string[]>(
    daysOfWeek.slice(0, 5).map((d) => d.id),
  );
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  const SelectedIconComponent = availableIcons[selectedIconIndex];
  const selectedColor = availableColors[selectedColorIndex];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showIconPicker ? (
        <motion.div
          key="icon-picker"
          variants={slideForwardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col"
        >
          {/* Icon Picker Header */}
          <div className="flex items-center gap-1 border-b border-border p-1.5">
            <button
              onClick={() => setShowIconPicker(false)}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RiArrowLeftSLine className="size-4" />
            </button>
            <span className="flex-1 text-sm font-medium text-foreground">
              Icon & Color
            </span>
          </div>

          <div className="flex flex-col gap-4 p-3">
            {/* Color Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((colorOption, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColorIndex(index)}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full transition-all",
                      colorOption.bgColor,
                      selectedColorIndex === index
                        ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-background"
                        : "hover:scale-110",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-1">
                {availableIcons.map((IconComponent, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedIconIndex(index);
                      setShowIconPicker(false);
                    }}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-colors",
                      selectedIconIndex === index
                        ? "bg-muted ring-2 ring-foreground/20"
                        : "hover:bg-muted",
                    )}
                  >
                    <IconComponent
                      className={cn("size-4", selectedColor.textColor)}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="edit-form"
          variants={slideBackVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-1 border-b border-border p-1.5">
            <button
              onClick={onBack}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RiArrowLeftSLine className="size-4" />
            </button>
            <span className="flex-1 text-sm font-medium text-foreground">
              {item.isCustom ? "Add Custom" : item.label}
            </span>
          </div>

          <div className="flex flex-col gap-3 p-3">
            {/* Name Input with Icon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Name
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIconPicker(true)}
                  className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                >
                  <SelectedIconComponent
                    className={cn("size-4", selectedColor.textColor)}
                  />
                </button>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name..."
                  className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Start Time & End Time */}
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-foreground/20 focus:outline-none"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-foreground/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Repeat
              </label>
              <div className="flex gap-1">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "flex size-8 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      selectedDays.includes(day.id)
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// FloatingToolbar
// =============================================================================

function FloatingToolbar({
  className,
  commitmentSuggestions,
  goalsTabs,
  goalsByTab,
  timeAllocations = [],
  hasAllocations = false,
  availableIcons,
  availableColors,
  daysOfWeek,
  ...props
}: FloatingToolbarProps) {
  const [openPopup, setOpenPopup] = React.useState<
    "commitments" | "goals" | "hours" | null
  >(null);
  const [goalsTab, setGoalsTab] = React.useState(goalsTabs[0]?.id ?? "");
  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(
    null,
  );
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  // Click outside to close popup
  React.useEffect(() => {
    if (!openPopup) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setOpenPopup(null);
        setSelectedItem(null);
      }
    };

    // Use mousedown for immediate response
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPopup]);

  const handleButtonClick = (type: "commitments" | "goals" | "hours") => {
    setOpenPopup(openPopup === type ? null : type);
    setSelectedItem(null);
  };

  const handleItemClick = (item: SuggestionItem, isCustom = false) => {
    setSelectedItem({ ...item, isCustom });
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  const suggestions =
    openPopup === "commitments"
      ? commitmentSuggestions
      : openPopup === "goals"
        ? goalsByTab[goalsTab] ?? []
        : [];

  const allocatedHours = timeAllocations.reduce(
    (sum, item) => sum + item.hours,
    0,
  );
  const remainingHours = TOTAL_WEEKLY_HOURS - allocatedHours;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-lg",
        className,
      )}
      {...props}
    >
      {/* Commitments Button + Popup */}
      <div className="relative">
        <ToolbarTextButton
          isActive={openPopup === "commitments"}
          onClick={() => handleButtonClick("commitments")}
        >
          Commitments
        </ToolbarTextButton>
        <AnimatePresence>
          {openPopup === "commitments" && (
            <motion.div
              layout
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-full left-1/2 mb-3 w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
              transition={{
                layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {selectedItem ? (
                  <motion.div
                    key="edit"
                    variants={slideForwardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ItemEditView
                      item={selectedItem}
                      availableIcons={availableIcons}
                      availableColors={availableColors}
                      daysOfWeek={daysOfWeek}
                      onBack={handleBack}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    variants={slideBackVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="flex flex-col p-1.5">
                      <button
                        className="group/item flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-muted"
                        onClick={() =>
                          handleItemClick(
                            {
                              label: "",
                              icon: RiAddLine,
                              color: "text-muted-foreground",
                            },
                            true,
                          )
                        }
                      >
                        <RiAddLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                        <span className="flex-1">Add your own</span>
                        <RiArrowRightSLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                      </button>
                      {commitmentSuggestions.map((item) => (
                        <button
                          key={item.label}
                          className="group/item flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-muted"
                          onClick={() => handleItemClick(item)}
                        >
                          <RiDraggable className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                          <item.icon className={cn("size-4", item.color)} />
                          <span className="flex-1">{item.label}</span>
                          <RiArrowRightSLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                    <div className="bg-muted/50 px-3 py-2.5">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Time you have already promised to something, regardless
                        of whether it moves your life forward.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Goals Button + Popup */}
      <div className="relative">
        <ToolbarTextButton
          isActive={openPopup === "goals"}
          onClick={() => handleButtonClick("goals")}
        >
          Goals
        </ToolbarTextButton>
        <AnimatePresence>
          {openPopup === "goals" && (
            <motion.div
              layout
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-full left-1/2 mb-3 w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
              transition={{
                layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {selectedItem ? (
                  <motion.div
                    key="edit"
                    variants={slideForwardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ItemEditView
                      item={selectedItem}
                      availableIcons={availableIcons}
                      availableColors={availableColors}
                      daysOfWeek={daysOfWeek}
                      onBack={handleBack}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    variants={slideBackVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="p-1.5">
                      <div className="scrollbar-hidden mb-1 flex gap-0.5 overflow-x-auto px-1 pb-1.5 pt-0.5">
                        {goalsTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setGoalsTab(tab.id)}
                            className={cn(
                              "shrink-0 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                              goalsTab === tab.id
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        {goalsTab === goalsTabs[0]?.id && (
                          <button
                            className="group/item flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-muted"
                            onClick={() =>
                              handleItemClick(
                                {
                                  label: "",
                                  icon: RiAddLine,
                                  color: "text-muted-foreground",
                                },
                                true,
                              )
                            }
                          >
                            <RiAddLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                            <span className="flex-1">Add your own</span>
                            <RiArrowRightSLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                          </button>
                        )}
                        {suggestions.map((item) => (
                          <button
                            key={item.label}
                            className="group/item flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-muted"
                            onClick={() => handleItemClick(item)}
                          >
                            <RiDraggable className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                            <item.icon className={cn("size-4", item.color)} />
                            <span className="flex-1">{item.label}</span>
                            <RiArrowRightSLine className="size-4 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/50 px-3 py-2.5">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Something you choose to give time to because you want it
                        to change or improve over time.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToolbarDivider />

      {/* Hours Button + Popup */}
      <div className="relative">
        <ToolbarTextButton
          isActive={openPopup === "hours"}
          onClick={() => handleButtonClick("hours")}
          className="flex items-center gap-1.5"
        >
          <CircularProgress
            percentage={
              hasAllocations
                ? (remainingHours / TOTAL_WEEKLY_HOURS) * 100
                : 100
            }
          />
          {hasAllocations ? remainingHours : 168}
        </ToolbarTextButton>
        <AnimatePresence>
          {openPopup === "hours" && (
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 rounded-xl border border-border bg-background p-3 shadow-lg"
            >
              {hasAllocations ? (
                <>
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      Weekly Breakdown
                    </span>
                    <span className="text-2xl font-semibold tabular-nums text-foreground">
                      {remainingHours}h
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        left
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-muted">
                    {timeAllocations.map((item) => (
                      <div
                        key={item.label}
                        className={cn("h-full", item.color)}
                        style={{
                          width: `${(item.hours / TOTAL_WEEKLY_HOURS) * 100}%`,
                        }}
                        title={`${item.label}: ${item.hours}h`}
                      />
                    ))}
                  </div>

                  {/* Breakdown list */}
                  <div className="flex flex-col gap-1.5">
                    {timeAllocations.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className={cn("size-2.5 rounded-full", item.color)} />
                        <item.icon className="size-3.5 text-muted-foreground" />
                        <span className="flex-1 text-foreground/80">
                          {item.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.hours}h
                        </span>
                      </div>
                    ))}
                    <div className="mt-1 flex items-center gap-2 border-t border-border pt-2 text-sm">
                      <div className="size-2.5 rounded-full bg-muted" />
                      <span className="flex-1 font-medium text-foreground">
                        Remaining
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {remainingHours}h
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-2 text-center">
                  <div className="text-3xl font-semibold tabular-nums text-foreground">
                    168
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    hours in a week
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/60">
                    Add commitments and goals to see
                    <br />
                    how your time is allocated
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToolbarIconButton
        icon={<RiArrowRightLine className="size-4" />}
        aria-label="Next"
      />
    </div>
  );
}

export {
  FloatingToolbar,
  ToolbarTextButton,
  ToolbarIconButton,
  ToolbarDivider,
  CircularProgress,
  ItemEditView,
};
