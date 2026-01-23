"use client"

import * as React from "react"
import { FloatingToolbar } from "@/components/floating-toolbar"
import { 
  KnobsProvider, 
  KnobsToggle, 
  KnobsPanel, 
  KnobBoolean 
} from "@/components/knobs"

export function FloatingToolbarExample() {
  const [hasAllocations, setHasAllocations] = React.useState(false)

  return (
    <KnobsProvider>
      <FloatingToolbar hasAllocations={hasAllocations} />
      
      <KnobsToggle />
      <KnobsPanel>
        <KnobBoolean
          label="Has Allocations"
          value={hasAllocations}
          onChange={setHasAllocations}
        />
      </KnobsPanel>
    </KnobsProvider>
  )
}
