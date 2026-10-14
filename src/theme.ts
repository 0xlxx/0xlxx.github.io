import { createStore } from './store'

/** 真正生效的主题，写到 <html> 上供 tokens.css 覆盖变量。 */
export type Theme = 'light' | 'dark'
/** 用户可选的主题偏好：显式指定明暗，或跟随系统。 */
export type ThemePreference = Theme | 'system'

const STORAGE_KEY = 'theme'
/** 单按钮切换三种偏好时的循环顺序。 */
const PREFERENCES: ThemePreference[] = ['light', 'dark', 'system']

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 用户偏好：先看 localStorage，取不到就跟随系统。
 * 这段取值逻辑与 index.html 的内联脚本是同一套——那份负责首帧就定好主题，避免闪一下。
 */
function readPreference(): ThemePreference {
  if (typeof document === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // 隐私模式读不到 localStorage，按系统偏好走。
  }
  return 'system'
}

/** 把偏好解析成真正生效的主题。 */
export function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? systemTheme() : preference
}

/** 用户主题偏好，主题按钮据此显示状态。 */
export const themeStore = createStore<ThemePreference>(readPreference())

/** 把生效主题写到 <html>，tokens.css 里 `html[data-theme='dark']` 那套变量据此覆盖。 */
export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference)
}

export function setTheme(preference: ThemePreference): void {
  themeStore.set(preference)
  if (typeof document === 'undefined') return
  applyTheme(preference)
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // 隐私模式或存储被禁用时，本次会话内主题依然生效。
  }
}

/** 按 light → dark → system 循环，供单个按钮切换三种偏好。 */
export function cycleTheme(): void {
  const current = themeStore.get()
  setTheme(PREFERENCES[(PREFERENCES.indexOf(current) + 1) % PREFERENCES.length])
}

/**
 * 跟随系统时，系统在明暗之间切换要实时反映到页面。
 * 返回取消订阅函数，交给调用方的 effect 清理。
 */
export function watchSystemTheme(): () => void {
  const query = matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (themeStore.get() === 'system') applyTheme('system')
  }
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
