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
    <footer className="mb-16">
      <motion.ul
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-sm mt-8 flex flex-col space-y-2 md:flex-row md:space-x-6 md:space-y-0"
      >
        <motion.li
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <a
            className="group flex items-center text-muted-foreground hover:text-foreground transition-colors"
            rel="noopener noreferrer"
            target="_blank"
            href="/rss"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">RSS</p>
          </a>
        </motion.li>
        <motion.li
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <a
            className="group flex items-center text-muted-foreground hover:text-foreground transition-colors"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/lxxorz"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">GitHub</p>
          </a>
        </motion.li>
      </motion.ul>
      <p className="mt-8 text-muted-foreground">
        © {new Date().getFullYear()} MIT Licensed
      </p>
    </footer>
  )
}
