/**
 * =============================================================================
 * File: example.tsx
 * =============================================================================
 *
 * Lightweight layout primitives for rendering isolated UI examples.
 *
 * These components are primarily used in documentation, playgrounds,
 * and exploratory views to present components in a consistent,
 * centered, and constrained environment.
 *
 * -----------------------------------------------------------------------------
 * COMPONENTS
 * -----------------------------------------------------------------------------
 * - ExampleWrapper
 *   Provides a full-width page wrapper that centers example content
 *   within a responsive max-width grid. Handles overall page padding
 *   and vertical centering.
 *
 * - Example
 *   Renders a single example container with optional title and a
 *   dashed-border content area intended to visually separate the
 *   example from surrounding context.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Enforce consistent spacing, width constraints, and alignment.
 * - Visually distinguish example content from the background.
 * - Remain styling-focused with no state or business logic.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses data-slot attributes to support targeted styling and inspection.
 * - Intentionally minimal API to avoid coupling examples to app logic.
 * - Accepts native div props to stay flexible and composable.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - ExampleWrapper
 * - Example
 */

import { cn } from "@/lib/utils";

function ExampleWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="bg-background w-full">
      <div
        data-slot="example-wrapper"
        className={cn(
          "mx-auto grid min-h-screen w-full max-w-5xl min-w-0 content-center items-start gap-8 p-4 pt-2 sm:gap-12 sm:p-6 md:grid-cols-2 md:gap-8 lg:p-12 2xl:max-w-6xl",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function Example({
  title,
  children,
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
  containerClassName?: string;
}) {
  return (
    <div
      data-slot="example"
      className={cn(
        "mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none",
        containerClassName,
      )}
      {...props}
    >
      {title && (
        <div className="text-muted-foreground px-1.5 py-2 text-xs font-medium">
          {title}
        </div>
      )}
      <div
        data-slot="example-content"
        className={cn(
          "bg-background text-foreground flex min-w-0 flex-1 flex-col items-start gap-6 border border-dashed p-4 sm:p-6 *:[div:not([class*='w-'])]:w-full",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { ExampleWrapper, Example };
