"use client"

import * as motion from "motion/react-client"

export default function HomeHero() {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-3xl font-bold tracking-tight text-hero-foreground sm:text-4xl md:text-5xl"
      >
        Bjorn Li
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-sm leading-relaxed text-hero-foreground-muted sm:text-base font-light tracking-wide"
      >
        <span className="text-hero-foreground">Web Developer</span>
        <span className="mx-2 text-hero-foreground-subtle">|</span>
        <span className="text-hero-foreground">Web3D</span>
        <span className="mx-2 text-hero-foreground-subtle">|</span>
        <span className="text-hero-foreground">Visualization</span>
        <span className="mx-2 text-hero-foreground-subtle">|</span>
        <span className="text-hero-foreground">Creative Technologies</span>
      </motion.p>
    </div>
  )
}
