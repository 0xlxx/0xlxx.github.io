"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import GUI from "lil-gui"
import { Icon } from "@iconify-icon/react"
import { useFullscreen } from "../../hooks/useFullscreen"
import FullscreenButton from "./fullscreen-button"

// 简化的天体数据
const celestialData = [
  {
    name: "Sun",
    radius: 5.0,
    color: 0xffff00,
    emissiveColor: 0xffff00,
    emissiveIntensity: 1.0,
    distance: 0,
    rotationSpeed: 0.2
  },
  {
    name: "Earth",
    radius: 1.0,
    color: 0xffffff, // 将使用纹理
    emissiveColor: 0x1122aa,
    emissiveIntensity: 0.1,
    distance: 20,
    orbitSpeed: 0.5,
    rotationSpeed: 1.0,
    hasTexture: true
  },
  {
    name: "Moon",
    radius: 0.27,
    color: 0xaaaaaa,
    emissiveColor: 0x555555,
    emissiveIntensity: 0.1,
    distance: 3,
    orbitSpeed: 2.0,
    rotationSpeed: 0.1,
    parentIndex: 1, // 绕地球运行
    hasTexture: true
  }
]

export default function BloomDemo() {
  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen()
  const guiRef = useRef<GUI | null>(null)

  // 场景参数
  const params = useRef({
    sunIntensity: 1.0,
    sunRadius: 5.0,
    earthDistance: 20,
    moonDistance: 3,
    bloomThreshold: 0.2,
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    rotating: true,
    timeScale: 1.0
  })

  // 存储天体引用
  const celestialBodiesRef = useRef<THREE.Object3D[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // 场景设置
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000510)

    // 添加场景光源
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5)
    scene.add(hemisphereLight)

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100)
    pointLight.position.set(0, 10, 0)
    scene.add(pointLight)

    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    )
    camera.position.set(0, 15, 35)
    camera.lookAt(0, 0, 0)

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    containerRef.current.appendChild(renderer.domElement)

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI
    controls.minDistance = 10
    controls.maxDistance = 100
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // 后期处理设置
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // 泛光通道设置
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      params.current.bloomStrength,
      params.current.bloomRadius,
      params.current.bloomThreshold
    )
    composer.addPass(bloomPass)

    // 添加背景星星
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 2000
    const starsPositions = new Float32Array(starsCount * 3)
    const starsSizes = new Float32Array(starsCount)

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3
      starsPositions[i3] = (Math.random() - 0.5) * 200
      starsPositions[i3 + 1] = (Math.random() - 0.5) * 200
      starsPositions[i3 + 2] = (Math.random() - 0.5) * 200
      starsSizes[i] = Math.random() * 2
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1))

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      sizeAttenuation: true,
      depthWrite: false
    })

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // 纹理加载器
    const textureLoader = new THREE.TextureLoader()
    let earthTexture: THREE.Texture | null = null
    let moonTexture: THREE.Texture | null = null

    // 加载地球和月球纹理
    Promise.all([
      new Promise<void>((resolve) => {
        textureLoader.load('/images/earth.jpg', (texture) => {
          earthTexture = texture
          resolve()
        })
      }),
      new Promise<void>((resolve) => {
        textureLoader.load('/images/moon.jpg', (texture) => {
          moonTexture = texture
          resolve()
        })
      })
    ]).then(() => {
      // 创建天体
      celestialData.forEach((bodyData, index) => {
        // 创建材质
        let material: THREE.Material
        if (bodyData.name === "Earth" && earthTexture) {
          material = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.5,
            metalness: 0.2,
            emissive: bodyData.emissiveColor,
            emissiveIntensity: bodyData.emissiveIntensity
          })
        } else if (bodyData.name === "Moon" && moonTexture) {
          material = new THREE.MeshStandardMaterial({
            map: moonTexture,
            roughness: 0.5,
            metalness: 0.2,
            emissive: bodyData.emissiveColor,
            emissiveIntensity: bodyData.emissiveIntensity
          })
        } else {
          material = new THREE.MeshStandardMaterial({
            color: bodyData.color,
            roughness: 0.5,
            metalness: 0.2,
            emissive: bodyData.emissiveColor,
            emissiveIntensity: bodyData.emissiveIntensity
          })
        }

        const geometry = new THREE.SphereGeometry(bodyData.radius, 32, 32)
        const body = new THREE.Mesh(geometry, material)

        // 如果是太阳，添加环境光
        if (bodyData.name === "Sun") {
          const light = new THREE.AmbientLight(0xffffff, 1)
          body.add(light)
        }

        // 如果有父天体，作为子对象添加
        if (bodyData.parentIndex !== undefined) {
          const parent = celestialBodiesRef.current[bodyData.parentIndex]

          // 创建一个空对象，用于控制轨道半径和旋转
          const orbitSystem = new THREE.Object3D()

          // 定位到轨道上
          body.position.x = bodyData.distance

          // 添加到轨道系统，然后添加到父对象
          orbitSystem.add(body)
          parent.add(orbitSystem)

          // 存储对象引用
          celestialBodiesRef.current.push(orbitSystem)
        } else {
          // 如果是主天体（太阳或地球）
          if (bodyData.distance > 0) {
            // 创建轨道
            const orbitGeometry = new THREE.RingGeometry(bodyData.distance - 0.1, bodyData.distance + 0.1, 90)
            const orbitMaterial = new THREE.MeshBasicMaterial({
              color: 0x444444,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.2
            })
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
            orbit.rotation.x = Math.PI / 2
            scene.add(orbit)

            // 定位到轨道上
            body.position.x = bodyData.distance
          }

          scene.add(body)
          celestialBodiesRef.current.push(body)
        }
      })
    })

    // GUI 设置
    const gui = new GUI({ container: containerRef.current })
    guiRef.current = gui

    // 泛光效果参数
    const bloomFolder = gui.addFolder("Bloom Effect")
    bloomFolder
      .add(params.current, "bloomThreshold", 0.0, 1.0, 0.01)
      .name("Threshold")
      .onChange((value: number) => {
        bloomPass.threshold = value
      })
    bloomFolder
      .add(params.current, "bloomStrength", 0.0, 3.0, 0.1)
      .name("Strength")
      .onChange((value: number) => {
        bloomPass.strength = value
      })
    bloomFolder
      .add(params.current, "bloomRadius", 0.0, 1.0, 0.01)
      .name("Radius")
      .onChange((value: number) => {
        bloomPass.radius = value
      })

    // 天体参数
    const bodiesFolder = gui.addFolder("Celestial Bodies")
    bodiesFolder
      .add(params.current, "sunRadius", 1.0, 10.0, 0.1)
      .name("Sun Radius")
      .onChange((value: number) => {
        const sun = celestialBodiesRef.current[0]
        if (sun && sun instanceof THREE.Mesh) {
          // 更新太阳半径
          sun.geometry.dispose()
          sun.geometry = new THREE.SphereGeometry(value, 32, 32)
        }
      })
    bodiesFolder
      .add(params.current, "sunIntensity", 0.1, 2.0, 0.1)
      .name("Sun Intensity")
      .onChange((value: number) => {
        const sun = celestialBodiesRef.current[0]
        if (sun && sun instanceof THREE.Mesh && sun.material instanceof THREE.MeshStandardMaterial) {
          // 更新太阳发光强度
          sun.material.emissiveIntensity = value
        }
      })
    bodiesFolder
      .add(params.current, "earthDistance", 10, 40, 1)
      .name("Earth Distance")
      .onChange((value: number) => {
        const earth = celestialBodiesRef.current[1]
        if (earth) {
          // 更新地球轨道距离
          earth.position.x = value

          // 更新轨道可视化
          scene.children.forEach(child => {
            if (child instanceof THREE.Mesh &&
                child.geometry instanceof THREE.RingGeometry &&
                child.geometry.parameters.innerRadius >= 19 &&
                child.geometry.parameters.innerRadius <= 21) {
              scene.remove(child)
              const orbitGeometry = new THREE.RingGeometry(value - 0.1, value + 0.1, 90)
              const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
              })
              const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
              orbit.rotation.x = Math.PI / 2
              scene.add(orbit)
            }
          })
        }
      })
    bodiesFolder
      .add(params.current, "moonDistance", 1, 5, 0.1)
      .name("Moon Distance")
      .onChange((value: number) => {
        // 注意：月球是地球的子对象，所以其索引为2
        const moon = celestialBodiesRef.current[2]
        if (moon && moon.children.length > 0 && moon.children[0] instanceof THREE.Mesh) {
          // 更新月球轨道距离
          moon.children[0].position.x = value
        }
      })

    // 动画控制
    const controlsFolder = gui.addFolder("Animation")
    controlsFolder.add(params.current, "rotating").name("Auto Rotate")
    controlsFolder.add(params.current, "timeScale", 0.1, 5.0, 0.1).name("Time Scale")

    // 默认打开 GUI
    gui.open()

    // 动画
    const clock = new THREE.Clock()

    function animate() {
      requestAnimationFrame(animate)

      const delta = clock.getDelta() * params.current.timeScale

      // 如果启用了动画，更新天体位置
      if (params.current.rotating && celestialBodiesRef.current.length > 0) {
        // 太阳自转
        const sun = celestialBodiesRef.current[0]
        if (sun) {
          sun.rotation.y += delta * celestialData[0].rotationSpeed
        }

        // 地球绕太阳公转和自转
        const earth = celestialBodiesRef.current[1]
        if (earth) {
          // 公转
          const earthOrbitSpeed = celestialData[1].orbitSpeed!
          const earthAngle = delta * earthOrbitSpeed
          const earthX = earth.position.x
          const earthZ = earth.position.z

          earth.position.x = earthX * Math.cos(earthAngle) - earthZ * Math.sin(earthAngle)
          earth.position.z = earthX * Math.sin(earthAngle) + earthZ * Math.cos(earthAngle)

          // 自转
          earth.rotation.y += delta * celestialData[1].rotationSpeed
        }

        // 月球绕地球公转
        const moon = celestialBodiesRef.current[2]
        if (moon) {
          moon.rotation.y += delta * celestialData[2].orbitSpeed!
        }
      }

      controls.update()

      // 使用后期处理渲染场景
      composer.render()
    }

    animate()

    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // 清理
    return () => {
      window.removeEventListener("resize", handleResize)

      // 清理几何体和材质
      celestialBodiesRef.current.forEach(body => {
        if (body instanceof THREE.Mesh) {
          body.geometry.dispose()
          if (body.material instanceof THREE.Material) {
            body.material.dispose()
          }
        }
      })

      if (guiRef.current) {
        guiRef.current.destroy()
      }

      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }

      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-900 overflow-hidden"
      ></div>
      <div className="absolute top-4 left-4">
        <FullscreenButton isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      </div>
    </div>
  )
}
