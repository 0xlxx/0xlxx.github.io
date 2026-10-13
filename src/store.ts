/**
 * 极小的外部状态容器：配合 octane 的 `useSyncExternalStore` 使用。
 * 不依赖 context，模块级共享，任何组件都能读到同一份状态。
 */
export interface Store<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial
  const listeners = new Set<() => void>()

  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return
      value = next
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
