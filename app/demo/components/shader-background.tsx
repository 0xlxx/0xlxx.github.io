"use client"

import { JSX, useEffect, useRef } from "react"
import * as THREE from "three"
import { animate } from "motion"
import { useTheme } from "next-themes"
import { cn } from "../../utils"
import {
  updateShaderTime,
  createShaderMaterial,
  updateShaderResolution,
  updateShaderTheme,
  updateShaderDevicePixelRatio,
  disposeShaderMaterial
} from "./materials/shader-material"

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
    const pixelRatio = window.devicePixelRatio;
    renderer.setPixelRatio(pixelRatio);

    // 初始化渲染器尺寸
    const { width, height } = updateRendererSize(renderer);
    rendererRef.current = renderer;

    // 创建填满屏幕的平面几何体
    const geometry = new THREE.PlaneGeometry(2, 2);

    // 创建着色器材质，使用封装好的函数
    const material = createShaderMaterial({
      darkColor: params.darkColor,
      lightColor: params.lightColor,
      speed: params.speed,
      isDarkMode: resolvedTheme === 'dark',
      resolution: new THREE.Vector2(width, height),
      devicePixelRatio: pixelRatio
    });
    materialRef.current = material;

    // 创建网格并添加到场景
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 立即触发一次 resize 事件以确保正确的初始尺寸
    handleResize();

    // 启动动画循环
    let startTime = Date.now();
    const animate = () => {
      if (!materialRef.current) return;

      // 计算时间并更新 uniform，使用封装好的函数
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // 转换为秒
      updateShaderTime(materialRef.current, elapsedTime, params.speed);

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
      disposeShaderMaterial(material); // 使用封装好的函数释放资源
    };
  }, []); // 移除依赖项，避免重新创建场景

  // 处理主题变化
  useEffect(() => {
    if (!materialRef.current) return;

    // 更新着色器 uniforms，使用封装好的函数
    updateShaderTheme(materialRef.current, resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // 更新渲染器尺寸的函数
  function updateRendererSize(renderer: THREE.WebGLRenderer): { width: number, height: number } {
    if (!canvasRef.current || !containerRef.current) return { width: 0, height: 0 };

    // 使用 clientWidth 和 clientHeight 代替 window.innerWidth 和 window.innerHeight
    // 这样可以获取到更准确的容器尺寸
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height, false);
    return { width, height };
  }

  // 处理窗口大小变化
  function handleResize(): void {
    if (!rendererRef.current) return;

    // 使用 requestAnimationFrame 以避免在同一帧中多次更新
    requestAnimationFrame(() => {
      if (!rendererRef.current) return;

      const pixelRatio = window.devicePixelRatio;
      rendererRef.current.setPixelRatio(pixelRatio);

      const { width, height } = updateRendererSize(rendererRef.current);

      // 确保材质的分辨率也被更新
      if (materialRef.current) {
        updateShaderResolution(materialRef.current, width, height);
        updateShaderDevicePixelRatio(materialRef.current, pixelRatio);
      }

      // 强制渲染一帧以确保更新
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full overflow-hidden dark:bg-black bg-white",
                 className)}
      style={{viewTransitionName:"none"}}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
