'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from './theme-switcher'
import { useEffect, useState, useRef } from 'react'
import { animate, stagger } from 'motion'
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
  '/portfolio': {
    name: 'portfolio',
    icon: <Icon size={20} icon="mdi:briefcase" />,
  },
  '/value': {
    name: 'favorites',
    icon: <Icon size={20} icon="mdi:heart"/>,
  },
}

export function Navbar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  // Handle responsive state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])
  
  // Animation for navbar items
  useEffect(() => {
    const navLinks = document.querySelectorAll('#nav-items a')
    
    if (navLinks.length) {
      animate(
        navLinks,
        { opacity: [0, 1], y: [-5, 0] },
        { delay: stagger(0.05), duration: 0.3, easing: [0.22, 0.03, 0.26, 1] }
      )
    }
  }, [isMenuOpen])
  
  // Mobile menu animation
  useEffect(() => {
    if (!mobileMenuRef.current) return
    
    if (isMenuOpen) {
      // Animate mobile menu opening
      const menuLinks = mobileMenuRef.current.querySelectorAll('a')
      const menuDivider = mobileMenuRef.current.querySelector('.menu-divider')
      
      // Animate the menu background
      animate(
        mobileMenuRef.current,
        { opacity: [0, 1] },
        { duration: 0.3, easing: [0.22, 0.03, 0.26, 1] }
      )
      
      // Animate menu links with stagger
      animate(
        menuLinks,
        { opacity: [0, 1], x: [-10, 0] },
        { delay: stagger(0.05), duration: 0.4, easing: [0.22, 0.03, 0.26, 1] }
      )
      
      // Animate the divider
      if (menuDivider) {
        animate(
          menuDivider,
          { scaleX: [0, 1], opacity: [0, 1] },
          { duration: 0.3, delay: 0.2, easing: [0.22, 0.03, 0.26, 1] }
        )
      }
    }
  }, [isMenuOpen])
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])
  
  return (
    <nav
      className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/80 tracking-tight px-4 py-3 border-b border-border transition-colors"
      id="nav"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home link */}
        <Link href="/" className="font-semibold text-lg group">
          <span className="sr-only">Bjorn Li</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 group-hover:to-primary transition-all duration-300">BL</span>
        </Link>
        
        {/* Mobile menu button */}
        {isMobile && (
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <Icon 
              icon={isMenuOpen ? "mdi:close" : "mdi:menu"} 
              size={24} 
              aria-hidden="true" 
            />
          </button>
        )}
        
        {/* Desktop navigation */}
        <div 
          className={`${isMobile ? 'hidden' : 'flex'} items-center gap-2`}
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
                  className={`relative text-sm flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isActive 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : url === '/value' 
                      ? 'text-muted-foreground hover:text-purple-300 hover:scale-110 transition-transform origin-center' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
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
        {isMobile && isMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-16"
            id="mobile-menu"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
              {Object.entries(navItems).map(([url, { name, icon }]) => {
                const isActive = pathname === url
                return (
                  <Link
                    key={url}
                    href={url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive 
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
