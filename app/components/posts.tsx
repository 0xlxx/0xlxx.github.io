import { Link } from 'next-view-transitions'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { VTItem } from './vt-item'

export function BlogPosts() {
  let allBlogs = getBlogPosts()
  return (
    <div className="space-y-4">
      {allBlogs
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="group flex flex-col space-y-1"
            href={`/blog/${post.slug}`}
            prefetch={true}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p
                className="text-muted-foreground min-w-[100px] tabular-nums"
                style={{ viewTransitionName: `post-link-${post.slug}` }}
              >
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <h2 className="text-foreground tracking-tight group-hover:text-primary transition-colors">
                <VTItem prefix={post.slug}>
                  {post.metadata.title}
                </VTItem>
              </h2>
            </div>
          </Link>
        ))}
    </div>
  )
}

// every post is a block with a title and a date and a gradient background
export function BlogPostsBlock() {
  let allBlogs = getBlogPosts()
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allBlogs
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            prefetch={true}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-secondary to-secondary/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-2">
              <time
                dateTime={post.metadata.publishedAt}
                className="block text-sm text-muted-foreground"
                style={{ viewTransitionName: `post-link-${post.slug}` }}
              >
                {formatDate(post.metadata.publishedAt)}
              </time>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors"
              >
                <VTItem prefix={post.slug}>
                  {post.metadata.title}
                </VTItem>
              </h2>
              {post.metadata.summary && (
                <p className="line-clamp-2 text-sm text-muted-foreground/80">
                  {post.metadata.summary}
                </p>
              )}
            </div>
          </Link>
        ))}
    </div>
  )
}
