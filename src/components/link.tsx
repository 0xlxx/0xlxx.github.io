import { navigate, prefetchRoute } from '../router'
import { withBase } from '../base'
import type { OctaneNode } from 'octane'

interface LinkProps {
  href: string
  class?: string
  'aria-label'?: string
  'aria-current'?: 'page'
  children?: OctaneNode
}

/**
 * 站内链接：把普通点击交给 history API，其余情况（新窗口、修饰键、外链）
 * 保持浏览器默认行为，这样中键/右键/复制链接都还能用。
 */
export function Link(props: LinkProps) {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(props.href, { transition: event.detail !== 0 })
  }

  return (
    <a
      href={withBase(props.href)}
      class={props.class}
      aria-label={props['aria-label']}
      aria-current={props['aria-current']}
      onClick={onClick}
      onPointerEnter={() => prefetchRoute(props.href)}
      onFocus={() => prefetchRoute(props.href)}
    >
      {props.children}
    </a>
  )
}
