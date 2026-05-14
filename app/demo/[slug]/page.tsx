import { notFound } from "next/navigation"
import { demoProjects, categoryMeta, getProjectBySlug } from "../projects"

type Params = {
  slug: string
}

export function generateStaticParams() {
  return demoProjects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) {
    return {}
  }

  return {
    title: `${project.title} | 作品集`,
    description: project.summary,
  }
}

export default async function DemoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const category = categoryMeta[project.category]

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-20 sm:px-8 lg:flex-row lg:gap-12 lg:py-28">
        {/* 左侧：Demo 展示区 */}
        <article className="flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 shadow-[0_80px_180px_-100px_rgba(10,12,23,0.9)]">
          <div className="aspect-video w-full overflow-hidden">
            {project.component()}
          </div>
        </article>

        {/* 右侧：信息区 */}
        <aside className="flex w-full flex-col gap-8 lg:w-80 lg:pt-4">
          <header className="space-y-6">
            <div className="space-y-4">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${category.tone}`}>
                {category.label}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {project.title}
              </h1>
              <p className="text-base leading-relaxed text-white/70">
                {project.summary}
              </p>
            </div>
          </header>

          <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
              说明
            </h2>
            <p className="text-sm leading-7 text-white/65">
              {project.description}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

