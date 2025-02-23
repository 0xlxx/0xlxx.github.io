'use client'

import { motion } from 'motion/react'

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground group-hover:text-foreground transition-colors"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <div className="container py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.ul
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <motion.li whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <a
              className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              rel="noopener noreferrer"
              target="_blank"
              href="/rss"
            >
              <ArrowIcon />
              <span className="ml-1.5">RSS</span>
            </a>
          </motion.li>
          <motion.li whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <a
              className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/lxxorz"
            >
              <ArrowIcon />
              <span className="ml-1.5">Github</span>
            </a>
          </motion.li>
        </motion.ul>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-xs text-muted-foreground mt-4 sm:mt-0"
        >
          © {new Date().getFullYear()} CC BY 4.0 Licensed
        </motion.p>
      </div>
    </div>
  )
}
