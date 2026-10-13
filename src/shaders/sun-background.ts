import { clock, effect, frame, frameLoop, init, surface, type Frame } from 'vgpu'
import sunSource from './sun.wgsl'

export interface SunBackgroundHandle {
  stop(): void
}

/**
 * 把「太阳」着色器挂到 canvas 上。
 *
 * 返回句柄而不是自己管生命周期：WebGPU 设备很贵，路由切走或热更新时必须显式回收，
 * 否则每次都会多留一个 device 和一条渲染循环。
 */
export async function mountSunBackground(canvas: HTMLCanvasElement): Promise<SunBackgroundHandle> {
  const gpu = await init()
  // 像素比封顶 1.5：这是老站上试出来的折中，再高就开始吃 GPU 了。
  const view = surface(gpu, canvas, { dpr: [1, 1.5] })
  const sun = effect(gpu, sunSource, {
    label: 'sun',
    set: { params: { time: 0, resolution: [view.size[0], view.size[1]] } },
  })

  // 订阅时会立刻回调一次，第一帧的尺寸也是从这里来的。
  view.onResize(({ width, height }) => {
    sun.set({ params: { resolution: [width, height] } })
  })

  // 这个背景是纯装饰，跟着系统的「减少动态效果」走：不播动画，只留一张静帧。
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  const render = (currentFrame: Frame) => {
    sun.set({ params: { time: still ? 0 : clock(gpu).time } })
    // 着色器本来就把整屏铺满，再让 GPU 清一遍屏只是白写一遍带宽。
    currentFrame.pass({ target: view, clear: false }, sun)
  }

  const loop = still ? null : frameLoop(gpu, render)
  if (still) frame(gpu, render)

  return {
    stop() {
      loop?.stop()
      gpu.dispose()
    },
  }
}
