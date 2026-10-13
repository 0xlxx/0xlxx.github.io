/*
 * 正文探测。放在独立模块里，让 post 路由可以同步判断「要不要渲染器」，
 * 又不把 KaTeX / highlight.js 拉进主包——它们只在真的用到时才 import()。
 */

/** 是否含公式：`$$…$$` 或成对的 `$…$`。 */
export function hasMath(source: string): boolean {
  return /\$\$/.test(source) || /\$[^\s$][^$]*\$/.test(source)
}

/** 是否含围栏代码块。 */
export function hasCode(source: string): boolean {
  return /^ {0,3}(```|~~~)/m.test(source)
}
