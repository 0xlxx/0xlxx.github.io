import { createStore } from './store'

/** 去掉尾斜杠，`/blog/` 与 `/blog` 视为同一路由。 */
function readPath(): string {
  const path = window.location.pathname.replace(/\/{2,}/g, '/')
  return path.length > 1 ? path.replace(/\/+$/, '') : '/'
}

export const routeStore = createStore<string>(readPath())

window.addEventListener('popstate', () => {
  routeStore.set(readPath())
})

export function navigate(to: string, options?: { replace?: boolean }): void {
  const next = to.startsWith('/') ? to : `/${to}`
  if (next === routeStore.get()) return

  if (options?.replace) window.history.replaceState(null, '', next)
  else window.history.pushState(null, '', next)

  routeStore.set(readPath())
  window.scrollTo({ top: 0, behavior: 'instant' })
}

/**
 * 匹配形如 `/blog/:slug` 的单参数模式，成功返回参数的解码值。
 * 只处理一段，够用且不需要引入路由库。
 */
export function matchSegment(pattern: string, path: string): string | null {
  const [base, param] = pattern.split('/:')
  if (!param) return null
  if (!path.startsWith(base + '/')) return null

  const rest = path.slice(base.length + 1)
  if (rest.length === 0 || rest.includes('/')) return null
  return decodeURIComponent(rest)
}
