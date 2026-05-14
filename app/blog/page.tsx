
import { BlogPostsBlock } from "app/components/posts"

export const metadata = {
  title: "博客",
  description: "some experience",
}

export default function Page() {
  return (
    <div className=" min-h-screen text-foreground">
      <div className="container mx-auto max-w-3xl px-6 pb-24 pt-20 sm:px-8 sm:pt-24">
        <BlogPostsBlock />
      </div>
    </div>
  )
}

