import { BlogPosts } from 'app/components/posts'
import Script from 'next/script'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter [view-transition-name:page-title]">
        XinXin Li
      </h1>
      <p className="mb-4">
       {`I'm a web developer and optimist. Currently working on Web3D and AI related projects. I'm also interested in visualization technology.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
