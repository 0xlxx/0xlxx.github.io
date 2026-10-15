import { readFileSync, readdirSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:posts'
const RESOLVED_ID = '\0' + VIRTUAL_ID

function parseFrontmatter(source: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  if (!match) return {}

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line)
    if (!pair) continue
    data[pair[1]] = pair[2].trim().replace(/^['"](.*)['"]$/, '$1')
  }
  return data
}

export interface PostIndexEntry {
  slug: string
  title: string
  date: string
  summary: string
  image?: string
  modulePath: string
}

export function readIndex(dir: string): PostIndexEntry[] {
  return readdirSync(dir)
    .filter((file) => extname(file) === '.mdx')
    .map((file) => {
      const source = readFileSync(resolve(dir, file), 'utf8')
      const frontmatter = parseFrontmatter(source)
      const slug = frontmatter.slug || basename(file, '.mdx')
      const image = /!\[[^\]]*\]\(\s*(\/images\/[^\s)>]+)/.exec(source)?.[1]
      return {
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.publishedAt || '',
        summary: frontmatter.summary || '',
        ...(image ? { image } : {}),
        modulePath: `/content/posts/${file}`,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 构建期读取文章 frontmatter，产出 `virtual:posts` 索引。
 * 正文不在这里读取，由 `import.meta.glob('?raw')` 按需懒加载。
 */
export function posts(dir = 'content/posts'): Plugin {
  const absolute = resolve(process.cwd(), dir)
  return {
    name: 'blog:posts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        const bundle = context.bundle
        const posts = readIndex(absolute)
        const routePath = (slug: string) => encodeURI(`/blog/${slug}`)
        const findChunk = (sourcePath: string, base: string) =>
          bundle &&
          Object.values(bundle).find(
            (entry) =>
              entry.type === 'chunk' &&
              (Object.keys(entry.modules).some((id) => id.split('?')[0]?.endsWith(sourcePath)) ||
                entry.name === base ||
                entry.fileName.split('/').at(-1)?.startsWith(`${base}-`)),
          )
        const imageByPath = Object.fromEntries(
          posts
            .filter((post) => post.image)
            .map((post) => [routePath(post.slug), post.image]),
        )
        const postRouteChunk = findChunk('/src/routes/post.tsx', 'post')
        const chunkByPath: Record<string, string[]> = {}
        const addChunks = (path: string, chunks: Array<string | undefined>) => {
          const files = chunks.filter((file): file is string => Boolean(file))
          if (files.length) chunkByPath[path] = files
        }
        for (const [path, file] of [
          ['/', 'blog'],
          ['/blog', 'blog'],
          ['/projects', 'projects'],
          ['/about', 'about'],
        ]) {
          const chunk = findChunk(`/src/routes/${file}.tsx`, file)
          addChunks(path, [chunk ? `/${chunk.fileName}` : undefined])
        }
        for (const post of posts) {
          const file = post.modulePath.split('/').at(-1)
          if (!file) continue
          const base = file.replace(/\.mdx$/, '')
          const bodyChunk = findChunk(`/content/posts/${file}`, base)
          addChunks(routePath(post.slug), [
            postRouteChunk ? `/${postRouteChunk.fileName}` : undefined,
            bodyChunk ? `/${bodyChunk.fileName}` : undefined,
          ])
        }
        const script = `(()=>{const images=${JSON.stringify(imageByPath)};const chunks=${JSON.stringify(chunkByPath)};const path=location.pathname.replace(/\\/$/,'')||'/';const image=images[path];if(image){const link=document.createElement('link');link.rel='preload';link.as='image';link.href=image;link.setAttribute('fetchpriority','high');link.dataset.postImagePreload='';document.head.append(link)}for(const chunk of chunks[path]||[]){const link=document.createElement('link');link.rel='modulepreload';link.href=chunk;document.head.append(link)}})()`
        return [{ tag: 'script', children: script, injectTo: 'head' }]
      },
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return `export const posts = ${JSON.stringify(readIndex(absolute))}`
    },
  }
}
