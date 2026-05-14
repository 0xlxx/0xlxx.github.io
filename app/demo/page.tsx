import Link from 'next/link'
import { demoProjects, demoSections, categoryMeta } from './projects'

export default function PortfolioPage() {
  return (
    <div className="relative min-h-screen text-foreground">
      <div className="container mx-auto max-w-3xl px-6 pb-24 pt-20 sm:px-8 sm:pt-24">
        <div className="space-y-16">
          {demoSections.map((section) => {
            const sectionProjects = demoProjects.filter((project) => project.section === section)

            return (
              <section key={section}>
                <h2 className="mb-8 text-5xl font-bold text-muted-foreground/40">
                  {section}
                </h2>
                <div className="space-y-6">
                  {sectionProjects.map((project) => {
                    const category = categoryMeta[project.category]

                    return (
                      <Link
                        key={project.slug}
                        href={`/demo/${project.slug}`}
                        className="group flex items-baseline gap-6 transition hover:opacity-80"
                      >
                        <h3 className="flex-1 min-w-0 text-lg font-medium text-foreground/90 group-hover:text-primary transition">
                          {project.title}
                        </h3>
                        <span className={`flex-shrink-0 rounded px-2 py-0.5 text-xs ${category.tone}`}>
                          {category.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
