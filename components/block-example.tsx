"use client"

import * as React from "react"
import { Block, BLOCK_COLORS, type BlockColor, type BlockStatus, type BlockDuration } from "@/components/block"
import { 
  KnobsProvider, 
  KnobsToggle, 
  KnobsPanel, 
  KnobSelect,
  KnobInput,
  KnobBoolean
} from "@/components/knobs"

const colorOptions = Object.keys(BLOCK_COLORS).map((key) => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key as BlockColor,
}))

const durationOptions: { label: string; value: string; endTime: string }[] = [
  { label: "30 min", value: "30", endTime: "9:30" },
  { label: "1 hour", value: "60", endTime: "10:00" },
  { label: "4 hours", value: "240", endTime: "13:00" },
]

export function BlockExample() {
  const [color, setColor] = React.useState<BlockColor>("indigo")
  const [status, setStatus] = React.useState<BlockStatus>("planned")
  const [title, setTitle] = React.useState("Deep work")
  const [duration, setDuration] = React.useState<string>("60")
  const [showTasks, setShowTasks] = React.useState(false)

  const selectedDuration = durationOptions.find(d => d.value === duration)

  return (
    <KnobsProvider>
      <div className="w-72">
        <Block 
          title={title}
          startTime="9:00" 
          endTime={selectedDuration?.endTime ?? "9:30"}
          color={color}
          status={status}
          duration={parseInt(duration, 10) as BlockDuration}
          taskCount={showTasks ? 3 : undefined}
        />
      </div>
      
      <KnobsToggle />
      <KnobsPanel>
        <KnobInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Block title"
        />
        <KnobSelect
          label="Duration"
          value={duration}
          onChange={setDuration}
          options={durationOptions}
        />
        <KnobSelect
          label="Variant"
          value={status}
          onChange={setStatus}
          options={[
            { label: "Planned", value: "planned" },
            { label: "Completed", value: "completed" },
            { label: "Blueprint", value: "blueprint" },
          ]}
        />
        <KnobSelect
          label="Color"
          value={color}
          onChange={setColor}
          options={colorOptions}
        />
        {status !== "blueprint" && (
          <KnobBoolean
            label="Show Tasks"
            value={showTasks}
            onChange={setShowTasks}
          />
        )}
      </KnobsPanel>
    </KnobsProvider>
  )
}
