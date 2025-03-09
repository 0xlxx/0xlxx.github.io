"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useFullscreen } from "../../hooks/useFullscreen"
import FullscreenButton from "./fullscreen-button"
import { animate } from "motion"
import { GUI } from "lil-gui"
import { cn } from "../../utils"
import { useTheme } from "next-themes"

// Vertex shader source
const vertexShaderSource = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader source for black hole effect
const fragmentShaderSource = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform float uRadius;
  uniform float uDistortion;
  uniform vec3 uAccentColor;
  varying vec2 vUv;

  void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv;

    // Center coordinates (moved to the right)
    vec2 center = vec2(0.6, 0.5);

    // Black hole effect
    vec2 p = ((vUv - vec2(0.01, 0.01) * sin(uTime * 0.2)) * 2.0 - 1.0) * (uResolution.xy / uResolution.y);
    float light = (sin(uTime * 3.0) + 1.0) * 0.125 * 0.5 + 0.5;
    float brightness = uIntensity * light / abs(length(p) - uRadius + uDistortion/(p.x-p.y));

    // Add some time-based animation for subtle movement
    float angle = uTime * 0.2;
    p = vec2(
      p.x * cos(angle) - p.y * sin(angle),
      p.x * sin(angle) + p.y * cos(angle)
    );

    // Create the black hole color using the accent color uniform
    vec3 col = vec3(brightness * uAccentColor.r, brightness * uAccentColor.g, brightness * uAccentColor.b);

    // Add a subtle glow around the black hole
    float glow = 0.015 / length(p);
    col += vec3(glow * uAccentColor.r * 0.5, glow * uAccentColor.g * 0.7, glow * uAccentColor.b);

    // Output to screen
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function BlackHoleBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number | null>(null);
  const guiRef = useRef<GUI | null>(null);
  const { containerRef: fullscreenRef, isFullscreen, toggleFullscreen } = useFullscreen();
  const { theme } = useTheme();

  // Parameters for the black hole effect with theme-aware defaults
  const [params] = useState({
    intensity: 0.1,
    radius: 0.5,
    distortion: 0.01,
    accentColor: { r: 0.1, g: 0.2, b: 0.3 } // Default accent color (can be changed via GUI)
  });

  // Update accent color based on theme
  // useEffect(() => {
  //   if (!materialRef.current) return;

  //   // Set theme-specific colors
  //   if (theme === 'dark') {
  //     // Blue-purple glow for dark theme
  //     params.accentColor.r = 0.1;
  //     params.accentColor.g = 0.2;
  //     params.accentColor.b = 0.5;
  //   } else {
  //     // Warm orange-gold glow for light theme
  //     params.accentColor.r = 0.5;
  //     params.accentColor.g = 0.3;
  //     params.accentColor.b = 0.1;
  //   }

  //   // Update shader uniform
  //   materialRef.current.uniforms.uAccentColor.value.set(
  //     params.accentColor.r,
  //     params.accentColor.g,
  //     params.accentColor.b
  //   );

  //   // Update GUI if it exists
  //   if (guiRef.current) {
  //     guiRef.current.controllers.forEach(controller => {
  //       controller.updateDisplay();
  //     });
  //   }
  // }, [theme, params]);

  // Setup animation for UI elements
  useEffect(() => {
    if (containerRef.current) {
      // Animate container opacity
      animate(
        containerRef.current,
        { opacity: [0, 1] },
        { duration: 0.5 }
      );
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera (orthographic for 2D effect)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Setup renderer with performance optimizations
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false, // Disable antialiasing for performance
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump' // Use medium precision for better performance
    });

    // Set pixel ratio with a cap for performance
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    rendererRef.current = renderer;

    // Create a plane geometry that fills the screen
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Create shader material with accent color support
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(canvasRef.current.width, canvasRef.current.height) },
        uIntensity: { value: params.intensity },
        uRadius: { value: params.radius },
        uDistortion: { value: params.distortion },
        uAccentColor: { value: new THREE.Vector3(params.accentColor.r, params.accentColor.g, params.accentColor.b) }
      },
    });
    materialRef.current = material;

    // Create mesh and add to scene
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Setup GUI controls
    // const gui = new GUI({ title: 'Black Hole Settings', container: containerRef.current! });
    // gui.add(params, 'intensity', 0.01, 0.5).onChange((value: number) => {
    //   if (materialRef.current) {
    //     materialRef.current.uniforms.uIntensity.value = value;
    //   }
    // });
    // gui.add(params, 'radius', 0.1, 1.0).onChange((value: number) => {
    //   if (materialRef.current) {
    //     materialRef.current.uniforms.uRadius.value = value;
    //   }
    // });
    // gui.add(params, 'distortion', 0.001, 0.05).onChange((value: number) => {
    //   if (materialRef.current) {
    //     materialRef.current.uniforms.uDistortion.value = value;
    //   }
    // });

    // Add color controls
    // const colorFolder = gui.addFolder('Accent Color');
    // colorFolder.add(params.accentColor, 'r', 0, 1).name('Red').onChange(updateAccentColor);
    // colorFolder.add(params.accentColor, 'g', 0, 1).name('Green').onChange(updateAccentColor);
    // colorFolder.add(params.accentColor, 'b', 0, 1).name('Blue').onChange(updateAccentColor);

    function updateAccentColor() {
      if (materialRef.current) {
        materialRef.current.uniforms.uAccentColor.value.set(
          params.accentColor.r,
          params.accentColor.g,
          params.accentColor.b
        );
      }
    }

    // gui.close(); // Start with closed panel
    // guiRef.current = gui;

    // Efficient resize handler with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvasRef.current || !rendererRef.current || !materialRef.current) return;

        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;

        rendererRef.current.setSize(width, height);
        materialRef.current.uniforms.uResolution.value.set(width, height);
      }, 100); // 100ms debounce
    };

    window.addEventListener('resize', handleResize);

    // Animation loop with performance optimizations
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30 FPS for performance
    const frameInterval = 1000 / targetFPS;

    const animate = (time: number) => {
      const elapsed = time - lastTime;

      if (elapsed > frameInterval) {
        lastTime = time - (elapsed % frameInterval);

        if (materialRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
          // Update time uniform
          materialRef.current.uniforms.uTime.value = time / 1000; // Convert to seconds

          // Render
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      clearTimeout(resizeTimeout);

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      if (guiRef.current) {
        guiRef.current.destroy();
      }

      window.removeEventListener('resize', handleResize);

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      if (geometry) {
        geometry.dispose();
      }

      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [params]);

  return (
    <div ref={fullscreenRef} className={cn("relative w-full h-full bg-black", className)}>
      {/* <div
        ref={containerRef}
        className="absolute top-4 left-4 z-10"
      >
        <FullscreenButton
          isFullscreen={isFullscreen}
          onClick={toggleFullscreen}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
        />
      </div> */}
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
    </div>
  );
}
