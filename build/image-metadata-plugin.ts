import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:image-dimensions'
const RESOLVED_ID = '\0' + VIRTUAL_ID

function pngDimensions(file: string): { width: number; height: number } | null {
  const data = readFileSync(file)
  if (data.toString('ascii', 1, 4) !== 'PNG' || data.length < 24) return null
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

function listPngFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) return listPngFiles(path)
    return entry.isFile() && entry.name.toLowerCase().endsWith('.png') ? [path] : []
  })
}

/** 给 Markdown 图片输出固有宽高，避免懒加载图片占零高度并提前触发下载。 */
export function imageDimensions(): Plugin {
  const imageDir = resolve(process.cwd(), 'content/images')
  return {
    name: 'blog:image-dimensions',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      const dimensions = Object.fromEntries(
        listPngFiles(imageDir).flatMap((file) => {
          const size = pngDimensions(file)
          if (!size) return []
          const relativePath = relative(imageDir, file).split(sep).join('/')
          const url = `/images/${relativePath}`
          const entries: Array<[string, typeof size]> = [[url, size]]
          // 同一张图的 webp/avif 版本复用 PNG 的尺寸，省去再解析一遍。
          for (const extension of ['webp', 'avif']) {
            const imageUrl = url.replace(/\.png$/i, `.${extension}`)
            if (imageUrl !== url && existsSync(resolve(imageDir, relativePath.replace(/\.png$/i, `.${extension}`)))) {
              entries.push([imageUrl, size])
            }
          }
          return entries
        }),
      )
      return `export const imageDimensions = ${JSON.stringify(dimensions)}`
    },
  }
}
