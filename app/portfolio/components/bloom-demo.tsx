"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import GUI from "lil-gui"
import { Icon } from "@iconify-icon/react"

// Define a layer for non-bloomed objects
const ENTIRE_SCENE = 0
const BLOOM_SCENE = 1

// Shader for selective bloom
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE)

// Custom shader for selective bloom
const bloomShader = {
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(baseTexture, vUv);
      vec4 bloom = texture2D(bloomTexture, vUv);
      gl_FragColor = base + bloom;
    }
  `
}

export default function BloomDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const guiRef = useRef<GUI | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Scene parameters
  const params = useRef({
    bloomIntensity: 1.5,
    bloomThreshold: 0.2,
    bloomRadius: 0.5,
    rotating: true
  })

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI * 0.5
    controls.minDistance = 1
    controls.maxDistance = 10
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Create two scenes - one for the base render, one for the bloom
    const bloomComposer = new EffectComposer(renderer)
    const renderScene = new RenderPass(scene, camera)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      params.current.bloomIntensity,
      params.current.bloomRadius,
      params.current.bloomThreshold
    )

    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderScene)
    bloomComposer.addPass(bloomPass)

    // Final composer with shader to combine both scenes
    const finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)

    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: bloomShader.vertexShader,
        fragmentShader: bloomShader.fragmentShader,
        defines: {}
      }),
      "baseTexture"
    )
    finalPass.needsSwap = true
    finalComposer.addPass(finalPass)

    // Create materials
    const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const materials: { [id: string]: THREE.Material } = {}

    // Function to set object layers for selective bloom
    function toggleBloom(obj: THREE.Object3D, bloom: boolean) {
      if (bloom) {
        obj.layers.enable(BLOOM_SCENE)
      } else {
        obj.layers.disable(BLOOM_SCENE)
      }
    }

    // Function to render the scene with selective bloom
    function renderBloom() {
      // Save original materials and replace with dark material
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && materials[obj.uuid] === undefined) {
          materials[obj.uuid] = obj.material
        }
      })

      // Render only bloom objects
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && materials[obj.uuid]) {
          if (obj.layers.test(bloomLayer)) {
            obj.material = materials[obj.uuid]
          } else {
            obj.material = darkMaterial
          }
        }
      })

      // Render bloom scene
      renderer.setClearColor(0x000000)
      bloomComposer.render()

      // Restore original materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && materials[obj.uuid]) {
          obj.material = materials[obj.uuid]
        }
      })
    }

    // Create objects
    // 1. Non-blooming sphere (center)
    const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.2,
      metalness: 0.8
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // 2. Blooming torus
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.15, 16, 100)
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9500,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xff4000,
      emissiveIntensity: 0.5
    })
    const torus = new THREE.Mesh(torusGeometry, torusMaterial)
    torus.rotation.x = Math.PI / 2
    scene.add(torus)
    toggleBloom(torus, true)

    // 3. Blooming small spheres orbiting
    const smallSphereGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const colors = [0x00ffff, 0x00ff00, 0xff00ff, 0xffff00]

    const orbitingSpheres: THREE.Mesh[] = []

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const smallSphereMaterial = new THREE.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.1,
        metalness: 0.8,
        emissive: colors[i],
        emissiveIntensity: 0.5
      })

      const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial)
      smallSphere.position.set(
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        0
      )

      scene.add(smallSphere)
      toggleBloom(smallSphere, true)
      orbitingSpheres.push(smallSphere)
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(2, 2, 2)
    scene.add(pointLight)

    // Setup GUI
    const gui = new GUI({ container: containerRef.current, autoPlace: false, width: 250 })
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.right = '10px'
    gui.domElement.style.top = '10px'
    gui.domElement.style.zIndex = '1000'
    
    // Make GUI collapsible and start collapsed
    gui.close()
    
    const bloomFolder = gui.addFolder('Bloom Effect')
    
    bloomFolder.add(params.current, 'bloomIntensity', 0, 3, 0.01)
      .name('Intensity')
      .onChange((value: number) => {
        bloomPass.strength = value
      })
    
    bloomFolder.add(params.current, 'bloomThreshold', 0, 1, 0.01)
      .name('Threshold')
      .onChange((value: number) => {
        bloomPass.threshold = value
      })
    
    bloomFolder.add(params.current, 'bloomRadius', 0, 1, 0.01)
      .name('Radius')
      .onChange((value: number) => {
        bloomPass.radius = value
      })
    
    gui.add(params.current, 'rotating')
      .name('Rotation')
    
    guiRef.current = gui

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      bloomComposer.setSize(width, height)
      finalComposer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      // Rotate objects if enabled
      if (params.current.rotating) {
        torus.rotation.z = elapsedTime * 0.3

        // Rotate small spheres around the center
        orbitingSpheres.forEach((sphere, i) => {
          const angle = elapsedTime * 0.5 + (i / 4) * Math.PI * 2
          sphere.position.x = Math.cos(angle) * 2
          sphere.position.y = Math.sin(angle) * 2
          sphere.rotation.x = elapsedTime * 0.5
          sphere.rotation.y = elapsedTime * 0.3
        })
      }

      // Update controls
      controls.update()

      // Render with bloom effect
      renderBloom()
      finalComposer.render()

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          }
        }
      })

      // Dispose of GUI
      if (guiRef.current) {
        guiRef.current.destroy()
      }

      renderer.dispose()
      controls.dispose()
    }
  }, [])

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
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
