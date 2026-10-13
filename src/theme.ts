import { createStore } from './store'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/**
 * 用户偏好：先看 localStorage，再退回系统设置。
 * 这段取值逻辑与 index.html 的内联脚本是同一套——那份负责首帧就定好主题，避免闪一下。
 */
function readPreference(): Theme {
  if (typeof document === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // 隐私模式读不到 localStorage，按系统偏好走。
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 用户偏好本身，不等于当前生效的主题：首页恒为深色，由 App 强制写 'dark'。
 * 主题按钮据此显示状态，所以这里存的必须是偏好而不是实际生效值。
 */
export const themeStore = createStore<Theme>(readPreference())

/** 把生效主题写到 <html>，tokens.css 里 `html[data-theme='dark']` 那套变量据此覆盖。 */
export function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next
}

export function setTheme(next: Theme): void {
  themeStore.set(next)
  if (typeof document === 'undefined') return
  applyTheme(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // 隐私模式或存储被禁用时，本次会话内主题依然生效。
  }
}

export function toggleTheme(): void {
  setTheme(themeStore.get() === 'dark' ? 'light' : 'dark')
}
