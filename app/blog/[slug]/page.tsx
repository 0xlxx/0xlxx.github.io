import { notFound } from "next/navigation"
import { CustomMDX } from "app/components/mdx"
import { getBlogPosts } from "app/blog/utils"
import { baseUrl } from "app/sitemap"
import BlogTime from "app/components/blog-time"
import { Suspense } from "react"
export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(props) {
  const params = await props.params
  const slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return null
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og/${post.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

import { getHeadings } from "app/utils/get-headings"
import { TableOfContents } from "app/components/table-of-contents"
import { FloatingTools } from "app/components/floating-tools"

export default async function Blog(props) {
  const params = await props.params
  const slug = decodeURIComponent(params.slug)
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    notFound()
  }

  const headings = await getHeadings(post.content)

  return (
    <div className="scroll-progress min-h-screen text-foreground">
      <section className="px-6 pb-24 pt-20 sm:px-8 sm:pt-24 md:pb-32">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.metadata.title,
              datePublished: post.metadata.publishedAt,
              dateModified: post.metadata.publishedAt,
              description: post.metadata.summary,
              image: post.metadata.image
                ? `${baseUrl}${post.metadata.image}`
                : `${baseUrl}/og/${post.slug}`,
              url: `${baseUrl}/blog/${post.slug}`,
              author: {
                "@type": "Person",
                name: "My Portfolio",
              },
            }),
          }}
        />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 xl:grid-cols-[250px_minmax(0,1fr)_60px]">
          <div className="flex flex-col gap-8 xl:col-start-2 xl:mb-4">
            <h1 className="title text-4xl font-medium tracking-tighter sm:text-5xl">
              {post.metadata.title}
            </h1>
            <div className="flex items-center justify-between text-sm">
              <Suspense fallback={<span className="text-muted-foreground/40">···</span>}>
                <BlogTime
                  className="text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground"
                  publishedAt={post.metadata.publishedAt}
                />
              </Suspense>
            </div>
          </div>

          <aside className="hidden xl:block xl:row-start-2">
            <TableOfContents headings={headings} />
          </aside>

          <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-10 xl:row-start-2 xl:col-start-2">
            <div className="relative prose prose-pink dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 max-w-none overflow-auto">
              <CustomMDX source={post.content} />
            </div>
          </article>

          <div className="hidden xl:block xl:row-start-2 xl:col-start-3">
            <FloatingTools />
          </div>
        </div>
      </section>
    </div>
  )
}
