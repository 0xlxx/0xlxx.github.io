import * as stylex from '@octanejs/stylex'
import { Fragment, createElement, useEffect, useMemo, useState } from 'octane'
import type { CodeHighlighter } from '@tanstack/markdown'
import { renderMarkdownOctane } from '@tanstack/markdown/octane'
import { Link } from '../components/link'
import { postBySlug } from '../content/posts'
import { imageDimensions } from 'virtual:image-dimensions'
import { hasCode, hasMath } from '../markdown/detect'
import { createMathExtension, type MathRenderer } from '../markdown/math'
import { NotFound } from './not-found'

const s = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xl)',
    /* 列宽与居中由外层 main 决定（左侧导航 + 竖线 + 正文列），这里只管正文自身的排布。 */
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

/*
 * 正文图片：长文章里图片常常远在首屏之外，默认懒加载 + 异步解码，
 * 免得它们一上来就和正文抢带宽、拖慢 LCP。
 */
function PostImage(props: { src?: string; alt?: string; title?: string; eager?: boolean }) {
  const dimensions = props.src ? imageDimensions[props.src] : undefined
  return (
    <img
      src={props.src}
      alt={props.alt ?? ''}
      width={dimensions?.width}
      height={dimensions?.height}
      loading={props.eager ? 'eager' : 'lazy'}
      decoding="async"
      {...(props.eager ? { fetchpriority: 'high' } : {})}
      {...(props.title ? { title: props.title } : {})}
    />
  )
}

export function Post(props: { slug: string }) {
  const post = postBySlug(props.slug)
  const [state, setState] = useState<{
    text: string
    render: MathRenderer | null
    highlight: CodeHighlighter | null
  } | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  // 显式依赖 props.slug：切到另一篇文章时重新取源码。
  useEffect(() => {
    if (!post) return
    let cancelled = false
    setState(null)
    setLoadFailed(false)
    void (async () => {
      let text: string
      try {
        text = await post.load()
      } catch {
        if (!cancelled) setLoadFailed(true)
        return
      }
      if (cancelled) return

      // 正文先用轻量渲染结果呈现，避免等待 KaTeX 的动态 CSS 才显示首屏内容。
      setState({ text, render: null, highlight: null })

      // 只有正文用到时才拉渲染器，并行下载，缩短功能模块的关键请求链。
      const [render, highlight] = await Promise.all([
        hasMath(text) ? import('../markdown/katex').then((module) => module.renderMath) : null,
        hasCode(text)
          ? import('../markdown/highlight').then((module) => module.highlightCode)
          : null,
      ])
      if (!cancelled) setState({ text, render, highlight })
    })().catch(() => {
      // 基础正文已经显示；增强渲染模块失败时保留它，不回退成永久 loading。
    })
    return () => {
      cancelled = true
    }
  }, [props.slug])

  /*
   * 用 renderMarkdownOctane 而不是 <Markdown> 组件：octane 传给组件的 children
   * 是数组，而适配器只接受字符串。（同一个解析器，只是入口不同。）
   * 公式扩展产出 HTML 节点，所以需要打开 allowHtml。
   */
  const body = useMemo(() => {
    if (!state) return null
    const nodes = renderMarkdownOctane(state.text, {
      allowHtml: true,
      extensions: [createMathExtension(state.render)],
      components: {
        img: (imageProps) => (
          <PostImage {...imageProps} eager={imageProps.src === post?.image} />
        ),
      },
      ...(state.highlight ? { highlighter: state.highlight } : {}),
    })
    return createElement(Fragment, null, ...nodes)
  }, [state, post?.image])

  if (!post) return <NotFound />

  return (
    <article {...stylex.props(s.root)}>
      <header {...stylex.props(s.header)}>
        <Link href="/blog" class={stylex.props(s.back).className}>
          ← 想法
        </Link>
        <h1 {...stylex.props(s.title)}>{post.title}</h1>
        <p {...stylex.props(s.meta)}>
          {post.date} · {post.summary}
        </p>
      </header>
      <div class="prose">
        {body ?? (
          <p {...stylex.props(s.pending)}>
            {loadFailed ? '文章载入失败，请刷新后重试。' : '正在载入…'}
          </p>
        )}
      </div>
    </article>
  )
}
