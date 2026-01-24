"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
  RiAddLine,
  RiArrowRightSLine,
} from "@remixicon/react"

// Types
interface Goal {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description?: string
}

interface LifeArea {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  goals: Goal[]
}

interface GoalsDirectoryProps {
  lifeAreas: LifeArea[]
  selectedAreaId?: string
  onSelectArea?: (areaId: string) => void
  onSelectGoal?: (areaId: string, goalId: string) => void
  onAddGoal?: (areaId: string) => void
}

// Life Area Card Component
interface LifeAreaCardProps {
  area: LifeArea
  isSelected: boolean
  onClick: () => void
}

function LifeAreaCard({ area, isSelected, onClick }: LifeAreaCardProps) {
  const IconComponent = area.icon
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
        isSelected
          ? "border-foreground/20 bg-muted ring-1 ring-foreground/10"
          : "border-border bg-background hover:border-foreground/10 hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          isSelected ? "bg-background" : "bg-muted"
        )}>
          <IconComponent className={cn("size-5", area.color)} />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs tabular-nums text-muted-foreground">
            {area.goals.length}
          </span>
          <RiArrowRightSLine className={cn(
            "size-4 transition-transform",
            isSelected ? "text-foreground" : "text-muted-foreground/50 group-hover:text-muted-foreground",
            isSelected && "translate-x-0.5"
          )} />
        </div>
      </div>
      <div>
        <h3 className="font-medium text-foreground">{area.label}</h3>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {area.description}
        </p>
      </div>
    </button>
  )
}

// Goal Row Component
interface GoalRowProps {
  goal: Goal
  onSelect: () => void
}

function GoalRow({ goal, onSelect }: GoalRowProps) {
  const IconComponent = goal.icon
  
  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
    >
      <div className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background",
      )}>
        <IconComponent className={cn("size-4", goal.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm text-foreground">{goal.label}</span>
        {goal.description && (
          <p className="truncate text-[12px] text-muted-foreground">{goal.description}</p>
        )}
      </div>
      <RiArrowRightSLine className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
    </button>
  )
}

// Goals Panel Component
interface GoalsPanelProps {
  area: LifeArea
  onSelectGoal: (goalId: string) => void
  onAddGoal?: () => void
  onBack: () => void
}

function GoalsPanel({ area, onSelectGoal, onAddGoal, onBack }: GoalsPanelProps) {
  const IconComponent = area.icon
  
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <button
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <RiArrowRightSLine className="size-4 rotate-180" />
        </button>
        <div className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          "bg-muted"
        )}>
          <IconComponent className={cn("size-5", area.color)} />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{area.label}</h2>
          <p className="text-[13px] text-muted-foreground">{area.goals.length} goals</p>
        </div>
      </div>
      
      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-2">
        {onAddGoal && (
          <button
            onClick={onAddGoal}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-border transition-colors group-hover:border-foreground/20">
              <RiAddLine className="size-4" />
            </div>
            <span className="text-sm">Add a goal</span>
          </button>
        )}
        {area.goals.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            onSelect={() => onSelectGoal(goal.id)}
          />
        ))}
      </div>
      
      {/* Footer description */}
      <div className="border-t border-border bg-muted/30 px-4 py-3">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          {area.description}
        </p>
      </div>
    </div>
  )
}

// Main Component
function GoalsDirectory({
  lifeAreas,
  selectedAreaId,
  onSelectArea,
  onSelectGoal,
  onAddGoal,
}: GoalsDirectoryProps) {
  const selectedArea = lifeAreas.find((area) => area.id === selectedAreaId)

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.15 }
    },
  }

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Left: Life Areas Grid */}
      <div className={cn(
        "flex flex-col border-r border-border bg-muted/20",
        selectedArea ? "hidden w-0 md:flex md:w-80" : "w-full md:w-80"
      )}>
        {/* Header */}
        <div className="border-b border-border p-4">
          <h1 className="text-lg font-semibold text-foreground">Browse goals by area</h1>
        </div>
        
        {/* Life Areas Grid */}
        <div className="scrollbar-hidden flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {lifeAreas.map((area) => (
              <LifeAreaCard
                key={area.id}
                area={area}
                isSelected={selectedAreaId === area.id}
                onClick={() => onSelectArea?.(area.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Goals Panel */}
      <div className={cn(
        "flex-1 bg-background",
        !selectedArea && "hidden md:flex"
      )}>
        <AnimatePresence mode="wait">
          {selectedArea ? (
            <motion.div
              key={selectedArea.id}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full w-full"
            >
              <GoalsPanel
                area={selectedArea}
                onSelectGoal={(goalId) => onSelectGoal?.(selectedArea.id, goalId)}
                onAddGoal={onAddGoal ? () => onAddGoal(selectedArea.id) : undefined}
                onBack={() => onSelectArea?.("")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
                <RiArrowRightSLine className="size-6 text-muted-foreground/40 -rotate-180" />
              </div>
              <h3 className="font-medium text-foreground">Select a life area</h3>
              <p className="mt-1 max-w-[200px] text-[13px] text-muted-foreground">
                Choose an area to explore and discover goals that resonate with you
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export { GoalsDirectory, LifeAreaCard, GoalRow, GoalsPanel }
export type { GoalsDirectoryProps, LifeArea, Goal }
