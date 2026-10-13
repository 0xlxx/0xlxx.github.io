import * as stylex from '@octanejs/stylex'
import { Link } from '../components/link'
import { postsByYear } from '../content/posts'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
    paddingBlockStart: 'var(--space-xl)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 500,
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
    color: 'var(--color-fg-subtle)',
    letterSpacing: '0.08em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  post: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 'var(--space-xs) var(--space-m)',
    paddingBlock: 'var(--space-m)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
  },
  day: {
    flex: '0 0 auto',
    minInlineSize: '3.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-fg-subtle)',
  },
  postBody: {
    display: 'grid',
    flex: '1 1 18rem',
    gap: 'var(--space-2xs)',
  },
  postTitle: {
    fontSize: 'var(--text-l)',
    fontWeight: 500,
    lineHeight: 1.4,
    textWrap: 'balance',
  },
  postSummary: {
    fontSize: 'var(--text-s)',
    color: 'var(--color-fg-muted)',
    maxInlineSize: '58ch',
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
      <h1 {...stylex.props(s.title)}>文章</h1>
      {postsByYear().map(([year, items]) => (
        <section {...stylex.props(s.year)}>
          <h2 {...stylex.props(s.yearLabel)}>{year}</h2>
          <div {...stylex.props(s.list)}>
            {items.map((post) => (
              <Link href={`/blog/${post.slug}`} class={stylex.props(s.post).className}>
                <span {...stylex.props(s.day)}>{formatDay(post.date)}</span>
                <span {...stylex.props(s.postBody)}>
                  <span {...stylex.props(s.postTitle)}>{post.title}</span>
                  <span {...stylex.props(s.postSummary)}>{post.summary}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
