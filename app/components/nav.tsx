'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Briefcase } from 'lucide-react'
import { ThemeSwitcher } from './theme-switcher'

const navItems = {
  '/': {
    name: 'home',
    icon: <Home size={20} />,
  },
  '/blog': {
    name: 'archive',
    icon: <BookOpen size={20} />,
  },
  '/demo': {
    name: 'demo',
    icon: <Briefcase size={20} />,
  },
} as const

export function Navbar() {
  const pathname = usePathname()
  const isActive = pathname && pathname.startsWith('/')
  return (
    <nav
      className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm tracking-tight px-4 py-3 border-b border-border transition-colors"
      id="nav"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home link */}
        <Link href="/" className="font-semibold text-lg group">
          <span className="sr-only">Bjorn Li</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 group-hover:to-primary transition-all duration-300">BL</span>
        </Link>

        {/* Desktop navigation */}
        <div
          className="flex items-center gap-2"
          id="nav-items"
        >
          {Object.entries(navItems).map(([url, { name, icon }]) => {
            const isActive = pathname === url
            return (
              <Link
                key={url}
                href={url}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`relative text-sm flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:backdrop-blur-sm ${isActive
                    ? 'text-primary bg-primary/10 backdrop-blur-sm '
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5 '}`}
                  data-active={isActive}
                >
                  {icon}
                  <span className="hidden md:inline capitalize">{name}</span>
                </div>
              </Link>
            )
          })}

          <div className="ml-2">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}
