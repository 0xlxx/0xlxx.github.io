import { defineConfig } from 'vite'
import { octane } from '@octanejs/vite-plugin'
import { stylex } from '@octanejs/stylex/vite'
import { knownAttributeSpreads } from '@octanejs/stylex/compiler/contract'
import { posts } from './build/posts-plugin.ts'
import { siteMetadata } from './build/site-plugin.ts'

export default defineConfig({
  plugins: [
    octane({ knownAttributeSpreads }),
    stylex({ useCSSLayers: true }),
    posts(),
    siteMetadata(),
  ],
})
