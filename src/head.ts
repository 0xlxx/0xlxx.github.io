import { SITE_TITLE, SITE_URL } from './site'

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

/*
 * SPA 的路由在客户端切换，而 index.html 只有一份 head。
 * 每次导航后把标题、描述与 canonical / og 同步成当前页面的值，
 * 否则分享出去的链接标题永远是首页。
 */
export function syncDocumentMeta(title: string, description: string, path: string): void {
  const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
  const displayTitle = title === SITE_TITLE ? title : `${title} · ${SITE_TITLE}`

  document.title = displayTitle
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', displayTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = url
}
