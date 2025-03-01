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
      <div className="container flex gap-1 ">
        {Object.entries(navItems).map(([url, { name, icon }]) => {
          return (
            <Link
              key={url}
              href={url}
              className="z-30"
            >
              <motion.div className={`relative text-muted-foreground  h-6 px-4 py-2 rounded-xl  transition-colors flex items-center gap-2 ${url === '/value' ? 'hover:text-purple-300 hover:scale-130 transition-transform origin-center' : 'hover:text-primary'}`}>
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
