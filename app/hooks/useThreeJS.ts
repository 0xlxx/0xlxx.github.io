"use client"

import { useRef, useEffect, useState, RefObject } from 'react'
import * as THREE from 'three'

interface UseThreeJSOptions {
  fragmentShader: string;
  vertexShader?: string;
  uniforms?: { [key: string]: THREE.IUniform };
  onRender?: (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, elapsed: number) => void;
}

interface UseThreeJSReturn {
  containerRef: RefObject<HTMLDivElement>;
  isRendering: boolean;
  error: string | null;
}

/**
 * A hook for Three.js rendering with hover activation
 * Only renders when the user hovers over the container
 */
export function useThreeJS({
  fragmentShader,
  vertexShader,
  uniforms: initialUniforms = {},
  onRender
}: UseThreeJSOptions): UseThreeJSReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const errorRef = useRef<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup renderer
    try {
      const container = containerRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Setup scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Setup camera (orthographic for Shadertoy-like behavior)
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;
      
      // Create plane geometry that fills the view
      const geometry = new THREE.PlaneGeometry(2, 2);
      
      // Setup default vertex shader if not provided
      const defaultVertexShader = vertexShader || `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `;
      
      // Setup uniforms
      const uniforms = {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector3() },
        ...initialUniforms
      };
      
      // Create shader material
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: defaultVertexShader,
        fragmentShader: fragmentShader,
      });
      materialRef.current = material;
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      
      // Handle resize
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        renderer.setSize(width, height);
        
        // Update resolution uniform
        if (material.uniforms.iResolution) {
          material.uniforms.iResolution.value.set(width, height, 1);
        }
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      // Animation function
      const animate = () => {
        if (!isRendering) return;
        
        const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
        
        // Update time uniform
        if (material.uniforms.iTime) {
          material.uniforms.iTime.value = elapsedTime;
        }
        
        // Call custom render function if provided
        if (onRender && renderer && scene && camera) {
          onRender(renderer, scene, camera, elapsedTime);
        }
        
        // Render scene
        renderer.render(scene, camera);
        
        // Request next frame
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Hover event handlers
      const handleMouseEnter = () => {
        if (!isRendering) {
          setIsRendering(true);
          startTimeRef.current = Date.now() - (material.uniforms.iTime?.value || 0) * 1000;
          animate();
        }
      };
      
      const handleMouseLeave = () => {
        setIsRendering(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
      
      // Add hover listeners
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      // Initial render to show a static frame
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      
      // Cleanup function
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        
        // Remove the canvas from the DOM
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        
        // Dispose of Three.js resources
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errorRef.current = `Three.js initialization error: ${message}`;
      console.error(errorRef.current);
    }
  }, [fragmentShader, vertexShader, onRender, initialUniforms]);
  
  return {
    containerRef,
    isRendering,
    error: errorRef.current
  };
}
