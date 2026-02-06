/**
 * =============================================================================
 * File: app/sample-components/page.tsx
 * =============================================================================
 *
 * Index page for browsing registered sample components.
 *
 * Renders a simple list of links derived from the internal component registry,
 * allowing quick navigation to each component's dedicated preview page.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Read component metadata from `registry`.
 * - Render a navigable list of component names.
 * - Link each entry to its corresponding `[slug]` preview route.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Intentionally minimal and unopinionated.
 * - Serves as a lightweight developer-facing entry point rather than a
 *   user-facing experience.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - default: SampleComponentsPage
 */

import Link from "next/link";
import { registry } from "@/lib/registry";

export default function SampleComponentsPage() {
  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-16">
      <h1 className="text-foreground mb-6 text-lg font-medium">
        Sample Components
      </h1>
      <nav>
        <ul className="space-y-1">
          {registry.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/${entry.slug}`}
                className="text-foreground/60 hover:text-foreground block py-1 text-sm transition-colors"
              >
                {entry.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
