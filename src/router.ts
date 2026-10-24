import { createStore } from './store'
import { postBySlug } from './content/posts'

const routePrefetches = new Map<string, Promise<void>>()
let pendingRouteCommit: { path: string; resolve: () => void } | null = null

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
/** 本次切换要放回的滚动位置，由 App 在提交后、绘制前取走；绑定目标路径，避免落到别的页面。 */
let pendingScroll: { path: string; y: number } | null = null
/**
 * 过渡期间施加在正文上的补偿位移（离开位置 − 目标位置）。
 *
 * 视图过渡会把「元素在视口里的位置变化」补间成一段位移：只要滚动位置变了，旧页面的截图
 * 就会被当成「滚了一下」推走——这正是切菜单时右侧内容莫名自动滚动的来源。所以过渡期间
 * 不动滚动，改为给正文挂一段反向位移，让两次截图的元素几何完全一致，只剩模糊淡入淡出。
 */
let pendingTransitionOffset: { path: string; offset: number } | null = null
/**
 * 导航世代号：每次导航都递增。过渡被下一次导航顶掉时，规范允许两个 update 回调
 * 乱序执行，旧过渡的清理和提交都必须靠它作废，不能动到新导航的状态。
 */
let navigationGeneration = 0
/**
 * 仍在「撑高 + 补偿位移」状态的过渡。新导航开始时先把它落回真实位置，
 * 否则撑高与位移会被下一个页面继承，永久留在 DOM 上。
 */
let activeScrollHold: { generation: number; path: string; destinationScrollY: number } | null = null
/** 当前活动的视图过渡，用于无过渡导航（popstate / reduced motion）时主动跳过它。 */
let activeViewTransition: ViewTransition | null = null

/** 列表有 `/` 和 `/blog` 两种写法，归一成同一个键，滚动位置才对得上。 */
function scrollKey(path: string): string {
  return path === '/blog' ? '/' : path
}

/**
 * 取出并清空本次要放回的滚动位置；不是这个页面的切换时为 null。
 * 路径不匹配说明这是上一页残留的值（过渡被顶掉后旧渲染才落地），直接忽略。
 */
export function takePendingScrollY(path: string): number | null {
  if (pendingScroll?.path !== path) return null
  const y = pendingScroll.y
  pendingScroll = null
  return y
}

/** 取出本次要施加的补偿位移并清空；不是这个页面的过渡切换时为 null。 */
export function takeTransitionOffset(path: string): number | null {
  if (pendingTransitionOffset?.path !== path) return null
  const offset = pendingTransitionOffset.offset
  pendingTransitionOffset = null
  return offset
}

/**
 * 补偿位移挂在正文容器上：transform 不参与布局，`main` 的盒子不会被带着动，
 * 视图过渡算出来的几何才和上一次截图一致。传 null 表示撤销。
 */
export function setTransitionOffset(offset: number | null): void {
  const layer = document.querySelector<HTMLElement>('[data-page-content]')
  if (!layer) return
  if (offset === null || offset === 0) layer.style.removeProperty('transform')
  else layer.style.transform = `translateY(${offset}px)`
}

/** 页面外壳：sticky 导航受它约束，撑高时不能漏掉。 */
function pageShell(): HTMLElement | null {
  return document.querySelector<HTMLElement>('main')?.parentElement ?? null
}

/**
 * 过渡期间把页面撑到「离开位置」仍然可用的高度，并关掉滚动锚定：
 * 这样目标页更短时，浏览器也不会把旧的滚动位置夹掉、让两次截图的几何对不上。
 */
function holdScrollPosition(minHeight: number): void {
  const value = `${minHeight}px`
  document.documentElement.style.minHeight = value
  document.body.style.minHeight = value
  // sticky 导航受页面外壳约束；只延长 html/body 会让短目标页里的导航滑出视口。
  const shell = pageShell()
  if (shell) shell.style.minHeight = value
  document.documentElement.style.overflowAnchor = 'none'
  document.body.style.overflowAnchor = 'none'
}

/** 撤掉临时的撑高与滚动锚定开关，让页面回到真实高度。 */
function releaseScrollHold(): void {
  document.documentElement.style.removeProperty('min-height')
  document.body.style.removeProperty('min-height')
  pageShell()?.style.removeProperty('min-height')
  document.documentElement.style.removeProperty('overflow-anchor')
  document.body.style.removeProperty('overflow-anchor')
}

/**
 * 过渡还没收尾就又导航了：把上一段过渡的撑高与补偿位移落回真实状态。
 *
 * 只有目标页已经提交时才滚到它的目标位置——若旧导航还在加载、根本没画出来，
 * 用户看到的仍是出发页，此时滚动一下反而会跳。
 */
function settleScrollHold(): void {
  const hold = activeScrollHold
  if (!hold) return
  activeScrollHold = null
  if (routeStore.get() === hold.path) {
    window.scrollTo({ top: hold.destinationScrollY, behavior: 'instant' })
  }
  releaseScrollHold()
  setTransitionOffset(null)
}

/** 切换路由：先记住离开时的位置，再把目标页的位置准备好。 */
function commit(next: string, transition = true): void {
  if (next === currentPath) return
  const generation = (navigationGeneration += 1)

  /*
   * 上一次导航可能还在过渡中：先把它的临时滚动状态落回真实位置。
   * 否则它的撑高和补偿位移会被新页面继承下来，而它的收尾早已因为世代过期而作废。
   */
  settleScrollHold()

  const sourcePath = currentPath
  const sourceScrollY = window.scrollY
  scrollPositions.set(scrollKey(sourcePath), sourceScrollY)
  currentPath = next
  const destinationScrollY = scrollPositions.get(scrollKey(next)) ?? 0

  // 旧过渡的更新回调可能正挂在这个 Promise 上等一次永远不会到来的提交，先放它走。
  pendingRouteCommit?.resolve()
  pendingRouteCommit = null

  const useViewTransition =
    transition &&
    // 过渡期间点了「当前正在显示的这一页」：DOM 不用换，再转一次只会白闪。
    routeStore.get() !== next &&
    Boolean(document.startViewTransition) &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const update = () => {
    // 被后续导航顶掉时，规范允许旧过渡的 update 回调晚于新回调执行；世代对不上就别写回旧路由。
    if (generation === navigationGeneration) routeStore.set(next)
  }

  // 没有视图过渡（首屏、reduced motion、浏览器不支持）就照旧直接把滚动放回去。
  if (!useViewTransition || !document.startViewTransition) {
    activeViewTransition?.skipTransition()
    pendingTransitionOffset = null
    pendingScroll = { path: next, y: destinationScrollY }
    update()
    return
  }

  const offset = sourceScrollY - destinationScrollY
  const compensateScroll = offset !== 0
  if (compensateScroll) {
    // 落位改由过渡收尾时一次性完成，App 这次不要自己滚。
    pendingScroll = null
    pendingTransitionOffset = { path: next, offset }
    activeScrollHold = { generation, path: next, destinationScrollY }
    holdScrollPosition(Math.max(sourceScrollY, destinationScrollY) + window.innerHeight)
  } else {
    // 上一次导航若留下了位移，绝不能让它落到这个页面上。
    pendingTransitionOffset = null
    pendingScroll = { path: next, y: destinationScrollY }
  }

  const routeCommitted = new Promise<void>((resolve) => {
    pendingRouteCommit = { path: next, resolve }
  })
  const viewTransition = document.startViewTransition(async () => {
    if (generation !== navigationGeneration) return
    update()
    // 等 Octane 提交新路由、layout effect 把补偿位移放好，再截取转场的新画面。
    await routeCommitted
  })
  activeViewTransition = viewTransition
  // 被下一次导航顶掉时 ready 会以 AbortError 拒绝；没人消费就会在控制台留下未处理异常。
  void viewTransition.ready.catch(() => {})
  void viewTransition.finished.then(
    () => {
      if (activeViewTransition === viewTransition) activeViewTransition = null
    },
    () => {
      if (activeViewTransition === viewTransition) activeViewTransition = null
    },
  )
  if (!compensateScroll) return

  const finishScrollTransition = () => {
    // 这一次过渡被跳过时清理已经过期，收尾交给后一次过渡。
    if (generation !== navigationGeneration) return
    const deadline = performance.now() + 1000
    const settle = () => {
      // 重试期间又发生了导航：立刻停手，交给新导航收尾。
      if (generation !== navigationGeneration) return
      releaseScrollHold()
      window.scrollTo({ top: destinationScrollY, behavior: 'instant' })
      // 目标页正文还没长到目标高度（例如文章正文懒加载）：先撑住高度、留着补偿位移，
      // 下一帧再试，这期间滚动位置和画面都不动。
      if (window.scrollY !== destinationScrollY && performance.now() < deadline) {
        holdScrollPosition(destinationScrollY + window.innerHeight)
        window.scrollTo({ top: sourceScrollY, behavior: 'instant' })
        requestAnimationFrame(settle)
        return
      }
      activeScrollHold = null
      // 撤销补偿位移与落位在同一帧里完成：滚动位置换了，画面却完全不动。
      setTransitionOffset(null)
    }
    settle()
  }
  void viewTransition.finished.then(finishScrollTransition, finishScrollTransition)
}

/* 路由切换由应用接管滚动恢复，避免浏览器默认恢复与新页面布局/视图过渡互相竞争。 */
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
if (typeof entryScrollY === 'number') pendingScroll = { path: readPath(), y: entryScrollY }

window.addEventListener('popstate', () => {
  commit(readPath(), false)
})

export function navigate(to: string, options?: { replace?: boolean; transition?: boolean }): void {
  const next = to.startsWith('/') ? to : `/${to}`
  /*
   * 和地址栏比，而不是和已渲染的 routeStore 比：过渡期间新路由还没提交时，
   * 后者仍是出发页，会把用户在过渡中点的第二次导航当成「已经在这页」直接丢掉。
   */
  if (next === readPath()) return

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
