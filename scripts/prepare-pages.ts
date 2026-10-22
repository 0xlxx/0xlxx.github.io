/**
 * GitHub Pages 不支持 SPA 的服务端回退：未命中的路径会返回 404.html。
 * 把构建好的 index.html 复制一份当 404 页，客户端路由才能接管深链接
 * （例如 `/blog/<slug>`）。
 */
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')

copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
// 关掉 Jekyll：产物里有下划线开头的文件，不想被它的处理规则动到。
writeFileSync(resolve(dist, '.nojekyll'), '')

console.log('pages: wrote dist/404.html and dist/.nojekyll')
