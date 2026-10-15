import * as stylex from '@octanejs/stylex'
import {
  createElement,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ElementDescriptor,
} from 'octane'
import { Link } from './components/link'
import { postBySlug } from './content/posts'
import { syncDocumentMeta } from './head'
import { matchSegment, routeStore, takePendingScrollY } from './router'
import { SITE_DESCRIPTION, SITE_TITLE } from './site'
import { cycleTheme, themeStore, watchSystemTheme } from './theme'
import type { ThemePreference } from './theme'
import { ThemeIcon } from './components/theme-icon'

type PageRoute = 'blog' | 'post' | 'projects' | 'about' | 'notFound'
type PageRenderer = (slug: string | null) => ElementDescriptor<any>

const pageLoaders: Record<PageRoute, () => Promise<PageRenderer>> = {
  blog: async () => {
    const { Blog } = await import('./routes/blog')
    return () => createElement(Blog, null)
  },
  post: async () => {
    const { Post } = await import('./routes/post')
    return (slug) => createElement(Post, { slug: slug ?? '' })
  },
  projects: async () => {
    const { Projects } = await import('./routes/projects')
    return () => createElement(Projects, null)
  },
  about: async () => {
    const { About } = await import('./routes/about')
    return () => createElement(About, null)
  },
  notFound: async () => {
    const { NotFound } = await import('./routes/not-found')
    return () => createElement(NotFound, null)
  },
}

/* 主题按钮的 aria 文案：说明当前偏好，并暗示点击可切换。 */
const THEME_LABELS: Record<ThemePreference, string> = {
  light: '主题：亮色（点击切换）',
  dark: '主题：暗色（点击切换）',
  system: '主题：跟随系统（点击切换）',
}

const s = stylex.create({
  /*
   * 整页骨架（参考 shud.in）：窄屏是「导航一行 + 正文一列」，
   * 够宽就拆成「左侧竖排导航 | 竖线 | 正文列」，整组在视口里居中。
   */
  page: {
    display: 'flex',
    flexDirection: 'column',
    minBlockSize: '100dvh',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-fg)',
    paddingBlock: 'var(--space-l)',
    paddingInline: 'var(--gutter)',
    '@media (min-width: 48rem)': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 'var(--space-xl)',
      /* 用逻辑长手属性，别用 padding 简写：简写和上面的逻辑属性不是同一个属性，会被基础值盖掉。 */
      paddingBlock: 'var(--space-xl)',
      paddingInline: 'var(--space-xl)',
    },
  },
  /*
   * 竖排导航。窄屏收成一行（菜单靠左、按钮靠右），够宽就是左边那一列：
   * 菜单钉顶、主题按钮沉底，两者同列左对齐，构成上下对称。
   */
  rail: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-s) var(--space-m)',
    minInlineSize: 0,
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-s)',
    '@media (min-width: 48rem)': {
      position: 'sticky',
      insetBlockStart: 'var(--space-xl)',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      alignSelf: 'flex-start',
      flexShrink: 0,
      /* 宽度按内容自适应，避免固定宽度在文字右侧留下空白、把 divider 挤偏。 */
      inlineSize: 'fit-content',
      maxInlineSize: '20%',
      /* 撑满视口可用的这一列，按钮才会落到与顶部菜单对称的底部。 */
      blockSize: 'calc(100dvh - 2 * var(--space-xl))',
      gap: 'var(--space-s)',
    },
  },
  railMenu: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--space-s) var(--space-m)',
    '@media (min-width: 48rem)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 'var(--space-s)',
    },
  },
  railLink: {
    color: 'var(--color-fg-subtle)',
    transitionProperty: 'color',
    transitionDuration: '160ms',
    ':hover': {
      color: 'var(--color-fg)',
    },
  },
  railLinkActive: {
    color: 'var(--color-fg)',
  },
  /*
   * 导航与正文之间的竖线。独立成一个元素并撑满整页高度：
   * 从顶部一直连到底，不会在列表中途断开（否则看着像网格线消失）。
   * 短页面由 rail 的视口高度下限兜底，线也不会短得只剩一截。
   */
  divider: {
    display: 'none',
    '@media (min-width: 48rem)': {
      display: 'block',
      alignSelf: 'stretch',
      flexShrink: 0,
      inlineSize: 1,
      backgroundColor: 'var(--color-border)',
    },
  },
  toggle: {
    display: 'grid',
    placeItems: 'center',
    inlineSize: '2.25rem',
    blockSize: '2.25rem',
    borderRadius: 'var(--radius-full)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    color: 'var(--color-fg-muted)',
    backgroundColor: 'var(--color-bg-elevated)',
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: '160ms',
  },
  main: {
    flexGrow: 1,
    minInlineSize: 0,
    /* 窄屏没有竖线，用一条横线分开导航与正文。 */
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'var(--color-border)',
    paddingBlockStart: 'var(--space-m)',
    '@media (min-width: 48rem)': {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      /* 正文列到此为止；多出来的宽度交给整组居中，而不是把正文拉长。 */
      maxInlineSize: 'var(--content-max)',
      borderBlockStartWidth: 0,
      paddingBlockStart: 0,
    },
  },
})

export function App() {
  const path = useSyncExternalStore(routeStore.subscribe, routeStore.get)
  const preference = useSyncExternalStore(themeStore.subscribe, themeStore.get)
  // 首页与文章列表已合并：/ 直接就是列表，/blog 作为老链接的别名保留。
  const home = path === '/' || path === '/blog'
  const slug = matchSegment('/blog/:slug', path)
  const post = slug ? postBySlug(slug) : undefined
  // 当前所在的栏目：文章列表和文章详情都算「文章」，用于导航项的高亮。
  const inPosts = home || Boolean(post)
  const inProjects = path === '/projects'
  const inAbout = path === '/about'
  const pageRoute: PageRoute = home
    ? 'blog'
    : post && slug
      ? 'post'
      : inProjects
        ? 'projects'
        : inAbout
          ? 'about'
          : 'notFound'
  const [renderPage, setRenderPage] = useState<PageRenderer | null>(null)

  useEffect(() => {
    let cancelled = false
    setRenderPage(null)
    void pageLoaders[pageRoute]().then((renderer) => {
      if (!cancelled) setRenderPage(() => renderer)
    })
    return () => {
      cancelled = true
    }
  }, [pageRoute])

  let page = renderPage ? renderPage(slug) : <p>正在载入…</p>
  let title = SITE_TITLE
  let description = SITE_DESCRIPTION
  if (home) {
    description = '写点关于前端工程、渲染管线与系统设计的笔记。'
  } else if (post && slug) {
    title = post.title
    description = post.summary
  } else if (path === '/projects') {
    title = '项目'
    description = '做过的一些东西。'
  } else if (path === '/about') {
    title = '关于'
    description = '程序员，对程序开发、交互设计和创意编程有广泛兴趣。'
  } else {
    title = '页面不存在'
    description = '链接可能失效了，或者这个想法还没写。'
  }

  /*
   * 路由提交后、浏览器绘制前把滚动位置放回去：从文章返回列表要落回原来的位置，
   * 又不能先画一帧顶部再补跳，所以放在 layout 阶段（此时 DOM 已是新页面）。
   */
  useLayoutEffect(() => {
    const y = takePendingScrollY()
    if (y === null) return
    window.scrollTo({ top: y, behavior: 'instant' })
    // 文章正文是异步载入的，刚回来时页面还不够高，位置会被夹住。等它长起来再放一次；
    // 只跟一小段时间，免得这之后用户自己滚动还被拽回去。
    if (window.scrollY === y) return
    const deadline = performance.now() + 1000
    let raf = requestAnimationFrame(function follow() {
      window.scrollTo({ top: y, behavior: 'instant' })
      if (window.scrollY !== y && performance.now() < deadline) raf = requestAnimationFrame(follow)
    })
    return () => cancelAnimationFrame(raf)
  }, [path])

  // 给文章首图提前发起请求，避免必须等 Markdown 正文解析后浏览器才发现 LCP 图片。
  useLayoutEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>('link[data-post-image-preload]')
    if (existing?.getAttribute('href') === post?.image) return
    existing?.remove()
    if (!post?.image) return
    const preload = document.createElement('link')
    preload.rel = 'preload'
    preload.as = 'image'
    preload.href = post.image
    preload.setAttribute('fetchpriority', 'high')
    preload.dataset.postImagePreload = ''
    document.head.append(preload)
    return () => preload.remove()
  }, [path, post?.image])

  // 客户端路由切换后同步 head，保证分享/收藏拿到的是当前页面。
  // 列表页有两种写法（/ 与 /blog），canonical 统一收敛到 /。
  useEffect(() => {
    syncDocumentMeta(title, description, home ? '/' : path)
  }, [path, home, title, description])

  // 偏好为「跟随系统」时，系统在明暗之间切换要即时反映到页面。
  useEffect(() => watchSystemTheme(), [])

  return (
    <div {...stylex.props(s.page)}>
      <nav {...stylex.props(s.rail)} aria-label="主导航">
        <div {...stylex.props(s.railMenu)}>
          <Link
            href="/"
            aria-current={inPosts ? 'page' : undefined}
            class={stylex.props(s.railLink, inPosts && s.railLinkActive).className}
          >
            想法
          </Link>
          <Link
            href="/projects"
            aria-current={inProjects ? 'page' : undefined}
            class={stylex.props(s.railLink, inProjects && s.railLinkActive).className}
          >
            项目
          </Link>
          <Link
            href="/about"
            aria-current={inAbout ? 'page' : undefined}
            class={stylex.props(s.railLink, inAbout && s.railLinkActive).className}
          >
            关于
          </Link>
        </div>
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={THEME_LABELS[preference]}
          {...stylex.props(s.toggle)}
        >
          <ThemeIcon theme={preference} />
        </button>
      </nav>
      <div {...stylex.props(s.divider)} aria-hidden="true" />
      <main {...stylex.props(s.main)}>{page}</main>
    </div>
  )
}
