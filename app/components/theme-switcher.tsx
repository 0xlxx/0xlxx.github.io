'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, MotionConfig } from 'motion/react'

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  // 在客户端挂载后再显示，避免服务端渲染不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  // 渲染骨架，保持布局稳定
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-muted"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
          restDelta: 0.001
        }}
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isHovered ? 0.9 : 1,
            rotate: isDark ? 0 : 180
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 10,
            restDelta: 0.001
          }}
          className="relative w-5 h-5"
        >
          {/* Sun icon */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0,
              scale: isDark ? 1 : 0.5,
              rotate: isDark ? 0 : 90
            }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 w-full h-full text-foreground"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-1.6-7l-1.4 1.4M5 5L3.6 3.6m14.4 14.4l1.4 1.4M5 19l-1.4 1.4" />
          </motion.svg>

          {/* Moon icon */}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.5 : 1,
              rotate: isDark ? -90 : 0
            }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 w-full h-full text-foreground"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </motion.svg>
        </motion.div>
      </motion.button>
    </MotionConfig>
  )
}
