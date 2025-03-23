"use client"

import { useEffect, useRef, useState } from "react"
import { useFullscreen } from "../../hooks/useFullscreen"
import FullscreenButton from "./fullscreen-button"
import { animate } from "motion"
import { GUI } from "lil-gui"
import { cn } from "../../utils"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number
  maxLife: number
}

interface ParticleSystemSettings {
  particleCount: number
  particleSize: number
  particleLifespan: number
  speedFactor: number
  connectionDistance: number
  connectionOpacity: number
  colorMode: 'rainbow' | 'theme' | 'monochrome'
  mouseInteraction: boolean
  mouseForce: number
}

export default function ParticleDemo({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })
  const guiRef = useRef<GUI | null>(null)
  const { containerRef: fullscreenRef, isFullscreen, toggleFullscreen } = useFullscreen()

  // Settings with default values
  const [settings] = useState<ParticleSystemSettings>({
    particleCount: 100,
    particleSize: 3,
    particleLifespan: 100,
    speedFactor: 1,
    connectionDistance: 100,
    connectionOpacity: 0.2,
    colorMode: 'theme',
    mouseInteraction: true,
    mouseForce: 0.5
  })

  // Setup animation for UI elements
  useEffect(() => {
    if (containerRef.current) {
      // Animate container opacity
      animate(
        containerRef.current,
        { opacity: [0, 1] },
        { duration: 0.5 }
      )
    }
  }, [])

  // Initialize particle system
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = (): void => {
      if (!canvas || !canvas.parentElement) return
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles
    const createParticles = (): void => {
      particlesRef.current = []
      for (let i = 0; i < settings.particleCount; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    // Create a single particle
    const createParticle = (): Particle => {
      const maxLife = settings.particleLifespan + Math.random() * settings.particleLifespan * 0.5
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * settings.speedFactor,
        vy: (Math.random() - 0.5) * settings.speedFactor,
        radius: Math.random() * settings.particleSize + 1,
        color: getParticleColor(Math.random()),
        life: 0,
        maxLife
      }
    }

    // Get particle color based on color mode
    const getParticleColor = (value: number): string => {
      switch (settings.colorMode) {
        case 'rainbow':
          return `hsl(${value * 360}, 80%, 60%)`
        case 'theme':
          // Use CSS variables for theme colors
          const isDarkMode = document.documentElement.classList.contains('dark')
          if (isDarkMode) {
            return `hsl(${220 + value * 40}, 70%, ${50 + value * 20}%)`
          } else {
            return `hsl(${20 + value * 40}, 70%, ${50 + value * 20}%)`
          }
        case 'monochrome':
          return `rgba(150, 150, 150, ${0.3 + value * 0.7})`
        default:
          return '#ffffff'
      }
    }

    // Update particles
    const updateParticles = (): void => {
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i]

        // Update life
        p.life += 1
        if (p.life >= p.maxLife) {
          particlesRef.current[i] = createParticle()
          continue
        }

        // Mouse interaction
        if (settings.mouseInteraction && mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x
          const dy = p.y - mouseRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const force = (100 - distance) / 100 * settings.mouseForce
            p.vx += (dx / distance) * force
            p.vy += (dy / distance) * force
          }
        }

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }
    }

    // Draw particles and connections
    const drawParticles = (): void => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections first (behind particles)
      ctx.beginPath()
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p1 = particlesRef.current[i]

        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < settings.connectionDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(150, 150, 150, ${(1 - distance / settings.connectionDistance) * settings.connectionOpacity})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const p of particlesRef.current) {
        const opacity = 1 - (p.life / p.maxLife)

        ctx.beginPath()
        ctx.fillStyle = p.color.includes('rgba') ? p.color : p.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Animation loop
    const animate = (): void => {
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseEnter = (): void => {
      mouseRef.current.active = true
    }

    const handleMouseLeave = (): void => {
      mouseRef.current.active = false
    }

    // Add mouse event listeners
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    // Setup GUI controls
    const gui = new GUI({ title: 'Particle Settings', container: containerRef.current! })
    gui.add(settings, 'particleCount', 10, 300, 10).name('Particle Count').onChange(createParticles)
    gui.add(settings, 'particleSize', 1, 10, 0.5).name('Particle Size')
    gui.add(settings, 'particleLifespan', 50, 300, 10).name('Lifespan')
    gui.add(settings, 'speedFactor', 0.1, 3, 0.1).name('Speed')
    gui.add(settings, 'connectionDistance', 50, 200, 10).name('Connection Distance')
    gui.add(settings, 'connectionOpacity', 0.05, 1, 0.05).name('Connection Opacity')
    gui.add(settings, 'colorMode', ['rainbow', 'theme', 'monochrome']).name('Color Mode').onChange(() => {
      // Update colors of existing particles
      for (const p of particlesRef.current) {
        p.color = getParticleColor(Math.random())
      }
    })

    const mouseFolder = gui.addFolder('Mouse Interaction')
    mouseFolder.add(settings, 'mouseInteraction').name('Enabled')
    mouseFolder.add(settings, 'mouseForce', 0.1, 2, 0.1).name('Force')

    gui.close() // Start with closed panel
    guiRef.current = gui

    // Initialize and start animation
    createParticles()
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (guiRef.current) {
        guiRef.current.destroy()
      }

      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [settings])

  return (
    <div ref={fullscreenRef} className={cn("relative w-full h-full bg-background", className)}>
      <div
        ref={containerRef}
        className="absolute top-4 left-4 z-10"
      >
        <FullscreenButton
          isFullscreen={isFullscreen}
          onClick={toggleFullscreen}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
        />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
    </div>
  )
}
