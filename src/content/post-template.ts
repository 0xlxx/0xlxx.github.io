/**
 * 新文章的模板与文件名规则。CLI 脚手架（`bun run new`）和 Obsidian 插件
 * 共用这一份，保证两边生成的文件结构一致。
 */

/** 文件名里保留中文，去掉路径分隔符和链接语法会碰到的字符。 */
export function postFileName(title: string): string {
  const name = title
    .replace(/[\\/:*?"<>|#^[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .slice(0, 80)
  return `${name || '未命名'}.md`
}

/**
 * frontmatter 的值用单引号包起来；标题里出现的单引号换成弯引号，
 * 避免把 YAML 提前结束（站点只做最简解析，不处理转义）。
 */
function quoted(value: string): string {
  return `'${value.replace(/'/g, '’')}'`
}

export function postFrontmatter(input: { title: string; summary: string; date: string }): string {
  return `---\ntitle: ${quoted(input.title)}\npublishedAt: ${quoted(input.date)}\nsummary: ${quoted(input.summary)}\n---\n`
}

/** 本地日期，格式与文章 frontmatter 一致。 */
export function today(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** 从文件所在目录到目标文件的相对路径（都是 vault 内路径，无前导斜杠）。 */
export function relativeVaultPath(fromFile: string, toPath: string): string {
  const from = fromFile.split('/').slice(0, -1)
  const to = toPath.split('/')
  let shared = 0
  while (shared < from.length && shared < to.length - 1 && from[shared] === to[shared]) shared++
  return [...Array<string>(from.length - shared).fill('..'), ...to.slice(shared)].join('/')
}

/** 图片目录与文件名用的 slug：去掉空白和路径字符，保留中文。 */
export function imageSlug(name: string): string {
  return (
    name
      .replace(/[\\/:*?"<>|#^[\]]/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'post'
  )
}
