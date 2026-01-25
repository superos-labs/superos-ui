"use client"

import * as React from "react"
import { GoalBrowser, LifeArea, PopularGoal } from "@/components/goal-browser"
import { KnobsProvider } from "@/components/knobs"
import {
  RiHeartPulseLine,
  RiRunLine,
  RiRestaurantLine,
  RiFirstAidKitLine,
  RiBodyScanLine,
  RiEmotionLine,
  RiBriefcaseLine,
  RiRocketLine,
  RiQuillPenLine,
  RiSuitcaseLine,
  RiTimeLine,
  RiGraduationCapLine,
  RiLightbulbLine,
  RiPaletteLine,
  RiAwardLine,
  RiTeamLine,
  RiUserHeartLine,
  RiChat3Line,
  RiHomeHeartLine,
  RiHandHeartLine,
  RiGroupLine,
  RiPhoneLine,
  RiCalendarEventLine,
  RiMentalHealthLine,
  RiBookOpenLine,
  RiSearchEyeLine,
  RiUserLine,
  RiGamepadLine,
  RiCameraLine,
  RiCompass3Line,
  RiCommunityLine,
  RiStarSmileLine,
} from "@remixicon/react"

const LIFE_AREAS: LifeArea[] = [
  {
    id: "health",
    label: "Health",
    icon: RiHeartPulseLine,
    color: "emerald",
    description: "Physical wellbeing, movement, nutrition, and body awareness.",
    goals: [
      { id: "workout-3x", label: "Workout 3x per week", icon: RiRunLine, color: "green", description: "Build consistent exercise habits" },
      { id: "run-5k", label: "Run 5 km without stopping", icon: RiRunLine, color: "emerald", description: "Build endurance progressively" },
      { id: "cook-home", label: "Cook at home 5 days/week", icon: RiRestaurantLine, color: "amber", description: "Healthier eating, more control" },
      { id: "resolve-pain", label: "Resolve recurring pain", icon: RiFirstAidKitLine, color: "red", description: "Address chronic issues systematically" },
      { id: "mobility", label: "Daily mobility routine", icon: RiBodyScanLine, color: "cyan", description: "Prevent stiffness and injury" },
      { id: "track-mood", label: "Track mood and symptoms", icon: RiEmotionLine, color: "purple", description: "Build self-awareness over time" },
    ],
  },
  {
    id: "work-craft",
    label: "Work and Craft",
    icon: RiBriefcaseLine,
    color: "violet",
    description: "Professional growth, skill mastery, and meaningful output.",
    goals: [
      { id: "ship-project", label: "Ship a concrete project", icon: RiRocketLine, color: "violet", description: "Complete and launch something real" },
      { id: "publish-weekly", label: "Publish weekly for 8 weeks", icon: RiQuillPenLine, color: "teal", description: "Build a consistent publishing habit" },
      { id: "portfolio-case", label: "Build a portfolio case", icon: RiSuitcaseLine, color: "blue", description: "Document and showcase your work" },
      { id: "deep-work", label: "Increase deep work hours", icon: RiTimeLine, color: "indigo", description: "Protect focused, uninterrupted time" },
      { id: "learn-skill", label: "Learn a new skill deeply", icon: RiGraduationCapLine, color: "amber", description: "Go beyond surface-level knowledge" },
      { id: "side-mvp", label: "Launch a side project MVP", icon: RiLightbulbLine, color: "yellow", description: "Validate an idea with real users" },
      { id: "creative-output", label: "Weekly creative output", icon: RiPaletteLine, color: "pink", description: "Regular creative expression" },
      { id: "deliberate-improvement", label: "Practice deliberate improvement", icon: RiAwardLine, color: "orange", description: "Intentional skill development" },
    ],
  },
  {
    id: "relationships",
    label: "Relationships",
    icon: RiTeamLine,
    color: "rose",
    description: "Connection with partners, family, friends, and community.",
    goals: [
      { id: "partner-checkin", label: "Weekly partner check-in", icon: RiUserHeartLine, color: "rose", description: "Maintain intentional connection" },
      { id: "reconnect-friends", label: "Reconnect with friends", icon: RiChat3Line, color: "blue", description: "Revive dormant friendships" },
      { id: "repair-relationship", label: "Repair a strained relationship", icon: RiHandHeartLine, color: "orange", description: "Address tension with care" },
      { id: "host-gatherings", label: "Host monthly gatherings", icon: RiHomeHeartLine, color: "amber", description: "Create community at home" },
      { id: "improve-communication", label: "Improve communication", icon: RiChat3Line, color: "teal", description: "Listen better, express clearly" },
      { id: "family-calls", label: "Family weekly calls", icon: RiPhoneLine, color: "green", description: "Stay close across distance" },
      { id: "new-social-circle", label: "Build a new social circle", icon: RiGroupLine, color: "violet", description: "Expand your network intentionally" },
      { id: "shared-rituals", label: "Shared rituals", icon: RiCalendarEventLine, color: "indigo", description: "Create meaningful recurring moments" },
    ],
  },
  {
    id: "self-inner",
    label: "Self and Inner Life",
    icon: RiMentalHealthLine,
    color: "indigo",
    description: "Reflection, meaning-making, and psychological growth.",
    goals: [
      { id: "journaling", label: "Journaling", icon: RiBookOpenLine, color: "teal", description: "Process thoughts through writing" },
      { id: "meditation", label: "Meditation practice", icon: RiMentalHealthLine, color: "purple", description: "Cultivate presence and calm" },
      { id: "philosophy", label: "Explore philosophy or meaning", icon: RiSearchEyeLine, color: "indigo", description: "Examine life's big questions" },
      { id: "therapy", label: "Therapy process", icon: RiUserLine, color: "cyan", description: "Professional support for growth" },
    ],
  },
  {
    id: "play-exploration",
    label: "Play and Exploration",
    icon: RiGamepadLine,
    color: "amber",
    description: "Joy, curiosity, novelty, and rediscovering wonder.",
    goals: [
      { id: "new-hobby", label: "Learn a new hobby", icon: RiPaletteLine, color: "pink", description: "Explore something unfamiliar" },
      { id: "creative-challenge", label: "Creative challenge", icon: RiLightbulbLine, color: "amber", description: "Push creative boundaries" },
      { id: "micro-adventure", label: "Monthly micro-adventure", icon: RiCompass3Line, color: "green", description: "Local exploration and novelty" },
      { id: "join-class", label: "Join a class or club", icon: RiCommunityLine, color: "blue", description: "Learn alongside others" },
      { id: "childhood-interest", label: "Rediscover childhood interest", icon: RiStarSmileLine, color: "orange", description: "Reconnect with past joys" },
    ],
  },
]

// Popular goals - a curated mix from different life areas
const POPULAR_GOALS: PopularGoal[] = [
  { id: "workout-3x", label: "Workout 3x per week", icon: RiRunLine, color: "green", description: "Build consistent exercise habits", areaId: "health" },
  { id: "ship-project", label: "Ship a concrete project", icon: RiRocketLine, color: "violet", description: "Complete and launch something real", areaId: "work-craft" },
  { id: "meditation", label: "Meditation practice", icon: RiMentalHealthLine, color: "purple", description: "Cultivate presence and calm", areaId: "self-inner" },
  { id: "deep-work", label: "Increase deep work hours", icon: RiTimeLine, color: "indigo", description: "Protect focused, uninterrupted time", areaId: "work-craft" },
  { id: "cook-home", label: "Cook at home 5 days/week", icon: RiRestaurantLine, color: "amber", description: "Healthier eating, more control", areaId: "health" },
  { id: "journaling", label: "Journaling", icon: RiBookOpenLine, color: "teal", description: "Process thoughts through writing", areaId: "self-inner" },
  { id: "reconnect-friends", label: "Reconnect with friends", icon: RiChat3Line, color: "blue", description: "Revive dormant friendships", areaId: "relationships" },
  { id: "learn-skill", label: "Learn a new skill deeply", icon: RiGraduationCapLine, color: "amber", description: "Go beyond surface-level knowledge", areaId: "work-craft" },
  { id: "new-hobby", label: "Learn a new hobby", icon: RiPaletteLine, color: "pink", description: "Explore something unfamiliar", areaId: "play-exploration" },
  { id: "family-calls", label: "Family weekly calls", icon: RiPhoneLine, color: "green", description: "Stay close across distance", areaId: "relationships" },
]

export function GoalBrowserExample() {
  const [selectedTab, setSelectedTab] = React.useState<string>("popular")
  const [selectedGoalIds, setSelectedGoalIds] = React.useState<Set<string>>(new Set())

  const handleSelectTab = React.useCallback((tabId: string) => {
    setSelectedTab(tabId)
  }, [])

  const handleToggleGoal = React.useCallback((areaId: string, goalId: string) => {
    setSelectedGoalIds(prev => {
      const next = new Set(prev)
      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }
      return next
    })
  }, [])

  const handleAddGoal = React.useCallback((areaId: string) => {
    console.log("Add goal to area:", areaId)
  }, [])

  return (
    <KnobsProvider>
      <div className="h-[600px] w-full max-w-5xl">
        <GoalBrowser
          lifeAreas={LIFE_AREAS}
          popularGoals={POPULAR_GOALS}
          selectedTab={selectedTab}
          selectedGoalIds={selectedGoalIds}
          onSelectTab={handleSelectTab}
          onToggleGoal={handleToggleGoal}
          onAddGoal={handleAddGoal}
        />
      </div>
    </KnobsProvider>
  )
}
