"use client"

import { JSX, useEffect, useRef } from "react"
import * as THREE from "three"
import { animate } from "motion"
import { useTheme } from "next-themes"
import { cn } from "../../utils"

// 顶点着色器源码
const vertexShaderSource = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 片段着色器源码
const fragmentShaderSource = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uDarkColor;
  uniform vec3 uLightColor;
  uniform bool uIsDarkMode;
  varying vec2 vUv;

  void main() {
    // 归一化坐标
    vec2 r = uResolution.xy;
    vec2 FC = gl_FragCoord.xy;

    // 计算中心点
    vec2 center = r;

    // 将坐标缩放为更小的范围，使效果更集中，并将坐标偏移到中心点
    vec2 p = (FC.xy - center) / (r.y * 0.5); // 使用中心点作为缩放参考点，增加缩放系数使效果变大

    vec2 l;
    vec2 v = p * (1.0 - (l += abs(0.7 - dot(p, p)))) / 0.2;

    // 初始化输出颜色
    vec4 o = vec4(0.0);

    // 主要着色器循环
    for(float i = 0.0; i < 8.0; i++) {
      i += 1.0;
      o += (sin(v.xyyx) + 1.0) * abs(v.x - v.y) * 0.2;
      v += cos(v.yx * i + vec2(0.0, i) + uTime) / i + 0.7;
    }

    // 应用颜色变换
    o = tanh(exp(p.y * vec4(1.0, -1.0, -2.0, 0.0)) * exp(-4.0 * l.x) / o);

    // 根据主题应用不同的颜色调整
    vec3 finalColor;
    if (uIsDarkMode) {
      // 暗色模式 - 深色背景，明亮的图案
      finalColor = mix(uDarkColor, vec3(o.rgb), o.rgb * 1.2);
    } else {
      // 亮色模式 - 浅色背景，深色图案
      finalColor = mix(uLightColor, vec3(1.0) - o.rgb, o.rgb * 0.8);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface ShaderBackgroundProps {
  className?: string;
}

export default function ShaderBackground({ className }: ShaderBackgroundProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();

  // 着色器参数
  const params = {
    darkColor: { r: 0.05, g: 0.05, b: 0.1 }, // 暗色模式背景色
    lightColor: { r: 0.98, g: 0.98, b: 1.0 }, // 亮色模式背景色
    speed: 0.5, // 动画速度
  };

  // 设置 UI 动画
  useEffect(() => {
    if (containerRef.current) {
      // 容器淡入动画
      animate(
        containerRef.current,
        { opacity: [0, 1] },
        { duration: 0.5 }
      );
    }
  }, []);

  // 初始化 Three.js 场景
  useEffect(() => {
    if (!canvasRef.current) return;

    // 设置场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 设置正交相机（用于 2D 效果）
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // 设置渲染器并优化性能
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false, // 禁用抗锯齿以提高性能
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump' // 使用中等精度以提高性能
    });

    // 设置像素比例并限制以提高性能
    renderer.setPixelRatio(window.devicePixelRatio);

    // 初始化渲染器尺寸
    updateRendererSize(renderer);
    rendererRef.current = renderer;

    // 创建填满屏幕的平面几何体
    const geometry = new THREE.PlaneGeometry(2, 2);

    // 创建着色器材质
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uDarkColor: { value: new THREE.Vector3(params.darkColor.r, params.darkColor.g, params.darkColor.b) },
        uLightColor: { value: new THREE.Vector3(params.lightColor.r, params.lightColor.g, params.lightColor.b) },
        uIsDarkMode: { value: resolvedTheme === 'dark' }
      },
    });
    materialRef.current = material;

    // 更新分辨率 uniform
    updateResolutionUniform();

    // 创建网格并添加到场景
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 启动动画循环
    let startTime = Date.now();
    const animate = () => {
      if (!materialRef.current) return;

      // 计算时间并更新 uniform
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // 转换为秒
      materialRef.current.uniforms.uTime.value = elapsedTime * params.speed;

      // 渲染场景
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // 继续动画循环
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // 清理函数
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []); // 移除依赖项，避免重新创建场景

  // 处理主题变化
  useEffect(() => {
    if (!materialRef.current) return;

    // 更新着色器 uniforms
    materialRef.current.uniforms.uIsDarkMode.value = resolvedTheme === 'dark';
  }, [resolvedTheme]);

  // 更新渲染器尺寸的函数
  function updateRendererSize(renderer: THREE.WebGLRenderer) {
    if (!canvasRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height, false);
  }

  // 更新分辨率 uniform 的函数
  function updateResolutionUniform() {
    if (!materialRef.current || !rendererRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    materialRef.current.uniforms.uResolution.value.set(width, height);
  }

  // 处理窗口大小变化
  function handleResize() {
    if (!rendererRef.current) return;

    // 使用 requestAnimationFrame 以避免在同一帧中多次更新
    requestAnimationFrame(() => {
      updateRendererSize(rendererRef.current!);
      updateResolutionUniform();

      // 强制渲染一帧以确保更新
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 w-full h-full overflow-hidden dark:bg-black bg-white",
                 className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
