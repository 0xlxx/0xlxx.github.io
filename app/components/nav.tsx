"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

import { cn } from "app/utils"
import { Logo } from "app/components/logo"
import { ThemeToggle } from "app/components/theme-toggle"

const navItems = [
  {
    path: "/blog",
    name: "BLOG",
  },
]

export function Navbar() {
  const pathname = usePathname() || "/"
  const [hidden, setHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const main = document.querySelector("main")
    if (!main) return

    let lastScrollY = main.scrollTop
    let ticking = false

    const updateNavbar = () => {
      const currentScrollY = main.scrollTop

      // Hide if scrolling down and past 150px
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setHidden(true)
      } else {
        setHidden(false)
      }

      lastScrollY = currentScrollY
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar)
        ticking = true
      }
    }

    main.addEventListener("scroll", handleScroll, { passive: true })
    return () => main.removeEventListener("scroll", handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-transform duration-300 ease-in-out",
        hidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm"
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between px-6 h-full">
        <Link
          href="/"
          className="transition-opacity hover:opacity-80 active:scale-95"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Logo className="h-8 w-8" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:block">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))

              return (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className={cn(
                    "relative flex items-center justify-center px-4 py-2 corner-squircle text-sm font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-accent corner-squircle border border-border/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">
                    {item.name}
                  </span>
                </Link>
              )
            })}
            <div className="w-px h-4 bg-border mx-2" />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-lg sm:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    href={item.path as any}
                    className={cn(
                      "flex items-center px-4 py-3 corner-squircle text-base font-medium transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="px-4 py-2 flex items-center justify-between border-t border-border/40 pt-4">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
