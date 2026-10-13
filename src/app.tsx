import * as stylex from '@octanejs/stylex'
import { useEffect, useSyncExternalStore } from 'octane'
import { Link } from './components/link'
import { postBySlug } from './content/posts'
import { syncDocumentMeta } from './head'
import { matchSegment, routeStore } from './router'
import { SITE_DESCRIPTION, SITE_TITLE } from './site'
import { themeStore, toggleTheme } from './theme'
import { Home } from './routes/home'
import { Blog } from './routes/blog'
import { Post } from './routes/post'
import { About } from './routes/about'
import { NotFound } from './routes/not-found'

const s = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minBlockSize: '100dvh',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-fg)',
  },
  header: {
    /* 自身作为查询容器：导航据此适配，而不是跟着 <640px 之类的设备断点走。 */
    containerName: 'site-header',
    containerType: 'inline-size',
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-xs) var(--space-m)',
    paddingBlock: 'var(--space-s)',
    paddingInline: 'var(--gutter)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
    backgroundColor: 'color-mix(in oklab, var(--color-bg) 82%, transparent)',
    backdropFilter: 'blur(14px) saturate(1.4)',
  },
  wordmark: {
    /* 品牌区只占内容宽度，永不参与压缩。 */
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-l)',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 'var(--space-m)',
    marginInlineStart: 'auto',
    minInlineSize: 0,
    /* 品牌 + 导航在最长目标语言下挤不进一行时，让导航整行独占。
       阈值由内容决定（品牌宽度 + 导航标签宽度），不是按某种语言的实测像素写死。 */
    '@container site-header (inline-size < 30rem)': {
      flexBasis: '100%',
      justifyContent: 'space-between',
      marginInlineStart: 0,
    },
  },
  navLink: {
    fontSize: 'var(--text-s)',
    color: 'var(--color-fg-muted)',
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
    inlineSize: '100%',
    maxInlineSize: 'var(--page-max)',
    marginInline: 'auto',
    paddingInline: 'var(--gutter)',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-s)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: 'var(--space-l)',
    paddingInline: 'var(--gutter)',
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'var(--color-border)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-fg-subtle)',
  },
})

export function App() {
  const path = useSyncExternalStore(routeStore.subscribe, routeStore.get)
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.get)
  const slug = matchSegment('/blog/:slug', path)
  const post = slug ? postBySlug(slug) : undefined

  let page
  let title = SITE_TITLE
  let description = SITE_DESCRIPTION
  if (path === '/') {
    page = <Home />
    description = '写点关于前端工程、渲染管线与系统设计的笔记。'
  } else if (path === '/blog') {
    page = <Blog />
    title = '文章'
    description = '全部文章列表。'
  } else if (post && slug) {
    page = <Post slug={slug} />
    title = post.title
    description = post.summary
  } else if (path === '/about') {
    page = <About />
    title = '关于'
    description = '关于 Bjorn Li。'
  } else {
    page = <NotFound />
    title = '页面不存在'
    description = '链接可能失效了，或者这篇文章还没写。'
  }

  // 客户端路由切换后同步 head，保证分享/收藏拿到的是当前页面。
  useEffect(() => {
    syncDocumentMeta(title, description, path)
  }, [path, title, description])

  return (
    <div {...stylex.props(s.page)}>
      <header {...stylex.props(s.header)}>
        <Link href="/" class={stylex.props(s.wordmark).className}>
          Bjorn Li
        </Link>
        <nav {...stylex.props(s.nav)} aria-label="主导航">
          <Link href="/blog" class={stylex.props(s.navLink).className}>
            文章
          </Link>
          <Link href="/about" class={stylex.props(s.navLink).className}>
            关于
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
            {...stylex.props(s.toggle)}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </header>
      <main {...stylex.props(s.main)}>{page}</main>
      <footer {...stylex.props(s.footer)}>
        <span>© 2026 Bjorn Li</span>
        <span>用 octane 与 StyleX 构建</span>
      </footer>
    </div>
  )
}
