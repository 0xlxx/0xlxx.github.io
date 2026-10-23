/**
 * 图片路径归一化。
 *
 * Obsidian vault 只覆盖 `content/`：文章在 `content/posts/…`，图片在
 * `content/images/…`，所以插件插入的是 `../images/<slug>/x.png`——这样预览能直接
 * 看到图。站点对外仍使用 `/images/…`，这里做这一层转换。
 *
 * 兼容旧写法：`public/images/…`、`/images/…`。
 */
const PUBLIC_PREFIX = /^(?:\.{1,2}\/)*public\//
const CONTENT_IMAGES_PREFIX = /^(?:\.{1,2}\/)+images\//

export function siteImagePath(src: string): string {
  if (src.startsWith('/images/')) return src
  if (CONTENT_IMAGES_PREFIX.test(src)) return `/images/${src.replace(CONTENT_IMAGES_PREFIX, '')}`
  if (PUBLIC_PREFIX.test(src)) return `/${src.replace(PUBLIC_PREFIX, '')}`
  return src
}
