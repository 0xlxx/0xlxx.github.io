/**
 * GitHub Pages 是纯静态托管，没有服务端回退。站点路由在客户端，直接访问
 * `/blog/<slug>` 这类路径时，Pages 找不到文件就返回 404.html——浏览器能渲染，
 * 但对爬虫和链接预览是 404。
 *
 * 所以给已知路由各写一份 index.html：Pages 命中目录即返回 200，客户端路由照常接管。
 * 未知路径（例如已删除文章的旧链接）仍回退到 404.html，语义正确。
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { readIndex } from '../build/posts-plugin.ts'

const dist = resolve(process.cwd(), 'dist')
const index = resolve(dist, 'index.html')

const routes = [
  'about',
  'projects',
  // `/blog` 是列表页的旧别名，指向同一份首页内容。
  'blog',
  ...readIndex(resolve(process.cwd(), 'content/posts')).map((post) => `blog/${post.slug}`),
]

for (const route of routes) {
  const target = resolve(dist, route, 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(index, target)
}

copyFileSync(index, resolve(dist, '404.html'))
// 关掉 Jekyll：产物里有下划线开头的文件，不想被它的处理规则动到。
writeFileSync(resolve(dist, '.nojekyll'), '')

console.log(`pages: ${routes.length} routes + 404.html`)
