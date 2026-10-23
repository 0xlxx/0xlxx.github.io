/**
 * 把构建好的插件装进一个 Obsidian vault：
 *   bun run plugin:install [vault 路径]
 *
 * 默认把当前仓库当作 vault（省略参数时），需要 `.obsidian/` 已存在。
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// 没传参数时优先装进 content/（推荐的写作 vault），否则装进当前目录。
const fallback = existsSync(resolve(process.cwd(), 'content/.obsidian'))
  ? resolve(process.cwd(), 'content')
  : process.cwd()
const vault = resolve(process.argv[2] ?? fallback)
if (!existsSync(resolve(vault, '.obsidian'))) {
  console.error(`不是 Obsidian vault（缺少 .obsidian/）：${vault}`)
  process.exit(1)
}

const source = resolve(process.cwd(), 'obsidian-plugin')
const target = resolve(vault, '.obsidian/plugins/blog-author')
mkdirSync(target, { recursive: true })

for (const file of ['manifest.json', 'main.js']) {
  const from = resolve(source, file)
  if (!existsSync(from)) {
    console.error(`缺少 ${from}，先运行 bun run plugin:build`)
    process.exit(1)
  }
  copyFileSync(from, resolve(target, file))
}

console.log(`已安装到 ${target}`)
console.log('在 Obsidian 设置 → 第三方插件里启用 Blog Author。')
