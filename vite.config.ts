import { defineConfig } from 'vite'
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite'
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
    // .wgsl 交给 vgpu 的加载器：构建期解析 + 反射，运行时拿到的是可直接使用的 ShaderSource。
    wgslVitePlugin(),
  ],
})
