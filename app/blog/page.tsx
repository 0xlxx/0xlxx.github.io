import { BlogPostsBlock } from 'app/components/posts'

export const metadata = {
  title: '博客',
  description: '我的技术博客文章。',
}

export default function Page() {
  return (
    <div className="container mx-auto">
      <section className="space-y-12 py-20 grid place-items-center">
        <div>
          <BlogPostsBlock />
        </div>
      </section>
    </div>
  )
}

