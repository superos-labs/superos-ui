import Link from "next/link"
import { registry } from "@/lib/registry"

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
  )
}
