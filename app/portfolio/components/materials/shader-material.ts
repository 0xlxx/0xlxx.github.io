import * as THREE from 'three';
import { useTheme } from 'next-themes';

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
  uniform float uDevicePixelRatio;
  varying vec2 vUv;

  void main() {
    // 归一化坐标
    vec2 r = uResolution.xy;
    vec2 FC = gl_FragCoord.xy;

    // 考虑设备像素比例
    FC = FC / uDevicePixelRatio;

    // 使用屏幕尺寸作为参考
    vec2 center = r * 0.5;

    // 将坐标缩放为更小的范围，使效果更集中，并将坐标偏移到中心点
    vec2 p = (FC.xy - center) / (r.y * 0.25); // 使用中心点作为缩放参考点，增加缩放系数使效果变大

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

// 着色器参数默认值
const defaultParams = {
  darkColor: { r: 0.05, g: 0.05, b: 0.1 }, // 暗色模式背景色
  lightColor: { r: 0.98, g: 0.98, b: 1.0 }, // 亮色模式背景色
  speed: 0.5, // 动画速度
};

/**
 * 着色器材质参数接口
 */
export interface ShaderMaterialParams {
  darkColor?: { r: number; g: number; b: number };
  lightColor?: { r: number; g: number; b: number };
  speed?: number;
  isDarkMode?: boolean;
  resolution?: THREE.Vector2;
  devicePixelRatio?: number;
}

/**
 * 创建自定义着色器材质
 * @param params - 着色器材质参数
 * @returns THREE.ShaderMaterial - 创建的着色器材质
 */
export function createShaderMaterial(params?: ShaderMaterialParams): THREE.ShaderMaterial {
  // 合并默认参数和用户提供的参数
  const mergedParams = {
    darkColor: params?.darkColor || defaultParams.darkColor,
    lightColor: params?.lightColor || defaultParams.lightColor,
    speed: params?.speed || defaultParams.speed,
    isDarkMode: params?.isDarkMode !== undefined ? params.isDarkMode : false,
    devicePixelRatio: params?.devicePixelRatio || window.devicePixelRatio,
    resolution: params?.resolution || new THREE.Vector2(window.innerWidth, window.innerHeight),
  };

  // 创建着色器材质
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: mergedParams.resolution },
      uDevicePixelRatio: { value: mergedParams.devicePixelRatio },
      uDarkColor: { value: new THREE.Vector3(mergedParams.darkColor.r, mergedParams.darkColor.g, mergedParams.darkColor.b) },
      uLightColor: { value: new THREE.Vector3(mergedParams.lightColor.r, mergedParams.lightColor.g, mergedParams.lightColor.b) },
      uIsDarkMode: { value: mergedParams.isDarkMode },
    },
    transparent: true,
  });

  return material;
}

/**
 * 更新着色器材质的时间参数
 * @param material - 要更新的着色器材质
 * @param elapsedTime - 经过的时间（秒）
 * @param speed - 动画速度
 */
export function updateShaderTime(material: THREE.ShaderMaterial, elapsedTime: number, speed: number = defaultParams.speed): void {
  if (material && material.uniforms) {
    material.uniforms.uTime.value = elapsedTime * speed;
  }
}

/**
 * 更新着色器材质的分辨率参数
 * @param material - 要更新的着色器材质
 * @param width - 宽度
 * @param height - 高度
 */
export function updateShaderResolution(material: THREE.ShaderMaterial, width: number, height: number): void {
  if (material && material.uniforms && material.uniforms.uResolution) {
    // 确保宽度和高度是有效的正数
    const validWidth = Math.max(1, width || 1);
    const validHeight = Math.max(1, height || 1);
    material.uniforms.uResolution.value.set(validWidth, validHeight);
  }
}

/**
 * 更新着色器材质的设备像素比例
 * @param material - 要更新的着色器材质
 * @param devicePixelRatio - 设备像素比例
 */
export function updateShaderDevicePixelRatio(material: THREE.ShaderMaterial, devicePixelRatio: number): void {
  if (material && material.uniforms && material.uniforms.uDevicePixelRatio) {
    material.uniforms.uDevicePixelRatio.value = devicePixelRatio;
  }
}

/**
 * 更新着色器材质的主题模式
 * @param material - 要更新的着色器材质
 * @param isDarkMode - 是否为暗色模式
 */
export function updateShaderTheme(material: THREE.ShaderMaterial, isDarkMode: boolean): void {
  if (material && material.uniforms) {
    material.uniforms.uIsDarkMode.value = isDarkMode;
  }
}

/**
 * 释放着色器材质资源
 * @param material - 要释放的着色器材质
 */
export function disposeShaderMaterial(material: THREE.ShaderMaterial): void {
  if (material) {
    material.dispose();
  }
}
