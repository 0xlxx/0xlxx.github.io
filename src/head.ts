import { AUTHOR_NAME, AUTHOR_URL, type Seo } from './seo'
import { SITE_TITLE } from './site'

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function upsertCanonical(href: string): void {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = href
}

/*
 * SPA 的路由在客户端切换，而静态 HTML 只有一份 head。
 * 每次导航后把标题、描述、canonical、社交卡片与结构化数据同步成当前页面的值，
 * 否则分享出去的链接标题永远是首页，执行 JS 的爬虫也会读到错误的结构化数据。
 */
export function applySeo(seo: Seo): void {
  document.title = seo.title
  upsertMeta('name', 'description', seo.description)
  upsertMeta('name', 'author', AUTHOR_NAME)
  upsertMeta('name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
  upsertMeta('property', 'og:type', seo.type)
  upsertMeta('property', 'og:site_name', SITE_TITLE)
  upsertMeta('property', 'og:title', seo.title)
  upsertMeta('property', 'og:description', seo.description)
  upsertMeta('property', 'og:url', seo.url)
  upsertMeta('property', 'og:locale', 'zh_CN')
  upsertMeta('property', 'og:image', seo.image)
  upsertMeta('property', 'og:image:alt', seo.title)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', seo.title)
  upsertMeta('name', 'twitter:description', seo.description)
  upsertMeta('name', 'twitter:image', seo.image)

  // 从文章切到普通页面时，前一篇的 article 元数据不能留在 head 里。
  if (seo.publishedAt) upsertMeta('property', 'article:published_time', seo.publishedAt)
  else removeMeta('property', 'article:published_time')
  if (seo.type === 'article') upsertMeta('property', 'article:author', AUTHOR_URL)
  else removeMeta('property', 'article:author')

  if (seo.noindex) document.head.querySelector('link[rel="canonical"]')?.remove()
  else upsertCanonical(seo.url)

  let jsonLd = document.getElementById('seo-jsonld') as HTMLScriptElement | null
  if (!jsonLd) {
    jsonLd = document.createElement('script')
    jsonLd.type = 'application/ld+json'
    jsonLd.id = 'seo-jsonld'
    document.head.append(jsonLd)
  }
  jsonLd.textContent = JSON.stringify(seo.jsonLd)
}
