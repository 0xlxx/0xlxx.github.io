'use client'

import Link from 'next/link'
import { ThemeSwitcher } from './theme-switcher'
import { motion } from 'motion/react'

const navItems = {
  '/': {
    name: '首页',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  '/blog': {
    name: '博客',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
}

export function Navbar() {
  return (
    <motion.aside
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16 tracking-tight"
    >
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/50"
          id="nav"
        >
          <div className="flex items-center gap-1">
            {Object.entries(navItems).map(([path, { name, icon }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="group"
                >
                  <motion.div
                    className="relative px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {icon}
                    <span>{name}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
          <ThemeSwitcher />
        </nav>
      </div>
    </motion.aside>
  )
}
