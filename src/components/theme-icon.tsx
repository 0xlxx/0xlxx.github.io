import * as stylex from '@octanejs/stylex'
import type { ThemePreference } from '../theme'

const s = stylex.create({
  icon: {
    display: 'block',
    inlineSize: 'var(--icon-size)',
    blockSize: 'var(--icon-size)',
  },
})

/*
 * 24×24 线性图标，形状与 Lucide 的 sun / moon / monitor 一致：描边走 currentColor，
 * 尺寸由 token 决定，不再用会显得偏小的文字字形（☀ / ☾）。
 * 图标指向「当前偏好」：light 太阳、dark 月亮、system 显示器。
 */
export function ThemeIcon(props: { theme: ThemePreference }) {
  const cls = stylex.props(s.icon).className
  const common = {
    viewBox: '0 0 24 24',
    class: cls,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  } as const

  if (props.theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    )
  }
  if (props.theme === 'system') {
    return (
      <svg {...common}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
