"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"

export default function HomeHero() {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-3xl font-bold tracking-tight text-hero-foreground sm:text-4xl md:text-5xl"
      >
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-80 sm:gap-3"
        >
          <span>Bjorn Li</span>
          <ArrowRight
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-hero-foreground-muted transition-transform duration-300 group-hover:translate-x-1 sm:h-8 sm:w-8 md:h-9 md:w-9"
          />
        </Link>
      </motion.h1>
    </div>
  )
}
