import * as stylex from '@octanejs/stylex'
import { useEffect, useRef } from 'octane'
import type { SunBackgroundHandle } from '../shaders/sun-background'

const s = stylex.create({
  canvas: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    inlineSize: '100%',
    blockSize: '100%',
    pointerEvents: 'none',
  },
})

/**
 * 首页背景：一块铺满视口的 canvas，内容靠 z-index 压在它上面。
 * vgpu 与着色器都按需加载，不进主包。
 */
export function SunBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    // 没有 WebGPU（Safari 16 之前、Firefox、部分 Linux 驱动）就当这块背景不存在，
    // 页面用自己的纯色底。
    if (!canvas || !navigator.gpu) return

    let handle: SunBackgroundHandle | null = null
    let disposed = false

    void (async () => {
      try {
        const { mountSunBackground } = await import('../shaders/sun-background')
        if (disposed) return
        handle = await mountSunBackground(canvas)
      } catch (error) {
        // 拿不到适配器、驱动被拉黑、WGSL 编译失败……都只该让背景退回纯色，
        // 不该把整个首页拖垮。
        console.warn('[sun] 背景着色器没能启动', error)
      }
    })()

    return () => {
      disposed = true
      handle?.stop()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" {...stylex.props(s.canvas)} />
}
