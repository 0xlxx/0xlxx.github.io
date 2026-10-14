import * as stylex from '@octanejs/stylex'
import { Link } from '../components/link'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
    paddingBlockStart: 'var(--space-2xl)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  code: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.14em',
    color: 'var(--color-fg-subtle)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  body: {
    color: 'var(--color-fg-muted)',
    maxInlineSize: '46ch',
  },
  link: {
    color: 'var(--color-accent)',
    fontSize: 'var(--text-s)',
  },
})

export function NotFound() {
  return (
    <div {...stylex.props(s.root)}>
      <p {...stylex.props(s.code)}>404</p>
      <h1 {...stylex.props(s.title)}>这里什么也没有</h1>
      <p {...stylex.props(s.body)}>链接可能失效了，或者这个想法还没写。</p>
      <Link href="/" class={stylex.props(s.link).className}>
        ← 回到首页
      </Link>
    </div>
  )
}
