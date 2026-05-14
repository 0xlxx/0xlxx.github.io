"use client"

import { useState, useCallback } from "react"
import { Github, Globe, Mail, Check } from "lucide-react"
import * as motion from "motion/react-client"
import { AnimatePresence } from "motion/react"

const email = "lxxorz@gmail.com"

export default function HomeSocial() {
  const [copied, setCopied] = useState(false)

  const copyEmail = useCallback(async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex items-center justify-center gap-8"
    >
      <a
        href="https://github.com/0xlxx"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-sm text-hero-foreground-muted transition hover:text-hero-foreground"
        aria-label="GitHub"
      >
        <Github
          size={20}
          strokeWidth={1.5}
          className="transition-transform group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-wider">GitHub</span>
      </a>

      <a
        href="https://observablehq.com/@0xlxx"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-sm text-hero-foreground-muted transition hover:text-hero-foreground"
        aria-label="Observable"
      >
        <Globe
          size={20}
          strokeWidth={1.5}
          className="transition-transform group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-wider">Observable</span>
      </a>

      <button
        type="button"
        onClick={copyEmail}
        className="relative group flex items-center gap-2 text-sm text-hero-foreground-muted transition hover:text-hero-foreground cursor-pointer"
        aria-label={`Copy email: ${email}`}
      >
        <Mail
          size={20}
          strokeWidth={1.5}
          className="transition-transform group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-wider">Email</span>

        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-hero-foreground/10 border border-hero-border text-[10px] text-hero-foreground whitespace-nowrap"
            >
              <Check size={10} strokeWidth={2.5} />
              Copied!
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}
