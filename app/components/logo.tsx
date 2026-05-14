"use client"

import { cn } from "app/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center text-foreground", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-all duration-300 ease-out opacity-90 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
      >
        <path
          d="M4 4H20V20H4V4Z M9 9H15V15H9V9Z M4 4L9 9 M20 4L15 9 M20 20L15 15 M4 20L9 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke-width] duration-300 ease-out hover:stroke-[2]"
        />
      </svg>
    </div>
  )
}
