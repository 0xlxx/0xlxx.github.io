import * as stylex from '@octanejs/stylex'
import { Fragment, createElement, useEffect, useMemo, useState } from 'octane'
import { renderMarkdownOctane } from '@tanstack/markdown/octane'
import { Link } from '../components/link'
import { postBySlug } from '../content/posts'
import { NotFound } from './not-found'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
    paddingBlockStart: 'var(--space-xl)',
    paddingBlockEnd: 'var(--space-2xl)',
  },
  header: {
    display: 'grid',
    gap: 'var(--space-s)',
    paddingBlockEnd: 'var(--space-m)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
  },
  back: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.08em',
    color: 'var(--color-fg-subtle)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    textWrap: 'balance',
    maxInlineSize: '24ch',
  },
  meta: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-fg-subtle)',
  },
  pending: {
    color: 'var(--color-fg-subtle)',
    fontSize: 'var(--text-s)',
  },
})

export function Post(props: { slug: string }) {
  const post = postBySlug(props.slug)
  const [content, setContent] = useState<string | null>(null)

  // 显式依赖 props.slug：切到另一篇文章时重新取源码。
  useEffect(() => {
    if (!post) return
    let cancelled = false
    setContent(null)
    post.load().then((text) => {
      if (!cancelled) setContent(text)
    })
    return () => {
      cancelled = true
    }
  }, [props.slug])

  /*
   * 用 renderMarkdownOctane 而不是 <Markdown> 组件：octane 传给组件的 children
   * 是数组，而适配器只接受字符串。（同一个解析器，只是入口不同。）
   */
  const body = useMemo(
    () => (content === null ? null : createElement(Fragment, null, ...renderMarkdownOctane(content))),
    [content],
  )

  if (!post) return <NotFound />

  return (
    <article {...stylex.props(s.root)}>
      <header {...stylex.props(s.header)}>
        <Link href="/blog" class={stylex.props(s.back).className}>
          ← 文章列表
        </Link>
        <h1 {...stylex.props(s.title)}>{post.title}</h1>
        <p {...stylex.props(s.meta)}>
          {post.date} · {post.summary}
        </p>
      </header>
      <div class="prose">
        {body ?? <p {...stylex.props(s.pending)}>正在载入…</p>}
      </div>
    </article>
  )
}
