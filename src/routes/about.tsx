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
  /* 图标与描述作为一个整体链接，保持联系方式的视觉连续性。 */
  contact: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      color: 'var(--color-fg)',
    },
  },
  icon: {
    display: 'block',
    flexShrink: 0,
    inlineSize: 'var(--icon-size)',
    blockSize: 'var(--icon-size)',
  },
})

function GithubIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      class={stylex.props(s.icon).className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function About() {
  return (
    <div {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.title)}>关于</h1>
      <div {...stylex.props(s.body)}>
        <p>程序员，对程序开发、交互设计和创意编程有广泛兴趣。</p>
        <a
          {...stylex.props(s.contact)}
          href="https://github.com/0xlxx"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub：0xlxx"
        >
          <GithubIcon />
          <span>0xlxx</span>
        </a>
      </div>
    </div>
  )
}
