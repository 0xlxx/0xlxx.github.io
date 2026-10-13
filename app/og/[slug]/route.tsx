let postsCache: Array<{ slug: string; metadata: { title: string } }> | null = null

async function getPosts() {
  if (postsCache) return postsCache
  try {
    const { getBlogPosts } = await import('app/blog/utils')
    postsCache = getBlogPosts()
  } catch {
    postsCache = []
  }
  return postsCache
}

export async function generateStaticParams() {
  const all = await getPosts()
  return all.map((post) => ({ slug: post.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const all = await getPosts()
  const post = all.find((p) => p.slug === slug)
  const title = post?.metadata.title ?? 'Bjorn Li'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="white"/>
  <text x="64" y="315" font-family="sans-serif" font-size="48" font-weight="bold" fill="black">${escapeXml(title)}</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
