/**
 * 图片路径归一化。
 *
 * 在 Obsidian 里写稿时，图片放在仓库的 `public/images/…`，用相对路径引用
 * （`../../public/images/<slug>/x.png`）才能在预览里看到；站点需要的是站内绝对
 * 路径 `/images/…`。这里只做这一层转换，别处不要再各写一份。
 */
const PUBLIC_PREFIX = /^(?:\.{1,2}\/)*public\//

export function siteImagePath(src: string): string {
  if (src.startsWith('/images/')) return src
  if (PUBLIC_PREFIX.test(src)) return `/${src.replace(PUBLIC_PREFIX, '')}`
  return src
}
