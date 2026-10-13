import { createStore } from './store'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** 主题状态。初始值由 index.html 的内联脚本写好，避免首帧闪烁。 */
export const themeStore = createStore<Theme>(readInitial())

export function setTheme(next: Theme): void {
  themeStore.set(next)
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // 隐私模式或存储被禁用时，本次会话内主题依然生效。
  }
}

export function toggleTheme(): void {
  setTheme(themeStore.get() === 'dark' ? 'light' : 'dark')
}
