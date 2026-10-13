export const fragmentShaderSource = /* glsl */ `
precision highp float;
precision highp int;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uDarkColor;
uniform vec3 uLightColor;
uniform bool uIsDarkMode;
uniform float uDevicePixelRatio;
varying vec2 vUv;

const float PI = 3.1415926535897932384626433832795;

void main() {
  // 归一化坐标到屏幕中心，调整纵横比
  vec2 resolution = uResolution * uDevicePixelRatio;
  vec2 uv = (gl_FragCoord.xy - resolution.xy * 0.5) / resolution.y;
  
  uv -= 0.3; // 向下偏移太阳位置
  
  // 初始化变量
  float stepSize = 0.002;        // 光线步进大小
  float iteration = 0.0;         // 迭代计数器
  float noiseScale;              // 噪声缩放因子
  vec3 rayPos = vec3(0.0);       // 光线位置（3D 体积渲染）
  vec4 color = vec4(0.0);        // 累积颜色
  
  // 主光线行进循环（Ray Marching）：32 次迭代
  for (float i = 0.0; i < 32.0; i++) {
    iteration = i;
    
    // 当步长过小时提前退出优化
    if (stepSize <= 0.001) break;
    
    // 计算当前像素到光源的距离，添加发光效果
    // 橙红色调（5,2,1）模拟太阳光谱
    float distToCenter = length(uv - 0.1);
    color += vec4(5.0, 2.0, 1.0, 0.0) / distToCenter;
    
    // 更新光线位置：沿视线方向前进
    rayPos += vec3(uv * stepSize, stepSize);
    
    // 基于 Y 坐标的密度函数（模拟大气层厚度）
    stepSize = 1.0 + rayPos.y;
    
    // 多尺度噪声叠加（Fractal Brownian Motion）
    for (noiseScale = 0.01; noiseScale < 1.0; noiseScale += noiseScale) {
      // 基于正弦函数的伪随机噪声
      vec3 samplePos = rayPos / noiseScale;
      vec3 noiseValue = sin(rayPos.z + uTime + samplePos);
      
      // 归一化噪声向量并累积到步长
      float noise = abs(dot(noiseValue, vec3(1.0)));
      stepSize += noise * noiseScale * 0.1;
    }
  }
  
  // 色调映射：tanh 将高动态范围压缩到 [0,1]
  color = tanh(color / 500.0);
  
  gl_FragColor = vec4(color.rgb, 1.0);
}
`;