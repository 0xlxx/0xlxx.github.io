/**
 * 新建文章脚手架：
 *   bun run new "文章标题" [--summary "一句话摘要"]
 *
 * 只做三件事：按标题生成文件名、写入 frontmatter、打印路径。
 * 文件名规则与 Obsidian 插件共用 `src/content/post-template.ts`。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { postFileName, postFrontmatter, today } from '../src/content/post-template.ts'

const argv = process.argv.slice(2)
const titleParts: string[] = []
let summary = ''

for (let index = 0; index < argv.length; index++) {
  const arg = argv[index]!
  if (arg === '--summary' || arg === '-s') {
    summary = argv[++index] ?? ''
    continue
  }
  titleParts.push(arg)
}

const title = titleParts.join(' ').trim()
if (!title) {
  console.error('用法：bun run new "文章标题" [--summary "一句话摘要"]')
  process.exit(1)
}

const postsDir = resolve('content/posts')
mkdirSync(postsDir, { recursive: true })

const fileName = postFileName(title)
const base = fileName.replace(/\.mdx$/, '')
let file = resolve(postsDir, fileName)
for (let index = 2; existsSync(file); index++) {
  file = resolve(postsDir, `${base}-${index}.mdx`)
}

mkdirSync(dirname(file), { recursive: true })
writeFileSync(file, postFrontmatter({ title, summary, date: today() }))
console.log(`已创建：${file}`)
