import * as React from "react"

import { cn } from "@/lib/utils"

function Shell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell"
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-muted p-4",
        className
      )}
      {...props}
    />
  )
}

function ShellToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell-toolbar"
      className={cn(
        "relative flex min-h-12 items-center justify-between px-1 py-2",
        className
      )}
      {...props}
    />
  )
}

function ShellContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shell-content"
      className={cn(
        "mx-auto w-full flex-1 bg-background rounded-xl shadow-sm ring-1 ring-border",
        className
      )}
      {...props}
    />
  )
}

export { Shell, ShellToolbar, ShellContent }
