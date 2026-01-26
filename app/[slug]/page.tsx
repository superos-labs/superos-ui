"use client"

import { notFound } from "next/navigation"
import { Suspense, use } from "react"
import { getComponent } from "@/lib/registry"
import { cn } from "@/lib/utils"

function ComponentSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  )
}

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
    return (
      <Suspense fallback={<ComponentSkeleton />}>
        <Component />
      </Suspense>
    )
  }

  return (
    <main className={cn(
      "flex min-h-screen justify-center",
      layout === "bottom" ? "items-end pb-32" : "items-center"
    )}>
      <Suspense fallback={<ComponentSkeleton />}>
        <Component />
      </Suspense>
    </main>
  )
}
