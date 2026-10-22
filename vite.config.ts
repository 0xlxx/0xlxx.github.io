import { defineConfig } from 'vite'
import { octane } from '@octanejs/vite-plugin'
import { stylex } from '@octanejs/stylex/vite'
import { knownAttributeSpreads } from '@octanejs/stylex/compiler/contract'
import { posts } from './build/posts-plugin.ts'
import { imageDimensions } from './build/image-metadata-plugin.ts'
import { siteMetadata } from './build/site-plugin.ts'

export default defineConfig({
  /*
   * 部署基路径：Cloudflare Workers 挂在根，GitHub Pages 的项目页挂在 `/blog/`。
   * 只有构建 GitHub Pages 版本时才传 `SITE_BASE=/blog/`，见 `build:pages`。
   */
  base: process.env.SITE_BASE || '/',
  plugins: [
    {
      name: 'blog:katex-font-display',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/katex/dist/katex.min.css')) return null
        return code.replaceAll('font-display:block', 'font-display:swap')
      },
    },
    octane({ knownAttributeSpreads }),
    stylex({ useCSSLayers: true }),
    posts(),
    imageDimensions(),
    siteMetadata(),
  ],
})
