/**
 * 页面级 SEO 元数据。运行时换页（`src/head.ts`）和构建期生成静态 HTML
 * （`scripts/generate-seo-html.ts`）共用这一份取值，避免爬虫看到的 head
 * 与用户切页后看到的不一致。
 */
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from './site'

export const AUTHOR_NAME = 'Bjorn Li'
export const AUTHOR_URL = `${SITE_URL}/about`
export const AUTHOR_GITHUB = 'https://github.com/0xlxx'

/** 没有配图的页面用这张默认社交预览图。 */
export const DEFAULT_IMAGE = '/og.jpg'

export const HOME_DESCRIPTION = '写点关于前端工程、渲染管线与系统设计的笔记。'
export const PROJECTS_DESCRIPTION = '做过的一些东西。'
export const ABOUT_DESCRIPTION = '程序员，对程序开发、交互设计和创意编程有广泛兴趣。'
export const NOT_FOUND_DESCRIPTION = '链接可能失效了，或者这个想法还没写。'

export type SeoType = 'website' | 'article'

export interface SeoInput {
  /** 站内路径，已做 URL 转义：`/`、`/blog/<slug>`、`/about`。 */
  path: string
  /** 页面标题，不含「· Bjorn Li」后缀。 */
  title: string
  description?: string
  /** 站内绝对路径的分享图，例如 `/images/foo.png`。 */
  image?: string
  type?: SeoType
  /** 文章发布日期，`YYYY-MM-DD`。 */
  publishedAt?: string
  noindex?: boolean
}

export interface Seo {
  /** 完整标题（首页除外，带「· Bjorn Li」后缀）。 */
  title: string
  description: string
  url: string
  image: string
  type: SeoType
  publishedAt?: string
  noindex: boolean
  jsonLd: Record<string, unknown>
}

function absolute(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl}`
}

export function pageSeo(input: SeoInput): Seo {
  const description = input.description ?? SITE_DESCRIPTION
  const type = input.type ?? 'website'
  const url = input.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${input.path}`
  const image = absolute(input.image ?? DEFAULT_IMAGE)
  const title = input.title === SITE_TITLE ? SITE_TITLE : `${input.title} · ${SITE_TITLE}`
  const noindex = input.noindex ?? false
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
  }
  const author = {
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    sameAs: [AUTHOR_GITHUB],
  }

  let jsonLd: Record<string, unknown>
  if (type === 'article') {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: input.title,
      description,
      image: [image],
      ...(input.publishedAt ? { datePublished: input.publishedAt, dateModified: input.publishedAt } : {}),
      author,
      // Google 的 Article 富媒体结果要求 publisher，博客以作者本人作为发布方。
      publisher: author,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      inLanguage: 'zh-CN',
      isPartOf: website,
    }
  } else if (input.path === '/') {
    jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [website, { ...author, '@id': `${SITE_URL}/#person`, description: SITE_DESCRIPTION }],
    }
  } else {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: input.title,
      description,
      url,
      inLanguage: 'zh-CN',
      isPartOf: website,
    }
  }

  return {
    title,
    description,
    url,
    image,
    type,
    ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
    noindex,
    jsonLd,
  }
}

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

function meta(attr: 'name' | 'property', key: string, content: string): string {
  return `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`
}

/**
 * 构建期把同一份元数据渲染成 HTML。顺序与 `index.html` 里的占位块一致，
 * 由 `scripts/generate-seo-html.ts` 整块替换。
 */
export function renderSeoHead(seo: Seo): string {
  const jsonLd = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('name', 'description', seo.description),
    meta('name', 'author', AUTHOR_NAME),
    meta('name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'),
    // noindex 的页面（404）不需要 canonical，免得把错误路径当成正式地址。
    ...(seo.noindex ? [] : [`<link rel="canonical" href="${escapeHtml(seo.url)}" />`]),
    meta('property', 'og:type', seo.type),
    meta('property', 'og:site_name', SITE_TITLE),
    meta('property', 'og:title', seo.title),
    meta('property', 'og:description', seo.description),
    meta('property', 'og:url', seo.url),
    meta('property', 'og:locale', 'zh_CN'),
    meta('property', 'og:image', seo.image),
    meta('property', 'og:image:alt', seo.title),
    ...(seo.publishedAt ? [meta('property', 'article:published_time', seo.publishedAt)] : []),
    ...(seo.type === 'article' ? [meta('property', 'article:author', AUTHOR_URL)] : []),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', seo.title),
    meta('name', 'twitter:description', seo.description),
    meta('name', 'twitter:image', seo.image),
    `<script type="application/ld+json">${jsonLd}</script>`,
  ]
  return tags.join('\n')
}
