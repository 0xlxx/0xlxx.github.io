"use client"

import Link from "next/link"
import type { Route } from "next"
import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"

const navItems: Array<{ href: Route; label: string; delay: number }> = [
  { href: "/blog", label: "BLOG", delay: 0.3 },
  { href: "/demo", label: "DEMO", delay: 0.4 },
]

export default function HomeNav() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
      {navItems.map(({ href, label, delay }) => (
        <Link key={label} href={href} className="block group">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="relative h-full overflow-hidden corner-squircle border border-hero-border px-6 py-4 transition-all duration-300 hover:border-hero-border-hover hover:bg-hero-bg-hover hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="relative z-10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-hero-foreground transition-colors tracking-wider">
                {label}
              </h3>
              <div className="text-hero-foreground-subtle group-hover:text-hero-foreground-muted transition-colors transform group-hover:translate-x-0.5 duration-300">
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
