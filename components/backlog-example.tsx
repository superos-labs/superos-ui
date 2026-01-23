"use client"

import * as React from "react"
import { Backlog, BacklogItem, GoalDisplayMode } from "@/components/backlog"
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobBoolean,
  KnobSelect,
} from "@/components/knobs"
import {
  RiMoonLine,
  RiRestaurantLine,
  RiCarLine,
  RiRunLine,
  RiDropLine,
  RiHome4Line,
  RiRocketLine,
  RiCodeLine,
  RiMedalLine,
  RiPenNibLine,
} from "@remixicon/react"

const INITIAL_COMMITMENTS: BacklogItem[] = [
  { id: "sleep", label: "Sleep", icon: RiMoonLine, color: "text-indigo-500", plannedHours: 56, completedHours: 48 },
  { id: "eat", label: "Eat", icon: RiRestaurantLine, color: "text-amber-500", plannedHours: 14, completedHours: 12 },
  { id: "commute", label: "Commute", icon: RiCarLine, color: "text-slate-500", plannedHours: 10, completedHours: 8 },
  { id: "exercise", label: "Exercise", icon: RiRunLine, color: "text-green-500", plannedHours: 5, completedHours: 3 },
  { id: "hygiene", label: "Hygiene", icon: RiDropLine, color: "text-cyan-500", plannedHours: 7, completedHours: 7 },
  { id: "chores", label: "Chores", icon: RiHome4Line, color: "text-orange-500", plannedHours: 4, completedHours: 2 },
]

const INITIAL_GOALS: BacklogItem[] = [
  { 
    id: "superos", 
    label: "Get SuperOS to $1M ARR", 
    icon: RiRocketLine, 
    color: "text-violet-500", 
    plannedHours: 20, 
    completedHours: 12, 
    milestone: "Ship billing integration",
    tasks: [
      { id: "superos-1", label: "Set up Stripe webhook handlers", completed: true },
      { id: "superos-2", label: "Build subscription management UI", completed: false },
      { id: "superos-3", label: "Add invoice generation", completed: false },
    ]
  },
  { 
    id: "marathon", 
    label: "Run a marathon", 
    icon: RiMedalLine, 
    color: "text-rose-500", 
    plannedHours: 6, 
    completedHours: 4, 
    milestone: "Complete 10K under 50min",
    tasks: [
      { id: "marathon-1", label: "Run 5K three times this week", completed: true },
      { id: "marathon-2", label: "Do interval training on Saturday", completed: false },
    ]
  },
  { 
    id: "book", 
    label: "Write a book", 
    icon: RiPenNibLine, 
    color: "text-teal-500", 
    plannedHours: 7, 
    completedHours: 5, 
    milestone: "Finish chapter 3 draft",
    tasks: [
      { id: "book-1", label: "Outline the main conflict", completed: true },
      { id: "book-2", label: "Write the opening scene", completed: true },
      { id: "book-3", label: "Develop supporting characters", completed: false },
    ]
  },
  { 
    id: "spanish", 
    label: "Become fluent in Spanish", 
    icon: RiCodeLine, 
    color: "text-blue-500", 
    plannedHours: 5, 
    completedHours: 5, 
    milestone: "Complete A2 certification",
    tasks: [
      { id: "spanish-1", label: "Complete Duolingo lesson", completed: true },
      { id: "spanish-2", label: "Watch Spanish movie with subtitles", completed: false },
      { id: "spanish-3", label: "Practice conversation with tutor", completed: false },
    ]
  },
]

const GOAL_DISPLAY_OPTIONS: { label: string; value: GoalDisplayMode }[] = [
  { label: "Goal", value: "goal" },
  { label: "Milestone", value: "milestone" },
]

export function BacklogExample() {
  const [showHours, setShowHours] = React.useState(true)
  const [showTasks, setShowTasks] = React.useState(true)
  const [showCommitments, setShowCommitments] = React.useState(true)
  const [goalDisplayMode, setGoalDisplayMode] = React.useState<GoalDisplayMode>("goal")
  const [goals, setGoals] = React.useState(INITIAL_GOALS)

  const handleToggleGoalTask = React.useCallback((goalId: string, taskId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              tasks: goal.tasks?.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : goal
      )
    )
  }, [])

  return (
    <KnobsProvider>
      <Backlog
        commitments={INITIAL_COMMITMENTS}
        goals={goals}
        showHours={showHours}
        showTasks={showTasks}
        showCommitments={showCommitments}
        goalDisplayMode={goalDisplayMode}
        onToggleGoalTask={handleToggleGoalTask}
      />

      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Show Commitments"
          value={showCommitments}
          onChange={setShowCommitments}
        />
        <KnobBoolean
          label="Show Tasks"
          value={showTasks}
          onChange={setShowTasks}
        />
        <KnobBoolean
          label="Show Hours"
          value={showHours}
          onChange={setShowHours}
        />
        <KnobSelect
          label="Goal Display"
          value={goalDisplayMode}
          onChange={setGoalDisplayMode}
          options={GOAL_DISPLAY_OPTIONS}
        />
      </KnobsPanel>
    </KnobsProvider>
  )
}
