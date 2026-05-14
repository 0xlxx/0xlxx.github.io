import { getBlogPosts } from "app/blog/utils"
import Link from "next/link"

export function BlogPostsBlock() {
  let allBlogs = getBlogPosts()

  // 按日期排序（最新的在前）
  const sortedBlogs = allBlogs.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
  })

  // 按年份分组
  const groupedByYear = sortedBlogs.reduce((acc, post) => {
    const year = new Date(post.metadata.publishedAt).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(post)
    return acc
  }, {} as Record<number, typeof sortedBlogs>)

  // 获取排序后的年份
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="space-y-16">
      {years.map((year) => (
        <section key={year}>
          <h2 className="mb-8 text-5xl font-bold text-muted-foreground/40">
            {year}
          </h2>
          <div className="space-y-6">
            {groupedByYear[year].map((post) => {
              const date = new Date(post.metadata.publishedAt)
              const month = date.toLocaleString('en-US', { month: 'short' })
              const day = date.getDate()

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex items-baseline gap-8 transition hover:opacity-80"
                >
                  <time className="flex-shrink-0 text-sm text-muted-foreground w-20">
                    {month} {day}
                  </time>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-foreground/90 group-hover:text-primary transition">
                      {post.metadata.title}
                    </h3>
                  </div>
                  {post.metadata.category && (
                    <span className="flex-shrink-0 rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {post.metadata.category}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
