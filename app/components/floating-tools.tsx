'use client'

import { ArrowUp, Share2, MessageSquare } from 'lucide-react'

export function FloatingTools() {
  const scrollToTop = () => {
    const main = document.querySelector('main')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky top-24 hidden h-[calc(100vh-6rem)] flex-col justify-end gap-4 pb-10 xl:flex">
      {/* 
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Comment"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
      
      <div className="h-px w-full bg-border my-2" /> 
      */}

      <button
        onClick={scrollToTop}
        className="scroll-to-top flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  )
}
