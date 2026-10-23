/**
 * 构建后把每个已知路由写成独立 HTML：
 * - head 是这一页真正的 title / description / canonical / og / twitter / JSON-LD；
 * - body 里放一份 `<noscript>` 静态回退，正文在构建期由同一份 Markdown 渲染，
 *   不执行 JS 的读者和爬虫也能读到内容与站内链接。
 *
 * 两个部署平台的目录约定不同：
 * - Cloudflare Workers 静态资源会把 `foo.html` 直接服务在 `/foo` 上；
 * - GitHub Pages 只认 `foo/index.html`，否则深链接是 404。
 * 所以按模式分别落盘，URL 形式保持一致（无尾斜杠）。
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { renderHtml } from '@tanstack/markdown/html'
import katex from 'katex'
import { readIndex, type PostIndexEntry } from '../build/posts-plugin.ts'
import { PROJECTS } from '../src/content/projects.ts'
import { highlightCode } from '../src/markdown/highlight.ts'
import { createMathExtension } from '../src/markdown/math.ts'
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      default:
        return '&quot;'
    }
  })
}

const math = createMathExtension((tex, displayMode) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, strict: false }),
)

/** 和客户端同一套 Markdown 扩展：公式、代码高亮、站内图片路径都不变。 */
function postBody(post: PostIndexEntry): string {
  const source = readFileSync(resolve(root, post.modulePath.replace(/^\//, '')), 'utf8')
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  return renderHtml(body, {
    allowHtml: true,
    extensions: [math],
    highlighter: highlightCode,
  })
}

const nav = '<nav><a href="/">想法</a> · <a href="/projects">项目</a> · <a href="/about">关于</a> · <a href="/rss.xml">RSS</a></nav>'

function postPath(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`
}

function homeFallback(): string {
  const groups = new Map<string, PostIndexEntry[]>()
  for (const post of posts) {
    const year = post.date.slice(0, 4) || '未标注'
    const bucket = groups.get(year)
    if (bucket) bucket.push(post)
    else groups.set(year, [post])
  }
  const sections = [...groups.entries()]
    .map(
      ([year, list]) =>
        `<h2>${escapeHtml(year)}</h2><ul>${list
          .map(
            (post) =>
              `<li><a href="${postPath(post.slug)}">${escapeHtml(post.title)}</a> <small>${escapeHtml(post.date)}</small></li>`,
          )
          .join('')}</ul>`,
    )
    .join('')
  return `<h1>想法</h1>${sections}`
}

function aboutFallback(): string {
  return `<h1>关于</h1><p>${escapeHtml(ABOUT_DESCRIPTION)}</p><p><a href="https://github.com/0xlxx">GitHub @0xlxx</a></p>`
}

function projectsFallback(): string {
  const items = PROJECTS.map(
    (project) =>
      `<li><a href="${escapeHtml(project.href)}">${escapeHtml(project.name)}</a> — ${escapeHtml(project.desc)}</li>`,
  ).join('')
  return `<h1>项目</h1><ul>${items}</ul>`
}

function postFallback(post: PostIndexEntry, body: string): string {
  return `<h1>${escapeHtml(post.title)}</h1><p><small>${escapeHtml(post.date)} · ${escapeHtml(post.summary)}</small></p>${body}`
}

function notFoundFallback(): string {
  return `<h1>页面不存在</h1><p>${escapeHtml(NOT_FOUND_DESCRIPTION)}</p>`
}

function withFallback(content: string): string {
  return `<noscript><div class="prose">${nav}${content}</div></noscript>`
}

const home: SeoInput = { path: '/', title: SITE_TITLE, description: HOME_DESCRIPTION }
const notFound: SeoInput = {
  path: '/404',
  title: '页面不存在',
  description: NOT_FOUND_DESCRIPTION,
  noindex: true,
}

// KaTeX 的样式只在含公式的文章里按需加载；无 JS 回退要让公式也能正常排版，
// 所以在这些页面的 head 里放一个 <noscript> 样式表（启用脚本时不会被请求）。
const katexCss = readdirSync(resolve(dist, 'assets')).find((file) => /^katex-.*\.css$/.test(file))
const katexLink = katexCss
  ? `<noscript><link rel="stylesheet" href="/assets/${katexCss}" /></noscript>`
  : ''

const routes: Array<{ file: string; seo: SeoInput; fallback: string; head?: string }> = [
  {
    file: 'about',
    seo: { path: '/about', title: '关于', description: ABOUT_DESCRIPTION },
    fallback: aboutFallback(),
  },
  {
    file: 'projects',
    seo: { path: '/projects', title: '项目', description: PROJECTS_DESCRIPTION },
    fallback: projectsFallback(),
  },
  ...posts.map((post) => {
    const body = postBody(post)
    return {
      file: `blog/${post.slug}`,
      seo: {
        path: postPath(post.slug),
        title: post.title,
        description: post.summary,
        ...(post.socialImage ? { image: post.socialImage } : {}),
        type: 'article' as const,
        publishedAt: post.date,
      },
      fallback: postFallback(post, body),
      ...(body.includes('class="katex"') && katexLink ? { head: katexLink } : {}),
    }
  }),
]

function renderPage(seo: SeoInput, fallback: string, extraHead = ''): string {
  const head = renderSeoHead(pageSeo(seo)).replace(/\n/g, '\n    ')
  const html = template
    .replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => `${START}\n    ${head}\n    ${END}`)
    .replace('<div id="root"></div>', `${withFallback(fallback)}\n    <div id="root"></div>`)
  return extraHead ? html.replace('</head>', `  ${extraHead}\n  </head>`) : html
}

function write(file: string, body: string): void {
  const target = resolve(dist, file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, body)
}

write('index.html', renderPage(home, homeFallback()))
write('404.html', renderPage(notFound, notFoundFallback()))

for (const route of routes) {
  const file = mode === 'pages' ? `${route.file}/index.html` : `${route.file}.html`
  write(file, renderPage(route.seo, route.fallback, route.head))
}

if (mode === 'pages') {
  // `/blog` 是列表页的旧别名，canonical 仍收敛到首页。
  write('blog/index.html', renderPage(home, homeFallback()))
  write('.nojekyll', '')
} else {
  write('blog.html', renderPage(home, homeFallback()))
}

console.log(`seo: ${mode} — ${routes.length + 2} pages`)
