import * as stylex from '@octanejs/stylex'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-l)',
    paddingBlockEnd: 'var(--space-2xl)',
    maxInlineSize: 'var(--measure)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  /* 字号与「项目 / 想法」的内容一致（text-base），避免单开一档显得更重。 */
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--leading-body)',
    color: 'var(--color-fg-muted)',
    textWrap: 'pretty',
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
        <p>程序员，对程序开发、交互设计和创意编程有广泛兴趣。</p>
        <p>
          GitHub：
          <a
            class={stylex.props(s.link).className}
            href="https://github.com/0xlxx"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/0xlxx
          </a>
        </p>
      </div>
    </div>
  )
}
