import * as stylex from '@octanejs/stylex'
import { Link } from '../components/link'
import { postsByYear } from '../content/posts'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-l)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    /* 页标题与左侧菜单同属一套字阶：约菜单的 1.5 倍，而不是喧宾夺主。 */
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  year: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-m)',
  },
  yearLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-s)',
    /* 提掉 h2 默认的 700——目录里年份只是轻量的分组标签。 */
    fontWeight: 400,
    color: 'var(--color-fg-subtle)',
    letterSpacing: '0.08em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  post: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 0,
    paddingBlock: 'var(--space-s)',
  },
  /*
   * 目录式引导点线：夹在标题与时间之间，占据剩余空白。
   * 自己不带基线，靠「底外边线对齐基线」把点的位置压到文字基线上。
   */
  leader: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'var(--space-m)',
    minInlineSize: 'var(--space-m)',
    alignSelf: 'baseline',
    marginInline: 'var(--space-xs)',
    borderBlockEndWidth: 2,
    borderBlockEndStyle: 'dotted',
    borderBlockEndColor: 'var(--color-fg-subtle)',
  },
  day: {
    flex: '0 0 auto',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-fg-subtle)',
  },
  postTitle: {
    flex: '0 1 auto',
    /* 与菜单、文章标题同用衬线体，字号贴近菜单（text-s），让左右两栏读起来是一套。 */
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    fontWeight: 400,
    minInlineSize: 0,
  },
})

function formatDay(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export function Blog() {
  return (
    <div {...stylex.props(s.root)}>
      <h1 {...stylex.props(s.title)}>想法</h1>
      {postsByYear().map(([year, items]) => (
        <section {...stylex.props(s.year)}>
          <h2 {...stylex.props(s.yearLabel)}>{year}</h2>
          <div {...stylex.props(s.list)}>
            {items.map((post) => (
              <Link href={`/blog/${post.slug}`} class={stylex.props(s.post).className}>
                <span {...stylex.props(s.postTitle)}>{post.title}</span>
                <span {...stylex.props(s.leader)} aria-hidden="true" />
                <span {...stylex.props(s.day)}>{formatDay(post.date)}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
