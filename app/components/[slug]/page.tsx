"use client"

import { notFound } from "next/navigation"
import { use } from "react"
import { getComponent } from "@/lib/registry"
import { cn } from "@/lib/utils"

export default function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const entry = getComponent(slug)

  if (!entry) {
    notFound()
  }

  const Component = entry.component
  const layout = entry.layout ?? "center"

  if (layout === "full") {
    return <Component />
  }

  return (
    <main className={cn(
      "flex min-h-screen justify-center",
      layout === "bottom" ? "items-end pb-32" : "items-center"
    )}>
      <Component />
    </main>
  )
}
