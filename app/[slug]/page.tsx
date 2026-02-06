/**
 * =============================================================================
 * File: app/[slug]/page.tsx
 * =============================================================================
 *
 * Dynamic component preview page.
 *
 * Resolves a component by slug from the internal component registry and renders
 * it inside a simple layout shell. Used primarily for prototyping, inspection,
 * and isolated experience exploration.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Read dynamic route param (`slug`).
 * - Lookup component metadata via `getComponent`.
 * - Render the resolved component with a layout wrapper.
 * - Display a loading skeleton while the component suspends.
 * - Trigger Next.js `notFound()` when no registry entry exists.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Supports lightweight layout modes defined by registry entries:
 *   - "full": component owns the entire viewport.
 *   - "center": centered both horizontally and vertically (default).
 *   - "bottom": centered horizontally, aligned to bottom with padding.
 * - Uses Suspense to allow components to be async without leaking complexity
 *   into this page.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - default: ComponentPage
 */

"use client";

import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { getComponent } from "@/lib/registry";
import { cn } from "@/lib/utils";

function ComponentSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}

export default function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = getComponent(slug);

  if (!entry) {
    notFound();
  }

  const Component = entry.component;
  const layout = entry.layout ?? "center";

  if (layout === "full") {
    return (
      <Suspense fallback={<ComponentSkeleton />}>
        <Component />
      </Suspense>
    );
  }

  return (
    <main
      className={cn(
        "flex min-h-screen justify-center",
        layout === "bottom" ? "items-end pb-32" : "items-center",
      )}
    >
      <Suspense fallback={<ComponentSkeleton />}>
        <Component />
      </Suspense>
    </main>
  );
}
