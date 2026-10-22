/**
 * 部署基路径。Cloudflare Workers 挂在域名根（`/`），GitHub Pages 的项目页挂在
 * `/blog/` 下（`vite build` 时用 `SITE_BASE=/blog/` 指定）。
 *
 * 站点内部一律用「内部路径」（`/`、`/blog/<slug>`、`/about`）做路由匹配，
 * 只有写进地址栏或 HTML 的时候才加前缀，这样两套部署共用同一份路由代码。
 */
const RAW_BASE = import.meta.env.BASE_URL

/** 形如 `/blog`；根部署时为空串。 */
export const BASE_PATH = RAW_BASE === '/' ? '' : RAW_BASE.replace(/\/+$/, '')

/** 内部路径 → 地址栏路径。 */
export function withBase(path: string): string {
  return path === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${path}`
}

/** 地址栏路径 → 内部路径。不在本站基路径下（例如本地预览）时原样返回。 */
export function stripBase(pathname: string): string {
  if (!BASE_PATH) return pathname
  if (pathname === BASE_PATH) return '/'
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length)
  return pathname
}

/** `public/` 下静态资源（图片等）在地址栏里的路径。 */
export function assetUrl(src: string): string {
  return src.startsWith('/') ? `${BASE_PATH}${src}` : src
}
