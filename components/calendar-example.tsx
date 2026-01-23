"use client"

import * as React from "react"
import { Calendar, type CalendarView, type CalendarMode, type BlockStyle } from "@/components/calendar"
import {
  KnobsProvider,
  KnobsToggle,
  KnobsPanel,
  KnobSelect,
  KnobBoolean,
} from "@/components/knobs"

export function CalendarExample() {
  const [view, setView] = React.useState<CalendarView>("week")
  const [mode, setMode] = React.useState<CalendarMode>("schedule")
  const [showHourLabels, setShowHourLabels] = React.useState(true)
  const [headerIsVisible, setHeaderIsVisible] = React.useState(true)
  const [sampleData, setSampleData] = React.useState(false)
  const [blockStyle, setBlockStyle] = React.useState<BlockStyle | "">("")

  return (
    <KnobsProvider>
      <div className="h-screen w-full">
        <Calendar 
          view={view} 
          mode={mode}
          showHourLabels={showHourLabels} 
          headerIsVisible={headerIsVisible} 
          sampleData={sampleData}
          setBlockStyle={blockStyle || undefined}
        />
      </div>
      
      <KnobsToggle />
      <KnobsPanel>
        <KnobSelect
          label="View"
          value={view}
          onChange={setView}
          options={[
            { label: "Week", value: "week" },
            { label: "Day", value: "day" },
          ]}
        />
        <KnobSelect
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Schedule", value: "schedule" },
            { label: "Blueprint", value: "blueprint" },
          ]}
        />
        <KnobBoolean
          label="Sample Data"
          value={sampleData}
          onChange={setSampleData}
        />
        {view === "day" && sampleData && (
          <KnobSelect
            label="Block Style"
            value={blockStyle}
            onChange={setBlockStyle}
            options={[
              { label: "Default", value: "" },
              { label: "Planned", value: "planned" },
              { label: "Completed", value: "completed" },
              { label: "Blueprint", value: "blueprint" },
            ]}
          />
        )}
        <KnobBoolean
          label="Show Hour Labels"
          value={showHourLabels}
          onChange={setShowHourLabels}
        />
        {view === "day" && (
          <KnobBoolean
            label="Header Visible"
            value={headerIsVisible}
            onChange={setHeaderIsVisible}
          />
        )}
      </KnobsPanel>
    </KnobsProvider>
  )
}
