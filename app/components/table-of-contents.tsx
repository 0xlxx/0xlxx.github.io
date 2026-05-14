'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from 'app/utils/cn'
import { motion } from 'framer-motion'

export function TableOfContents({ headings }: { headings: { text: string; level: number; slug: string }[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const isScrollingRef = useRef(false)
  const [visibleHeadings, setVisibleHeadings] = useState<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return

        setVisibleHeadings((prev) => {
          const newSet = new Set(prev)
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              newSet.add(entry.target.id)
            } else {
              newSet.delete(entry.target.id)
            }
          })
          return newSet
        })
      },
      {
        rootMargin: '-80px 0px -40% 0px',
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.slug)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  // Derive activeId from visibleHeadings or fallback to last scrolled past
  useEffect(() => {
    if (isScrollingRef.current) return

    const checkActive = () => {
      let newActiveId = ''

      // 1. If there are visible headings, pick the first one in the DOM order
      if (visibleHeadings.size > 0) {
        for (const heading of headings) {
          if (visibleHeadings.has(heading.slug)) {
            newActiveId = heading.slug
            break
          }
        }
      } else {
        // 2. If no headings are visible, find the last heading that is above the viewport
        for (let i = headings.length - 1; i >= 0; i--) {
          const element = document.getElementById(headings[i].slug)
          if (element) {
            const rect = element.getBoundingClientRect()
            // Check if it's above the "reading line" (e.g., 80px)
            if (rect.top < 80) {
              newActiveId = headings[i].slug
              break
            }
          }
        }
      }

      setActiveId(newActiveId)
    }

    checkActive()
  }, [visibleHeadings, headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto pb-10 xl:block no-scrollbar">
      <div className="mb-6 text-sm font-semibold tracking-tight text-foreground">
        目录
      </div>

      <div className="relative pl-4 overflow-hidden">
        {/* Vertical Track Line */}
        <div className="absolute left-0 top-0 h-full w-px bg-border" />

        <ul className="space-y-3 text-sm pb-4">
          {headings.map((heading) => (
            <li
              key={heading.slug}
              className={cn(
                "relative transition-colors",
                heading.level === 3 && "pl-4",
                heading.level === 4 && "pl-8"
              )}
            >
              <a
                href={`#${heading.slug}`}
                className={cn(
                  "block py-1 transition-colors hover:text-foreground",
                  activeId === heading.slug
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  const main = document.querySelector('main')
                  const element = document.getElementById(heading.slug)

                  if (main && element) {
                    isScrollingRef.current = true
                    setActiveId(heading.slug)

                    const rect = element.getBoundingClientRect()
                    const targetScrollTop = main.scrollTop + rect.top - 80

                    main.scrollTo({
                      top: targetScrollTop,
                      behavior: 'smooth'
                    })

                    setTimeout(() => {
                      isScrollingRef.current = false
                      // Force re-check after scroll
                      const newSet = new Set<string>()
                      headings.forEach(h => {
                        const el = document.getElementById(h.slug)
                        if (el) {
                          const r = el.getBoundingClientRect()
                          // Manually check intersection based on same rootMargin logic roughly
                          // rootMargin: '-80px 0px -40% 0px'
                          // means intersection if top < (viewportHeight * 0.6) && bottom > 80
                          const viewportHeight = window.innerHeight
                          if (r.top < viewportHeight * 0.6 && r.bottom > 80) {
                            newSet.add(h.slug)
                          }
                        }
                      })
                      setVisibleHeadings(newSet)
                    }, 800)
                  }
                }}
              >
                {heading.text}
              </a>
              {activeId === heading.slug && (
                <motion.div
                  layoutId="active-toc-item"
                  className="absolute -left-[17px] top-1 h-6 w-0.5 bg-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
