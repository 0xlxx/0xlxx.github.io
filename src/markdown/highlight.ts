import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

/** 文章里的 info string → highlight.js 注册名。 */
const ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
  html: 'xml',
  xml: 'xml',
  svg: 'xml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  bash: 'bash',
  json: 'json',
  jsonc: 'json',
  sql: 'sql',
  css: 'css',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (char) => (char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;'))
}

/**
 * TanStack Markdown 的 `highlighter` 钩子是同步的，而 highlight.js 的
 * `highlight()` 正好同步返回 HTML，直接对上。
 */
export function highlightCode(code: string, lang?: string): string {
  const language = lang ? ALIASES[lang.toLowerCase()] : undefined
  if (!language || !hljs.getLanguage(language)) return escapeHtml(code)
  try {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    // 语法有误不该让整篇文章挂掉，退回纯文本。
    return escapeHtml(code)
  }
}
