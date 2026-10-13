import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { MathRenderer } from './math'

/**
 * KaTeX 适配层。单独成模块，文章正文按需 `import()`，让 KaTeX 的
 * 解析器只进公式相关文章的 chunk，不拖累首屏。
 */
export const renderMath: MathRenderer = (tex, displayMode) =>
  katex.renderToString(tex, { displayMode, throwOnError: false })
