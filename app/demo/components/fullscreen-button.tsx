"use client"
import { Maximize, Minimize } from "lucide-react"
import { motion } from 'motion/react'
import { cn } from "../../utils"

interface FullscreenButtonProps {
  isFullscreen: boolean
  onClick: () => void
  className?: string
}

export default function FullscreenButton({ isFullscreen, onClick, className }: FullscreenButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn("group cursor-pointer z-10 flex items-center justify-center p-2 corner-squircle bg-background/80 backdrop-blur-sm border border-border shadow-md hover:bg-accent transition-colors duration-200 text-xl", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="text-primary transition-transform group-hover:scale-120" size={20} />
      ) : (
        <Maximize className="text-primary transition-transform group-hover:scale-120" size={20} />
      )}
    </motion.button>
  )
}
