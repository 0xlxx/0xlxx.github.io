"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useFullscreen } from "../../hooks/useFullscreen"
import FullscreenButton from "./fullscreen-button"
import { motion } from "motion/react"
import { GUI } from "lil-gui"

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
  varying vec2 vUv;

  void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv;

    // Center coordinates
    vec2 center = vec2(0.5, 0.5);

    // Black hole effect
    vec2 p = (vUv * 2.0 - 1.0) * (uResolution.xy / uResolution.y);
    float brightness = uIntensity / abs(length(p) - uRadius + uDistortion/(p.x-p.y));

    // Add some time-based animation for subtle movement
    float angle = uTime * 0.2;
    p = vec2(
      p.x * cos(angle) - p.y * sin(angle),
      p.x * sin(angle) + p.y * cos(angle)
    );

    // Create the black hole color
    vec3 col = vec3(brightness * 0.1, brightness * 0.2, brightness * 0.3);

    // Add a subtle glow around the black hole
    float glow = 0.015 / length(p);
    col += vec3(glow * 0.5, glow * 0.7, glow);

    // Output to screen
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PulseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number | null>(null);
  const guiRef = useRef<GUI | null>(null);
  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

  // Parameters for the black hole effect
  const [params] = useState({
    intensity: 0.1,
    radius: 0.5,
    distortion: 0.01
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera (orthographic for 2D effect)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    rendererRef.current = renderer;

    // Create a plane geometry that fills the screen
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(canvasRef.current.width, canvasRef.current.height) },
        uIntensity: { value: params.intensity },
        uRadius: { value: params.radius },
        uDistortion: { value: params.distortion }
      },
    });
    materialRef.current = material;

    // Create mesh and add to scene
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Setup GUI controls
    const gui = new GUI({ title: 'Black Hole Settings' });
    gui.add(params, 'intensity', 0.01, 0.5).onChange((value: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uIntensity.value = value;
      }
    });
    gui.add(params, 'radius', 0.1, 1.0).onChange((value: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uRadius.value = value;
      }
    });
    gui.add(params, 'distortion', 0.001, 0.05).onChange((value: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uDistortion.value = value;
      }
    });
    gui.close(); // Start with closed panel
    guiRef.current = gui;

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !materialRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      rendererRef.current.setSize(width, height);
      materialRef.current.uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize)
    // Animation loop
    const animate = (time: number) => {
      if (materialRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        // Update time uniform
        materialRef.current.uniforms.uTime.value = time * 0.001; // Convert to seconds

        // Render
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
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
    <div ref={containerRef} className="w-screen h-screen bg-black absolute left-0 top-0 pointer-events-none -z-1">
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
      <div className="absolute top-4 left-4">
        <FullscreenButton isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      </div>
    </div>
  );
}
