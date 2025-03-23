import { BlogPostsBlock } from 'app/components/posts'

export const metadata = {
  title: '博客',
  description: 'some experience',
}

export default function Page() {
  return (
    <div className="bg-background overflow-x-hidden ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 md:py-24">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/20 -z-10" />
            <div className="max-w-7xl mx-auto">
              <BlogPostsBlock />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
