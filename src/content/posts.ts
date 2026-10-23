import { posts as index, type PostMeta } from 'virtual:posts'

export interface Post extends PostMeta {
  /** 懒加载正文：只有打开文章时才下载对应的 markdown 源码。 */
  load: () => Promise<string>
}

const loaders = import.meta.glob<string>('/content/posts/*.{md,mdx}', {
  query: '?raw',
  import: 'default',
})

export const posts: Post[] = index.map((meta) => ({
  ...meta,
  load: loaders[meta.modulePath],
}))

export function postBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

/** 首页展示用：优先非草稿，按年份倒序分组。 */
export function postsByYear(): Array<[string, Post[]]> {
  const groups = new Map<string, Post[]>()
  for (const post of posts) {
    const year = post.date.slice(0, 4) || '未标注'
    const bucket = groups.get(year)
    if (bucket) bucket.push(post)
    else groups.set(year, [post])
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}
