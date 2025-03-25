'use client'
import Link from 'next/link'
import Image from 'next/image'
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
        {/* Avatar logo */}
        <Link href="/" className="group">
          <div className="relative overflow-hidden rounded-full transition-all duration-300 w-9 h-9 flex-shrink-0">
            <Image
              src="/images/icon.png"
              alt="Bjorn Li"
              width={36}
              height={36}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="sr-only">Bjorn Li</span>
          </div>
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
