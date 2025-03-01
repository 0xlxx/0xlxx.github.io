"use client"

import { useEffect, useRef, useState } from "react"
import { Icon } from "@iconify-icon/react"
import GUI from "lil-gui"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

export default function ParticleDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const guiRef = useRef<GUI | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Configuration state with default values
  const [config, setConfig] = useState({
    particleCount: 100,
    particleSize: 5,
    particleSpeed: 1,
    particleLife: 3,
    colorMode: "rainbow",
    connectParticles: true,
    connectionDistance: 100,
    mouseInteraction: true,
    mouseRadius: 150,
    mouseForce: 0.1,
  })

  // Initialize the demo
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push(createParticle())
      }
    }
    
    // Create a single particle
    const createParticle = (x?: number, y?: number): Particle => {
      const maxLife = config.particleLife * (0.8 + Math.random() * 0.4)
      return {
        x: x ?? Math.random() * canvas.width,
        y: y ?? Math.random() * canvas.height,
        size: config.particleSize * (0.5 + Math.random() * 0.5),
        speedX: (Math.random() - 0.5) * config.particleSpeed,
        speedY: (Math.random() - 0.5) * config.particleSpeed,
        color: getRandomColor(),
        alpha: 0,
        life: 0,
        maxLife: maxLife * 60, // Convert to frames
      }
    }
    
    // Get a random color based on the color mode
    const getRandomColor = () => {
      if (config.colorMode === "rainbow") {
        return `hsl(${Math.random() * 360}, 100%, 60%)`
      } else if (config.colorMode === "blue") {
        return `hsl(${210 + Math.random() * 30}, 100%, ${50 + Math.random() * 20}%)`
      } else {
        return `hsl(${280 + Math.random() * 60}, 100%, ${50 + Math.random() * 20}%)`
      }
    }
    
    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    let mouseActive = false
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) * window.devicePixelRatio
      mouseY = (e.clientY - rect.top) * window.devicePixelRatio
      mouseActive = true
    }
    
    const handleMouseLeave = () => {
      mouseActive = false
    }
    
    if (config.mouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i]
        
        // Update life
        p.life++
        if (p.life < p.maxLife * 0.2) {
          // Fade in
          p.alpha = p.life / (p.maxLife * 0.2)
        } else if (p.life > p.maxLife * 0.8) {
          // Fade out
          p.alpha = (p.maxLife - p.life) / (p.maxLife * 0.2)
        } else {
          p.alpha = 1
        }
        
        // Mouse interaction
        if (config.mouseInteraction && mouseActive) {
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < config.mouseRadius) {
            const force = (config.mouseRadius - distance) / config.mouseRadius * config.mouseForce
            p.speedX += dx / distance * force
            p.speedY += dy / distance * force
          }
        }
        
        // Update position
        p.x += p.speedX
        p.y += p.speedY
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -0.8
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -0.8
        
        // Apply friction
        p.speedX *= 0.98
        p.speedY *= 0.98
        
        // Draw particle
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Respawn if life is over
        if (p.life >= p.maxLife) {
          particlesRef.current[i] = createParticle()
        }
      }
      
      // Connect particles
      if (config.connectParticles) {
        ctx.globalAlpha = 0.2
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 0.5
        
        for (let i = 0; i < particlesRef.current.length; i++) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p1 = particlesRef.current[i]
            const p2 = particlesRef.current[j]
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < config.connectionDistance) {
              ctx.globalAlpha = 0.2 * (1 - distance / config.connectionDistance) * p1.alpha * p2.alpha
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Start animation
    initParticles()
    animate()
    
    // Setup GUI controls
    if (!guiRef.current) {
      const gui = new GUI({ container: containerRef.current, title: 'Particle Settings' })
      gui.domElement.style.position = 'absolute'
      gui.domElement.style.top = '10px'
      gui.domElement.style.right = '10px'
      
      // Particle settings
      const particleFolder = gui.addFolder('Particles')
      particleFolder.add(config, 'particleCount', 10, 300, 10).onChange((value: number) => {
        setConfig(prev => ({ ...prev, particleCount: value }))
        initParticles()
      })
      particleFolder.add(config, 'particleSize', 1, 10, 0.5).onChange((value: number) => {
        setConfig(prev => ({ ...prev, particleSize: value }))
      })
      particleFolder.add(config, 'particleSpeed', 0.1, 3, 0.1).onChange((value: number) => {
        setConfig(prev => ({ ...prev, particleSpeed: value }))
      })
      particleFolder.add(config, 'particleLife', 1, 10, 0.5).onChange((value: number) => {
        setConfig(prev => ({ ...prev, particleLife: value }))
      })
      particleFolder.add(config, 'colorMode', ['rainbow', 'blue', 'purple']).onChange((value: string) => {
        setConfig(prev => ({ ...prev, colorMode: value }))
      })
      
      // Connection settings
      const connectionFolder = gui.addFolder('Connections')
      connectionFolder.add(config, 'connectParticles').onChange((value: boolean) => {
        setConfig(prev => ({ ...prev, connectParticles: value }))
      })
      connectionFolder.add(config, 'connectionDistance', 50, 200, 10).onChange((value: number) => {
        setConfig(prev => ({ ...prev, connectionDistance: value }))
      })
      
      // Mouse interaction settings
      const mouseFolder = gui.addFolder('Mouse Interaction')
      mouseFolder.add(config, 'mouseInteraction').onChange((value: boolean) => {
        setConfig(prev => ({ ...prev, mouseInteraction: value }))
        if (value) {
          canvas.addEventListener('mousemove', handleMouseMove)
          canvas.addEventListener('mouseleave', handleMouseLeave)
        } else {
          canvas.removeEventListener('mousemove', handleMouseMove)
          canvas.removeEventListener('mouseleave', handleMouseLeave)
        }
      })
      mouseFolder.add(config, 'mouseRadius', 50, 300, 10).onChange((value: number) => {
        setConfig(prev => ({ ...prev, mouseRadius: value }))
      })
      mouseFolder.add(config, 'mouseForce', 0.01, 0.5, 0.01).onChange((value: number) => {
        setConfig(prev => ({ ...prev, mouseForce: value }))
      })
      
      // Close all folders by default
      gui.close()
      
      guiRef.current = gui
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (config.mouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (guiRef.current) {
        guiRef.current.destroy()
        guiRef.current = null
      }
    }
  }, [config])
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 left-2 z-10 p-2 bg-black/50 rounded-md text-white/80 hover:text-white hover:bg-black/70 transition-colors"
        aria-label={isFullscreen ? "退出全屏" : "全屏显示"}
      >
        <Icon 
          icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"} 
          width="20" 
          height="20" 
        />
      </button>
    </div>
  )
}
