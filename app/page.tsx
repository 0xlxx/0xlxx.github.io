import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <div className="container mx-auto">
      <section className="grid gap-8 py-20 md:gap-16 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-8 animate-in slide-in-from-bottom">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl [view-transition-name:page-title]">
              XinXin Li
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {`I'm a web developer and optimist. Currently working on Web3D and AI related projects. I'm also interested in visualization technology.`}
            </p>
          </div>
        </div>
        <div className="animate-in slide-in-from-bottom [--animation-delay:200ms]">
          <BlogPosts />
        </div>
      </section>
    </div>
  )
}
