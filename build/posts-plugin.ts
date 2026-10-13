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
  modulePath: string
}

export function readIndex(dir: string): PostIndexEntry[] {
  return readdirSync(dir)
    .filter((file) => extname(file) === '.mdx')
    .map((file) => {
      const frontmatter = parseFrontmatter(readFileSync(resolve(dir, file), 'utf8'))
      const slug = frontmatter.slug || basename(file, '.mdx')
      return {
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.publishedAt || '',
        summary: frontmatter.summary || '',
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
