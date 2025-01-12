import { BlogPosts } from 'app/components/posts'
export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section className="container">
      <h1 className="capitalize font-semibold text-2xl mb-8 tracking-tighter [view-transition-name:page-title]">
        latest
      </h1>
      <BlogPosts />
    </section>
  )
}

