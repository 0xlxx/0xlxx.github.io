import * as stylex from '@octanejs/stylex'
import { useSyncExternalStore } from 'octane'
import { Link } from './components/link'
import { matchSegment, routeStore } from './router'
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
    position: 'sticky',
    insetBlockStart: 0,
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-s)',
    paddingBlock: 'var(--space-s)',
    paddingInline: 'var(--gutter)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
    backgroundColor: 'color-mix(in oklab, var(--color-bg) 82%, transparent)',
    backdropFilter: 'blur(14px) saturate(1.4)',
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-l)',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-m)',
    marginInlineStart: 'auto',
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

  let page
  if (path === '/') page = <Home />
  else if (path === '/blog') page = <Blog />
  else if (slug) page = <Post slug={slug} />
  else if (path === '/about') page = <About />
  else page = <NotFound />

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
