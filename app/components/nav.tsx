'use client'

import Link from 'next/link'
import { ThemeSwitcher } from './theme-switcher'
import { motion } from 'motion/react'
import { Icon } from '@iconify-icon/react'
const navItems = {
  '/': {
    name: 'home',
    icon: <Icon size={20} icon="mdi:home" />,
  },
  '/blog': {
    name: 'blog',
    icon: <Icon size={20} icon="mdi:book" />,
  },
  '/value': {
    name: '',
    icon: <Icon size={20} icon="mdi:heart"/>,
  },
}

export function Navbar() {
  return (
    <nav
      className="composer-effect w-full tracking-tight flex items-center justify-center px-4 py-3 border-b border-border"
      id="nav"
    >
      <div className="container flex items-center gap-1 ">
        {Object.entries(navItems).map(([path, { name, icon }]) => {
          return (
            <Link
              key={path}
              href={path}
              className="group z-30"
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
  )
}
