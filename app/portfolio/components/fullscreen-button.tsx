"use client"
import { Icon } from "@iconify-icon/react"
import { motion } from 'motion/react'

interface FullscreenButtonProps {
  isFullscreen: boolean
  toggleFullscreen: () => void
}

export default function FullscreenButton({ isFullscreen, toggleFullscreen }: FullscreenButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={toggleFullscreen}
      className="group cursor-pointer z-10 flex items-center justify-center p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-md hover:bg-accent transition-colors duration-200 text-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <Icon
        icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"}
        className="text-primary transition-transform group-hover:scale-120"
      />
    </motion.button>
  )
}
