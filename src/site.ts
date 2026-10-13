/**
 * 站点级常量。构建期生成 sitemap / rss / robots 与运行时写 canonical、
 * og:url 共用同一份取值，避免两边各写一个域名。
 */
export const SITE_URL = 'https://bjorn.men'
export const SITE_TITLE = 'Bjorn Li'
export const SITE_DESCRIPTION = '一个程序员'

/** 文章链接：slug 可能含中文，统一做 URL 转义。 */
export function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${encodeURIComponent(slug)}`
}
