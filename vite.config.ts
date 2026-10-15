import { defineConfig } from 'vite'
import { octane } from '@octanejs/vite-plugin'
import { stylex } from '@octanejs/stylex/vite'
import { knownAttributeSpreads } from '@octanejs/stylex/compiler/contract'
import { posts } from './build/posts-plugin.ts'
import { imageDimensions } from './build/image-metadata-plugin.ts'
import { siteMetadata } from './build/site-plugin.ts'

export default defineConfig({
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
