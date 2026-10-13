import * as stylex from '@octanejs/stylex'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-l)',
    paddingBlockStart: 'var(--space-xl)',
    paddingBlockEnd: 'var(--space-2xl)',
    maxInlineSize: 'var(--measure)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
    fontSize: 'var(--text-l)',
    color: 'var(--color-fg-muted)',
    lineHeight: 'var(--leading-loose)',
  },
  link: {
    color: 'var(--color-accent)',
  },
})

export function About() {
  return (
    <div {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.title)}>关于</h1>
      <div {...stylex.props(s.body)}>
        <p>
          我是 Bjorn，一名前端工程师。日常关心的是浏览器怎么把代码变成界面，以及怎么让这个过程更快、更清楚。
        </p>
        <p>
          这个博客本身也是一次实验：用 <strong>octane</strong> 写组件、用 <strong>StyleX</strong>{' '}
          管样式、用 <strong>TanStack Markdown</strong> 渲染正文，尽量不加多余的抽象。
        </p>
        <p>
          想聊点什么可以发邮件：
          <a class={stylex.props(s.link).className} href="mailto:hi@bjorn.li">
            hi@bjorn.li
          </a>
        </p>
      </div>
    </div>
  )
}
