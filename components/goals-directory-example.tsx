"use client"

import * as React from "react"
import { GoalsDirectory, LifeArea } from "@/components/goals-directory"
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
    color: "text-rose-500",
    description: "Physical wellbeing, movement, nutrition, and body awareness.",
    goals: [
      { id: "workout-3x", label: "Workout 3x per week", icon: RiRunLine, color: "text-green-500", description: "Build consistent exercise habits" },
      { id: "run-5k", label: "Run 5 km without stopping", icon: RiRunLine, color: "text-emerald-500", description: "Build endurance progressively" },
      { id: "cook-home", label: "Cook at home 5 days/week", icon: RiRestaurantLine, color: "text-amber-500", description: "Healthier eating, more control" },
      { id: "resolve-pain", label: "Resolve recurring pain", icon: RiFirstAidKitLine, color: "text-red-500", description: "Address chronic issues systematically" },
      { id: "mobility", label: "Daily mobility routine", icon: RiBodyScanLine, color: "text-cyan-500", description: "Prevent stiffness and injury" },
      { id: "track-mood", label: "Track mood and symptoms", icon: RiEmotionLine, color: "text-purple-500", description: "Build self-awareness over time" },
    ],
  },
  {
    id: "work-craft",
    label: "Work and Craft",
    icon: RiBriefcaseLine,
    color: "text-violet-500",
    description: "Professional growth, skill mastery, and meaningful output.",
    goals: [
      { id: "ship-project", label: "Ship a concrete project", icon: RiRocketLine, color: "text-violet-500", description: "Complete and launch something real" },
      { id: "publish-weekly", label: "Publish weekly for 8 weeks", icon: RiQuillPenLine, color: "text-teal-500", description: "Build a consistent publishing habit" },
      { id: "portfolio-case", label: "Build a portfolio case", icon: RiSuitcaseLine, color: "text-blue-500", description: "Document and showcase your work" },
      { id: "deep-work", label: "Increase deep work hours", icon: RiTimeLine, color: "text-indigo-500", description: "Protect focused, uninterrupted time" },
      { id: "learn-skill", label: "Learn a new skill deeply", icon: RiGraduationCapLine, color: "text-amber-500", description: "Go beyond surface-level knowledge" },
      { id: "side-mvp", label: "Launch a side project MVP", icon: RiLightbulbLine, color: "text-yellow-500", description: "Validate an idea with real users" },
      { id: "creative-output", label: "Weekly creative output", icon: RiPaletteLine, color: "text-pink-500", description: "Regular creative expression" },
      { id: "deliberate-improvement", label: "Practice deliberate improvement", icon: RiAwardLine, color: "text-orange-500", description: "Intentional skill development" },
    ],
  },
  {
    id: "relationships",
    label: "Relationships",
    icon: RiTeamLine,
    color: "text-pink-500",
    description: "Connection with partners, family, friends, and community.",
    goals: [
      { id: "partner-checkin", label: "Weekly partner check-in", icon: RiUserHeartLine, color: "text-rose-500", description: "Maintain intentional connection" },
      { id: "reconnect-friends", label: "Reconnect with friends", icon: RiChat3Line, color: "text-blue-500", description: "Revive dormant friendships" },
      { id: "repair-relationship", label: "Repair a strained relationship", icon: RiHandHeartLine, color: "text-orange-500", description: "Address tension with care" },
      { id: "host-gatherings", label: "Host monthly gatherings", icon: RiHomeHeartLine, color: "text-amber-500", description: "Create community at home" },
      { id: "improve-communication", label: "Improve communication", icon: RiChat3Line, color: "text-teal-500", description: "Listen better, express clearly" },
      { id: "family-calls", label: "Family weekly calls", icon: RiPhoneLine, color: "text-green-500", description: "Stay close across distance" },
      { id: "new-social-circle", label: "Build a new social circle", icon: RiGroupLine, color: "text-violet-500", description: "Expand your network intentionally" },
      { id: "shared-rituals", label: "Shared rituals", icon: RiCalendarEventLine, color: "text-indigo-500", description: "Create meaningful recurring moments" },
    ],
  },
  {
    id: "self-inner",
    label: "Self and Inner Life",
    icon: RiMentalHealthLine,
    color: "text-indigo-500",
    description: "Reflection, meaning-making, and psychological growth.",
    goals: [
      { id: "journaling", label: "Journaling", icon: RiBookOpenLine, color: "text-teal-500", description: "Process thoughts through writing" },
      { id: "meditation", label: "Meditation practice", icon: RiMentalHealthLine, color: "text-purple-500", description: "Cultivate presence and calm" },
      { id: "philosophy", label: "Explore philosophy or meaning", icon: RiSearchEyeLine, color: "text-indigo-500", description: "Examine life's big questions" },
      { id: "therapy", label: "Therapy process", icon: RiUserLine, color: "text-cyan-500", description: "Professional support for growth" },
    ],
  },
  {
    id: "play-exploration",
    label: "Play and Exploration",
    icon: RiGamepadLine,
    color: "text-emerald-500",
    description: "Joy, curiosity, novelty, and rediscovering wonder.",
    goals: [
      { id: "new-hobby", label: "Learn a new hobby", icon: RiPaletteLine, color: "text-pink-500", description: "Explore something unfamiliar" },
      { id: "creative-challenge", label: "Creative challenge", icon: RiLightbulbLine, color: "text-amber-500", description: "Push creative boundaries" },
      { id: "micro-adventure", label: "Monthly micro-adventure", icon: RiCompass3Line, color: "text-green-500", description: "Local exploration and novelty" },
      { id: "join-class", label: "Join a class or club", icon: RiCommunityLine, color: "text-blue-500", description: "Learn alongside others" },
      { id: "childhood-interest", label: "Rediscover childhood interest", icon: RiStarSmileLine, color: "text-orange-500", description: "Reconnect with past joys" },
    ],
  },
]

export function GoalsDirectoryExample() {
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>("")

  const handleSelectArea = React.useCallback((areaId: string) => {
    setSelectedAreaId(areaId)
  }, [])

  const handleSelectGoal = React.useCallback((areaId: string, goalId: string) => {
    console.log("Selected goal:", { areaId, goalId })
  }, [])

  const handleAddGoal = React.useCallback((areaId: string) => {
    console.log("Add goal to area:", areaId)
  }, [])

  return (
    <KnobsProvider>
      <div className="h-[600px] w-full max-w-4xl">
        <GoalsDirectory
          lifeAreas={LIFE_AREAS}
          selectedAreaId={selectedAreaId}
          onSelectArea={handleSelectArea}
          onSelectGoal={handleSelectGoal}
          onAddGoal={handleAddGoal}
        />
      </div>
    </KnobsProvider>
  )
}
