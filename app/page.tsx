import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-foreground text-2xl font-semibold tracking-tighter [view-transition-name:page-title]">
          XinXin Li
        </h1>
        <p className="text-muted-foreground">
          {`I'm a web developer and optimist. Currently working on Web3D and AI related projects. I'm also interested in visualization technology.`}
        </p>
      </div>
      <BlogPosts />
    </section>
  )
}
