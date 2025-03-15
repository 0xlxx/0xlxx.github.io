'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Sun, Moon } from 'lucide-react'

// 定义主题颜色 - 更简洁的配色方案
const THEME_COLORS = {
  light: {
    track: '#e2e8f0',    // 轨道背景色 - 浅灰色
    thumb: '#ffffff',   // 滑块颜色 - 白色
    iconLight: '#f59e0b', // 亮色图标 - 琥珀色
    iconDark: '#94a3b8',  // 暗色图标 - 浅灰蓝色
    shadow: '0 2px 5px rgba(0, 0, 0, 0.1)' // 阴影效果
  },
  dark: {
    track: '#334155',    // 轨道背景色 - 深蓝灰色
    thumb: '#1e293b',   // 滑块颜色 - 深蓝色
    iconLight: '#f59e0b', // 亮色图标 - 琥珀色
    iconDark: '#e2e8f0',  // 暗色图标 - 浅灰色
    shadow: '0 2px 5px rgba(0, 0, 0, 0.3)' // 阴影效果
  }
}

// 简化的动画配置
const ANIMATION = {
  // 标准过渡效果
  standard: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 0.5, // 添加质量参数以减少弹跳
    restDelta: 0.001 // 增加精度控制
  },
  // 图标过渡效果
  icon: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 15
  },
  // 悬停效果
  hover: {
    type: 'tween' as const,
    duration: 0.15
  }
}

/**
 * 主题切换按钮组件 - 重构版本
 * 采用更简洁的设计和更可靠的动画实现
 */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 组件挂载后设置状态
  useEffect(() => {
    setMounted(true)
  }, [])

  // 如果组件未挂载，返回空占位符以避免布局偏移
  if (!mounted) {
    return <div className="h-8 w-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
  }

  // 确定当前主题
  const isDark = resolvedTheme === 'dark'
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light
  
  // 切换主题
  const toggleTheme = () => {
    // 检查浏览器是否支持 View Transitions API
    if (!document.startViewTransition) {
      setTheme(isDark ? 'light' : 'dark')
      return
    }
    
    // 使用 View Transitions API 实现平滑过渡
    document.startViewTransition(() => {
      setTheme(isDark ? 'light' : 'dark')
    })
  }

  return (
    <motion.button
      aria-label={`切换到${isDark ? '亮色' : '暗色'}模式`}
      type="button"
      className="relative h-8 w-14 rounded-full p-1 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
      style={{ 
        backgroundColor: colors.track,
        viewTransitionName: 'theme-switcher' // 添加 view-transition-name
      }}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 滑块 */}
      <motion.div
        className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full overflow-hidden"
        style={{ 
          backgroundColor: colors.thumb,
          boxShadow: colors.shadow
        }}
        animate={{ 
          x: isDark ? 26 : 0 
        }}
        transition={ANIMATION.standard}
      >
        {/* 太阳图标 - 只在亮色模式显示 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ 
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1
          }}
          transition={ANIMATION.icon}
        >
          <Sun size={14} className="text-amber-500" />
        </motion.div>
        
        {/* 月亮图标 - 只在暗色模式显示 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ 
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5
          }}
          transition={ANIMATION.icon}
        >
          <Moon size={14} className="text-slate-100" />
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
