/**
 * 图片从 `content/images` 来，但站点里仍然挂在 `/images/*` 下。
 *
 * 这样 Obsidian vault 可以只包含 `content/`（文章 + 图片），代码留在 vault 外面；
 * 开发时用中间件直接把请求映射过去，构建时再把目录拷进 `dist/images`。
 */
import { createReadStream, cpSync, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'

const MIME: Record<string, string> = {
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

export function contentImages(dir = 'content/images'): Plugin {
  const source = resolve(process.cwd(), dir)
  let outDir = resolve(process.cwd(), 'dist')
  let isBuild = false

  return {
    name: 'blog:content-images',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      isBuild = config.command === 'build'
    },
    configureServer(server) {
      server.middlewares.use('/images', (request, response, next) => {
        const pathname = decodeURIComponent((request.url ?? '').split('?')[0] ?? '/')
        const file = resolve(source, `.${pathname}`)
        // 只允许读 content/images 里的文件，挡住 ../ 之类的路径穿越。
        if (!file.startsWith(source + sep)) return next()

        const info = existsSync(file) ? statSync(file) : null
        if (!info?.isFile()) return next()

        response.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream')
        response.setHeader('Cache-Control', 'no-cache')
        createReadStream(file).pipe(response)
      })
    },
    closeBundle() {
      if (!isBuild) return
      cpSync(source, resolve(outDir, 'images'), { recursive: true })
    },
  }
}
