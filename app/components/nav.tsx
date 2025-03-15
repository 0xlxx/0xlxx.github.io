'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Briefcase, Heart, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeSwitcher } from './theme-switcher'

const navItems = {
  '/': {
    name: 'home',
    icon: <Home size={20} />,
  },
  '/blog': {
    name: 'blog',
    icon: <BookOpen size={20} />,
  },
  '/portfolio': {
    name: 'portfolio',
    icon: <Briefcase size={20} />,
  },
  '/value': {
    name: '',
    icon: <Heart size={20} />,
  },
} as const

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-background/20 backdrop-blur-sm   tracking-tight px-4 py-3 border-b border-border transition-colors"
      id="nav"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home link */}
        <Link href="/" className="font-semibold text-lg group">
          <span className="sr-only">Bjorn Li</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 group-hover:to-primary transition-all duration-300">BL</span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>


        {/* Desktop navigation */}
        <div
          className="hidden md:flex items-center gap-2"
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

        {/* Mobile navigation overlay */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-16"
            id="mobile-menu"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-4 ">
              {Object.entries(navItems).map(([url, { name, icon }]) => {
                const isActive = pathname === url
                return (
                  <Link
                    key={url}
                    href={url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg  transition-colors ${isActive
                      ? 'text-primary bg-primary/10 font-medium'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {icon}
                    <span className="text-lg capitalize">{name}</span>
                  </Link>
                )
              })}

              <div className="pt-4 mt-4 border-t border-border flex justify-between items-center menu-divider">
                <span className="text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
