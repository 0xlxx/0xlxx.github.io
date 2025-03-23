"use client"

import { useEffect, useRef, useState } from "react"
import { useFullscreen } from "../hooks/useFullscreen"
import FullscreenButton from "./components/fullscreen-button"
import { GUI } from "lil-gui"
import * as THREE from "three"
import {cn} from "../utils"

// Vertex shader source
const vertexShaderSource = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader source for modern SDF animation
const fragmentShaderSource = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uSmoothness;
  varying vec2 vUv;

  // SDF for a circle
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // SDF for a rounded box
  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // Smooth minimum function
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }

  // Rotation matrix
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    // Normalized pixel coordinates
    vec2 uv = vUv;
    vec2 p = (2.0 * uv - 1.0) * (uResolution.xy / min(uResolution.x, uResolution.y));

    // Time variables for animation
    float time = uTime * uSpeed;

    // Initialize distance
    float d = 1000.0;

    // Create multiple animated shapes
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float timeOffset = fi * 1.618;

      // Position offset with animation
      vec2 pos = vec2(
        sin(time * 0.5 + timeOffset) * 0.5,
        cos(time * 0.3 + timeOffset) * 0.3
      );

      // Rotate the space
      vec2 rp = rotate2d(time * 0.2 + fi * 0.5) * (p - pos);

      // Create different shapes based on index
      float shape;
      if (i % 2 == 0) {
        // Circle
        shape = sdCircle(rp, 0.2 + 0.1 * sin(time + fi));
      } else {
        // Rounded box
        vec2 boxSize = vec2(0.15 + 0.05 * sin(time * 0.7 + fi), 0.15 + 0.05 * cos(time * 0.7 + fi));
        shape = sdRoundBox(rp, boxSize, 0.05);
      }

      // Combine shapes with smooth minimum
      d = smin(d, shape, uSmoothness);
    }

    // Create color gradient based on distance field
    vec3 col = mix(uColor1, uColor2, smoothstep(-0.1, 0.1, sin(d * uScale + time)));

    // Add subtle glow effect
    float glow = 0.015 / (abs(d) + 0.1);
    col += glow * uColor1;

    // White background
    col = mix(vec3(1.0), col, smoothstep(0.0, 0.01, abs(d)));

    // Output to screen
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SDFBackground({className}: {className?: string}) {
  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const guiRef = useRef<GUI | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parameters for the SDF animation
  const [params] = useState({
    color1: [0.3, 0.4, 0.9],  // Blue-ish
    color2: [0.9, 0.3, 0.5],  // Pink-ish
    speed: 0.5,
    scale: 10.0,
    smoothness: 0.2
  });

  // Setup Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      });

      // Set pixel ratio for better display on high DPI screens
      renderer.setPixelRatio(window.devicePixelRatio);

      // Get the size from the canvas container
      const container = canvasRef.current.parentElement;
      if (!container) throw new Error('Canvas container not found');

      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);

      // Create scene and camera
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Create shader material
      const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uColor1: { value: new THREE.Vector3(...params.color1) },
        uColor2: { value: new THREE.Vector3(...params.color2) },
        uSpeed: { value: params.speed },
        uScale: { value: params.scale },
        uSmoothness: { value: params.smoothness }
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
        uniforms,
        transparent: true
      });

      // Create a plane that fills the screen
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      // Store references
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      materialRef.current = material;

      // Handle window resize
      const handleResize = () => {
        if (!container || !renderer || !material.uniforms.uResolution) return;

        const { width, height } = container.getBoundingClientRect();
        renderer.setSize(width, height);
        material.uniforms.uResolution.value.set(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Animation loop
      const startTime = Date.now();

      const animate = () => {
        if (!scene || !camera || !renderer || !material) return;

        const elapsedTime = (Date.now() - startTime) / 1000;
        material.uniforms.uTime.value = elapsedTime;

        renderer.render(scene, camera);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Dispose Three.js resources
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch (err) {
      setError(`Error initializing Three.js: ${err instanceof Error ? err.message : String(err)}`);
      console.error(err);
    }
  }, [params.color1, params.color2, params.scale, params.smoothness, params.speed]);

  // Setup GUI controls
  useEffect(() => {
    const gui = new GUI({ title: 'SDF Animation Settings' });

    // Add color controls
    const color1Folder = gui.addFolder('Color 1');
    color1Folder.add(params.color1, 0, 0, 1).name('R').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor1) {
        materialRef.current.uniforms.uColor1.value.x = value;
      }
    });
    color1Folder.add(params.color1, 1, 0, 1).name('G').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor1) {
        materialRef.current.uniforms.uColor1.value.y = value;
      }
    });
    color1Folder.add(params.color1, 2, 0, 1).name('B').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor1) {
        materialRef.current.uniforms.uColor1.value.z = value;
      }
    });

    const color2Folder = gui.addFolder('Color 2');
    color2Folder.add(params.color2, 0, 0, 1).name('R').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor2) {
        materialRef.current.uniforms.uColor2.value.x = value;
      }
    });
    color2Folder.add(params.color2, 1, 0, 1).name('G').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor2) {
        materialRef.current.uniforms.uColor2.value.y = value;
      }
    });
    color2Folder.add(params.color2, 2, 0, 1).name('B').onChange((value: number) => {
      if (materialRef.current?.uniforms.uColor2) {
        materialRef.current.uniforms.uColor2.value.z = value;
      }
    });

    // Add other controls
    gui.add(params, 'speed', 0.1, 2.0).name('Animation Speed').onChange((value: number) => {
      if (materialRef.current?.uniforms.uSpeed) {
        materialRef.current.uniforms.uSpeed.value = value;
      }
    });
    gui.add(params, 'scale', 1.0, 20.0).name('Pattern Scale').onChange((value: number) => {
      if (materialRef.current?.uniforms.uScale) {
        materialRef.current.uniforms.uScale.value = value;
      }
    });
    gui.add(params, 'smoothness', 0.01, 0.5).name('Blend Smoothness').onChange((value: number) => {
      if (materialRef.current?.uniforms.uSmoothness) {
        materialRef.current.uniforms.uSmoothness.value = value;
      }
    });

    gui.close(); // Start with closed panel
    guiRef.current = gui;

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
      }
    };
  }, [params]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div ref={containerRef} className={cn("w-screen h-screen bg-white absolute left-0 top-0 pointer-events-none -z-1", className)}>
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
      />
      <div className="absolute top-4 left-4">
        <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
      </div>
    </div>
  );
}