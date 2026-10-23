/**
 * 构建后把每个已知路由写成独立 HTML：head 是这一页真正的 title / description /
 * canonical / og / twitter / JSON-LD，不再让所有路径共用首页那一份。
 *
 * 两个部署平台的目录约定不同：
 * - Cloudflare Workers 静态资源会把 `foo.html` 直接服务在 `/foo` 上；
 * - GitHub Pages 只认 `foo/index.html`，否则深链接是 404。
 * 所以按模式分别落盘，URL 形式保持一致（无尾斜杠）。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { readIndex } from '../build/posts-plugin.ts'
import {
  ABOUT_DESCRIPTION,
  HOME_DESCRIPTION,
  NOT_FOUND_DESCRIPTION,
  PROJECTS_DESCRIPTION,
  pageSeo,
  renderSeoHead,
  type SeoInput,
} from '../src/seo.ts'
import { SITE_TITLE } from '../src/site.ts'

const mode = process.argv[2] === 'pages' ? 'pages' : 'cloudflare'
const root = process.cwd()
const dist = resolve(root, 'dist')
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const START = '<!--seo:start-->'
const END = '<!--seo:end-->'
if (!template.includes(START) || !template.includes(END)) {
  throw new Error('dist/index.html 缺少 <!--seo:start--> / <!--seo:end--> 占位')
}

const posts = readIndex(resolve(root, 'content/posts'))
const home: SeoInput = { path: '/', title: SITE_TITLE, description: HOME_DESCRIPTION }
const notFound: SeoInput = {
  path: '/404',
  title: '页面不存在',
  description: NOT_FOUND_DESCRIPTION,
  noindex: true,
}

const routes: Array<[file: string, seo: SeoInput]> = [
  ['about', { path: '/about', title: '关于', description: ABOUT_DESCRIPTION }],
  ['projects', { path: '/projects', title: '项目', description: PROJECTS_DESCRIPTION }],
  ...posts.map<[string, SeoInput]>((post) => [
    `blog/${post.slug}`,
    {
      path: `/blog/${encodeURIComponent(post.slug)}`,
      title: post.title,
      description: post.summary,
      ...(post.socialImage ? { image: post.socialImage } : {}),
      type: 'article',
      publishedAt: post.date,
    },
  ]),
]

function withSeo(seo: SeoInput): string {
  const head = renderSeoHead(pageSeo(seo)).replace(/\n/g, '\n    ')
  return template.replace(
    new RegExp(`${START}[\\s\\S]*?${END}`),
    () => `${START}\n    ${head}\n    ${END}`,
  )
}

function write(file: string, body: string): void {
  const target = resolve(dist, file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, body)
}

write('index.html', withSeo(home))
write('404.html', withSeo(notFound))

for (const [file, seo] of routes) {
  write(mode === 'pages' ? `${file}/index.html` : `${file}.html`, withSeo(seo))
}

if (mode === 'pages') {
  // `/blog` 是列表页的旧别名，canonical 仍收敛到首页。
  write('blog/index.html', withSeo(home))
  write('.nojekyll', '')
} else {
  write('blog.html', withSeo(home))
}

console.log(`seo: ${mode} — ${routes.length + 2} pages`)
