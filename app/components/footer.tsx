'use client'

import { animate, stagger } from 'motion'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify-icon/react'

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (typeof window === 'undefined' || !footerRef.current) return
    
    // Animate footer links with stagger
    const links = footerRef.current.querySelectorAll('.footer-link')
    if (links.length) {
      animate(
        links,
        { opacity: [0, 1], y: [5, 0] },
        { delay: stagger(0.05), duration: 0.4, easing: [0.22, 0.03, 0.26, 1] }
      )
    }
    
    // Animate copyright text
    const copyright = footerRef.current.querySelector('.copyright')
    if (copyright) {
      animate(
        copyright,
        { opacity: [0, 1] },
        { duration: 0.5, delay: 0.2 }
      )
    }
  }, [])
  
  return (
    <footer 
      ref={footerRef}
      className="border-t border-border py-8 mt-12"
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Links */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Links</h3>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/rss" 
                  className="footer-link group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon icon="mdi:rss" className="mr-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>RSS</span>
                </Link>
                
                <Link 
                  href="https://github.com/lxxorz" 
                  className="footer-link group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon icon="mdi:github" className="mr-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Github</span>
                </Link>
                
                <Link 
                  href="https://observablehq.com/@lxxorz" 
                  className="footer-link group inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon icon="mdi:web" className="mr-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Observable</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="copyright text-sm text-muted-foreground">
            <p> {new Date().getFullYear()} Bjorn Li · CC BY 4.0 Licensed</p>
            <p className="text-xs mt-1">Built with Next.js, Three.js, and Motion</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
