import { formatDate, getBlogPosts } from "app/blog/utils";
import Link from "next/link";
import Image from "next/image";

export function BlogPostsBlock() {
  let allBlogs = getBlogPosts();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in">
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post, index) => (
          <div
            key={post.slug}
            className="h-full group/card transition-all duration-300 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <Link
              href={`/blog/${post.slug}`}
              prefetch={true}
              className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg border border-border"
            >
              {post.metadata.image && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <time
                      dateTime={post.metadata.publishedAt}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      {formatDate(post.metadata.publishedAt)}
                    </time>
                    {post.metadata.category && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {post.metadata.category}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover/card:text-primary transition-colors duration-300">
                    {post.metadata.title}
                  </h2>
                  {post.metadata.summary && (
                    <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {post.metadata.summary}
                    </p>
                  )}
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center text-sm font-medium text-primary transition-colors duration-300 group-hover/card:text-primary/80">
                    阅读文章
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
    </div>
  );
}
