import Link from "next/link"
import { registry } from "@/lib/registry"

export default function Page() {
  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-16">
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
