import type {
  BlockNode,
  BlockParseContext,
  InlineNode,
  InlineParseContext,
  InlineParseResult,
  MarkdownExtension,
} from '@tanstack/markdown'

/** 把 TeX 源码渲染成 HTML 的函数，由 KaTeX 适配层注入。 */
export type MathRenderer = (tex: string, displayMode: boolean) => string

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (char) => (char === '&' ? '&amp;' : char === '<' ? '&lt;' : char === '>' ? '&gt;' : '&quot;'),
  )
}

/** 正文里是否可能出现公式：`$$…$$` 或成对的 `$…$`。用来决定要不要按需加载 KaTeX。 */
export function hasMath(source: string): boolean {
  return /\$\$/.test(source) || /\$[^\s$][^$]*\$/.test(source)
}

/**
 * TanStack Markdown 的公式扩展。
 *
 * 解析阶段把 `$$…$$` / `$…$` 摘出来，产出一个 HTML 节点，交给 octane 适配器
 * 的 `allowHtml` 分支渲染。渲染器是注入的，这样没用到公式的文章不必下载 KaTeX。
 */
export function createMathExtension(render: MathRenderer | null): MarkdownExtension {
  const toHtml = (tex: string, displayMode: boolean) =>
    render ? render(tex, displayMode) : `<code>${escapeHtml(tex)}</code>`

  function parseBlock(context: BlockParseContext): BlockNode | undefined {
    const opening = /^ {0,3}\$\$(.*)$/.exec(context.lines[context.index] ?? '')
    if (!opening) return undefined

    const rest = opening[1]
    const sameLine = rest.indexOf('$$')
    if (sameLine !== -1) {
      context.consume(1)
      return { type: 'html', value: toHtml(rest.slice(0, sameLine).trim(), true) }
    }

    const parts = rest.trim() ? [rest] : []
    let cursor = context.index + 1
    for (; cursor < context.lines.length; cursor++) {
      const line = context.lines[cursor] ?? ''
      const close = line.indexOf('$$')
      if (close !== -1) {
        parts.push(line.slice(0, close))
        cursor++
        break
      }
      parts.push(line)
    }

    context.consume(cursor - context.index)
    return { type: 'html', value: toHtml(parts.join('\n').trim(), true) }
  }

  function parseInline(context: InlineParseContext): InlineParseResult | undefined {
    const { source, index } = context
    const first = source[index + 1]
    // 开头的 `$` 后面必须紧跟非空白字符，否则当成普通文本（避开 $100 这类写法）。
    if (first === undefined || first === '$' || first === ' ' || first === '\n') return undefined

    let cursor = index + 1
    while (cursor < source.length) {
      const char = source[cursor]
      if (char === '\n') return undefined
      if (char === '$') {
        if (source[cursor - 1] === ' ') return undefined
        const node: InlineNode = {
          type: 'inlineHtml',
          value: toHtml(source.slice(index + 1, cursor), false),
        }
        return { node, length: cursor + 1 - index }
      }
      cursor++
    }
    return undefined
  }

  return {
    name: 'katex-math',
    parseBlock,
    inlineParser: { markers: '$', parse: parseInline },
  }
}
