import * as stylex from '@octanejs/stylex'
import { Link } from '../components/link'
import { posts } from '../content/posts'

const s = stylex.create({
  hero: {
    display: 'grid',
    gap: 'var(--space-m)',
    paddingBlockStart: 'var(--space-xl)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-fg-subtle)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: 'var(--text-display)',
    lineHeight: 'var(--leading-tight)',
    letterSpacing: '-0.025em',
    textWrap: 'balance',
    maxInlineSize: '18ch',
  },
  accent: {
    color: 'var(--color-accent)',
  },
  lede: {
    fontSize: 'var(--text-l)',
    color: 'var(--color-fg-muted)',
    maxInlineSize: '46ch',
    textWrap: 'pretty',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  sectionHead: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--space-s)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
    paddingBlockEnd: 'var(--space-s)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-fg-subtle)',
  },
  more: {
    fontSize: 'var(--text-s)',
    color: 'var(--color-accent)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  /* 行内换行而不是固定列宽：容器窄了自然堆叠，无需断点。 */
  item: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 'var(--space-xs) var(--space-m)',
    paddingBlock: 'var(--space-m)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
  },
  date: {
    flex: '0 0 auto',
    minInlineSize: '4.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-fg-subtle)',
  },
  itemBody: {
    display: 'grid',
    flex: '1 1 18rem',
    gap: 'var(--space-2xs)',
  },
  itemTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    lineHeight: 1.3,
    textWrap: 'balance',
  },
  itemSummary: {
    fontSize: 'var(--text-s)',
    color: 'var(--color-fg-muted)',
    maxInlineSize: '58ch',
  },
})

const RECENT = 5

export function Home() {
  const recent = posts.slice(0, RECENT)

  return (
    <div>
      <section {...stylex.props(s.hero)}>
        <p {...stylex.props(s.eyebrow)}>Bjorn Li · 程序员</p>
        <h1 {...stylex.props(s.title)}>
          写点 <span {...stylex.props(s.accent)}>前端工程</span> 与系统设计
        </h1>
        <p {...stylex.props(s.lede)}>
          这里放我在写代码时想明白的事：渲染管线、类型系统、构建工具，以及一些没什么用但很有意思的边角。
        </p>
      </section>

      <section {...stylex.props(s.section)} aria-labelledby="recent-heading">
        <div {...stylex.props(s.sectionHead)}>
          <h2 id="recent-heading" {...stylex.props(s.sectionTitle)}>
            最近更新
          </h2>
          <Link href="/blog" class={stylex.props(s.more).className}>
            全部文章 →
          </Link>
        </div>
        <div {...stylex.props(s.list)}>
          {recent.map((post) => (
            <Link href={`/blog/${post.slug}`} class={stylex.props(s.item).className}>
              <span {...stylex.props(s.date)}>{post.date}</span>
              <span {...stylex.props(s.itemBody)}>
                <span {...stylex.props(s.itemTitle)}>{post.title}</span>
                <span {...stylex.props(s.itemSummary)}>{post.summary}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
