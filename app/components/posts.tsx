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
