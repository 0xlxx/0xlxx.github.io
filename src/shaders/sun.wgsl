// 首页背景的「太阳」：体积光线步进，把旧站首页的 GLSL 着色器逐行移植到 WGSL。
// 原实现见 git 历史里的 main:app/components/materials/sun-shader.ts。
// 只做暗色一版——首页是深色专属页面，不提供浅色方案。

struct Params {
  time: f32,
  // vec2f 要 8 字节对齐，time 后面跟着的 4 字节是隐式 padding，结构体共 16 字节。
  resolution: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

@fragment
fn fs_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  // GLSL 的 gl_FragCoord 原点在左下，WGSL 的 @builtin(position) 原点在左上。
  // 这里换回 GL 约定，太阳的落点才和原版一致。
  let resolution = params.resolution;
  let fragCoord = vec2f(position.x, resolution.y - position.y);

  // 归一化到屏幕中心，按高度对齐纵横比（宽屏时向两侧延伸）。
  var uv = (fragCoord - resolution * 0.5) / resolution.y;
  uv -= vec2f(0.3);

  var stepSize = 0.002;
  var rayPos = vec3f(0.0);
  var color = vec4f(0.0);

  // 主光线步进：32 次迭代，步长自增，步长过小时提前收敛。
  for (var i = 0.0; i < 32.0; i += 1.0) {
    if (stepSize <= 0.001) {
      break;
    }

    // 到光源的距离决定发光强度，橙红色调（5, 2, 1）模拟太阳光谱。
    let distToCenter = length(uv - vec2f(0.1));
    color += vec4f(5.0, 2.0, 1.0, 0.0) / distToCenter;

    rayPos += vec3f(uv * stepSize, stepSize);

    // 沿 Y 轴的密度函数，模拟大气层的厚度。
    stepSize = 1.0 + rayPos.y;

    // 多尺度噪声叠加（fBm）：倍频累加，让光斑边缘有絮状细节。
    var noiseScale = 0.01;
    for (; noiseScale < 1.0; noiseScale += noiseScale) {
      let samplePos = rayPos / noiseScale;
      let noiseValue = sin(rayPos.z + params.time + samplePos);
      let noise = abs(dot(noiseValue, vec3f(1.0)));
      stepSize += noise * noiseScale * 0.1;
    }
  }

  // tanh 色调映射：把高动态范围压进 [0, 1]。
  // 中心点附近红色通道能累加到几万，有的驱动用 exp(2x) 实现 tanh，x 一大就
  // inf/inf = NaN（画面上是刺眼的青色小点）。超过 20 再算也是 1，先截断。
  // 累加值恒为非负，所以只需要压上界。
  let glow = tanh(min(color.rgb / 500.0, vec3f(20.0)));

  return vec4f(glow, 1.0);
}
