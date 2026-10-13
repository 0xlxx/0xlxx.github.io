/// <reference types="vite/client" />
/// <reference types="@vgpu/wgsl/wgsl-types" />

declare module 'virtual:posts' {
  export interface PostMeta {
    /** URL 片段，取自 frontmatter 的 `slug`，缺省用文件名。 */
    slug: string
    title: string
    date: string
    summary: string
    modulePath: string
  }

  export const posts: PostMeta[]
}

/** StyleX 在构建期聚合出的原子样式表，由入口一次性引入。 */
declare module 'virtual:stylex.css'

/** 官方包只带了实现，没有随附 .d.ts。 */
declare module '@octanejs/stylex/vite' {
  export function stylex(options?: {
    include?: RegExp
    importSources?: Array<string | { from: string; as: string }>
    dev?: boolean
    useCSSLayers?: boolean
    unstable_moduleResolution?: Record<string, unknown>
    stylexOptions?: Record<string, unknown>
  }): import('vite').Plugin
}
