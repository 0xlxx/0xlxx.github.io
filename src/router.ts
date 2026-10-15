import { createStore } from './store'
import { postBySlug } from './content/posts'

const routePrefetches = new Map<string, Promise<void>>()
let pendingRouteCommit: { path: string; resolve: () => void } | null = null
let pendingTransitionScrollOffset: number | null = null

export function takeTransitionScrollOffset(): number | null {
  const offset = pendingTransitionScrollOffset
  pendingTransitionScrollOffset = null
  return offset
}

/** 通知 View Transition：新路由已提交，布局阶段的滚动恢复也已完成。 */
export function acknowledgeRouteCommit(path: string): void {
  if (pendingRouteCommit?.path !== path) return
  pendingRouteCommit.resolve()
  pendingRouteCommit = null
}

/** 在用户表明导航意图时提前取页面模块与文章正文；失败时正常导航仍可重试。 */
export function prefetchRoute(path: string): void {
  if (routePrefetches.has(path)) return

  const slug = matchSegment('/blog/:slug', path)
  const task = slug
    ? Promise.all([
        import('./routes/post'),
        postBySlug(slug)?.load() ?? Promise.resolve(),
      ])
    : path === '/' || path === '/blog'
      ? import('./routes/blog')
      : path === '/projects'
        ? import('./routes/projects')
        : path === '/about'
          ? import('./routes/about')
          : null

  if (!task) return
  const prefetch = Promise.resolve(task).then(() => undefined).catch(() => undefined)
  routePrefetches.set(path, prefetch)
}

/** 去掉尾斜杠，`/blog/` 与 `/blog` 视为同一路由。 */
function readPath(): string {
  const path = window.location.pathname.replace(/\/{2,}/g, '/')
  return path.length > 1 ? path.replace(/\/+$/, '') : '/'
}

export const routeStore = createStore<string>(readPath())

/*
 * 滚动位置属于「页面」而不是组件，所以记在路由这一层：离开时存下，进入时放回。
 * 这样从文章返回列表能落回原处，而不是从顶部重来。
 */
const scrollPositions = new Map<string, number>()
/** 已经渲染出来的路由：popstate 触发时地址栏已经变了，得靠它才知道离开的是哪一页。 */
let currentPath = routeStore.get()
/** 本次切换要放回的滚动位置，由 App 在提交后、绘制前取走。 */
let pendingScrollY: number | null = null

/** 列表有 `/` 和 `/blog` 两种写法，归一成同一个键，滚动位置才对得上。 */
function scrollKey(path: string): string {
  return path === '/blog' ? '/' : path
}

/** 取出并清空本次要放回的滚动位置；不是路由切换时为 null。 */
export function takePendingScrollY(): number | null {
  const y = pendingScrollY
  pendingScrollY = null
  return y
}

/** 切换路由：先记住离开时的位置，再把目标页的位置准备好。 */
function commit(next: string, transition = true): void {
  if (next === currentPath) return
  const sourcePath = currentPath
  const sourceScrollY = window.scrollY
  scrollPositions.set(scrollKey(sourcePath), sourceScrollY)
  currentPath = next
  pendingScrollY = scrollPositions.get(scrollKey(next)) ?? 0
  const useViewTransition =
    transition &&
    Boolean(document.startViewTransition) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const holdScrollForTransition =
    useViewTransition &&
    scrollKey(sourcePath) === '/' &&
    Boolean(matchSegment('/blog/:slug', next)) &&
    sourceScrollY > 0
  pendingTransitionScrollOffset = holdScrollForTransition ? sourceScrollY : null
  const update = () => routeStore.set(next)
  if (useViewTransition && document.startViewTransition) {
    const originalMinHeight = document.documentElement.style.minHeight
    const originalBodyMinHeight = document.body.style.minHeight
    const originalHtmlOverflowAnchor = document.documentElement.style.overflowAnchor
    const originalBodyOverflowAnchor = document.body.style.overflowAnchor
    if (holdScrollForTransition) {
      const minHeight = `${sourceScrollY + window.innerHeight}px`
      document.documentElement.style.minHeight = minHeight
      document.body.style.minHeight = minHeight
      document.documentElement.style.overflowAnchor = 'none'
      document.body.style.overflowAnchor = 'none'
    }
    pendingRouteCommit?.resolve()
    const routeCommitted = new Promise<void>((resolve) => {
      pendingRouteCommit = { path: next, resolve }
    })
    const viewTransition = document.startViewTransition(async () => {
      update()
      // 等 Octane 提交新路由并完成 layout effect 中的滚动恢复，再截取转场的新画面。
      await routeCommitted
    })
    if (holdScrollForTransition) {
      const finishScrollTransition = () => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        document.querySelector<HTMLElement>('main')?.style.removeProperty('transform')
        document.documentElement.style.minHeight = originalMinHeight
        document.body.style.minHeight = originalBodyMinHeight
        document.documentElement.style.overflowAnchor = originalHtmlOverflowAnchor
        document.body.style.overflowAnchor = originalBodyOverflowAnchor
      }
      void viewTransition.finished.then(finishScrollTransition, finishScrollTransition)
    }
  } else {
    update()
  }
}

/*
 * 交给浏览器自动恢复会走 CSS 的 `scroll-behavior: smooth`，于是「返回列表」变成一段
 * 从顶部滚下来的动画。这里接管过来，位置在绘制前一次性放好，看不见滚动过程。
 */
window.history.scrollRestoration = 'manual'

/** 历史条目上的 state 只放我们自己的东西。 */
type EntryState = { scrollY?: number }

// 接管之后刷新页面也得自己管：滚动停下来时把位置写进当前历史条目，重新加载时读回来。
// （不能在 pagehide 里写，浏览器会忽略卸载期间的 history 更新。）
let writeTimer = 0
window.addEventListener(
  'scroll',
  () => {
    window.clearTimeout(writeTimer)
    writeTimer = window.setTimeout(() => {
      window.history.replaceState({ scrollY: window.scrollY }, '')
    }, 150)
  },
  { passive: true },
)

const entryScrollY = (window.history.state as EntryState | null)?.scrollY
if (typeof entryScrollY === 'number') pendingScrollY = entryScrollY

window.addEventListener('popstate', () => {
  commit(readPath(), false)
})

export function navigate(to: string, options?: { replace?: boolean; transition?: boolean }): void {
  const next = to.startsWith('/') ? to : `/${to}`
  if (next === routeStore.get()) return

  if (options?.replace) window.history.replaceState(null, '', next)
  else window.history.pushState(null, '', next)

  commit(readPath(), options?.transition)
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
