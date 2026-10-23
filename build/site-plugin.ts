import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { readIndex } from './posts-plugin.ts'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, postUrl } from '../src/site.ts'

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&apos;'
    }
  })
}

function buildSitemap(posts: ReturnType<typeof readIndex>): string {
  const latest = posts[0]?.date
  const entries: Array<{ loc: string; lastmod?: string; image?: string }> = [
    { loc: `${SITE_URL}/`, lastmod: latest },
    { loc: `${SITE_URL}/projects` },
    { loc: `${SITE_URL}/about` },
    ...posts.map((post) => ({
      loc: postUrl(post.slug),
      lastmod: post.date,
      image: post.socialImage ?? post.image,
    })),
  ]
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
      // 图片条目让搜索引擎知道文章配图的正式地址，而不只是正文里的 <img>。
      const image = entry.image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(`${SITE_URL}${entry.image}`)}</image:loc>\n    </image:image>`
        : ''
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}${image}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`
}

function buildRss(posts: ReturnType<typeof readIndex>): string {
  const items = posts
    .map((post) => {
      const link = postUrl(post.slug)
      const pubDate = new Date(post.date)
      const date = Number.isNaN(pubDate.getTime()) ? '' : `\n      <pubDate>${pubDate.toUTCString()}</pubDate>`
      return `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid>${escapeXml(link)}</guid>\n      <description>${escapeXml(post.summary)}</description>${date}\n    </item>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>${escapeXml(SITE_TITLE)}</title>\n    <link>${SITE_URL}</link>\n    <description>${escapeXml(SITE_DESCRIPTION)}</description>\n    <language>zh-CN</language>\n    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>\n${items}\n  </channel>\n</rss>\n`
}

/**
 * 构建期产出静态站点的 SEO 附属文件。
 * 文章索引和 `virtual:posts` 共用 `readIndex`，不会出现两份真相。
 */
export function siteMetadata(dir = 'content/posts'): Plugin {
  let outDir = 'dist'
  return {
    name: 'blog:site-metadata',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const posts = readIndex(resolve(process.cwd(), dir))
      writeFileSync(resolve(outDir, 'sitemap.xml'), buildSitemap(posts))
      writeFileSync(resolve(outDir, 'rss.xml'), buildRss(posts))
      writeFileSync(
        resolve(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      )
    },
  }
}
