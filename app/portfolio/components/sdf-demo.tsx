"use client"

import { useEffect, useRef } from "react"

// Vertex shader source
const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

// Fragment shader source with enhanced SDF implementation for portfolio
const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 uResolution;
  uniform float uTime;

  // Signed distance function for a circle
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // Signed distance function for a rectangle
  float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  // Signed distance function for a hexagon
  float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
  }

  // Smooth min function for blending shapes
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Rotation matrix
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    // Normalize coordinates
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

    // Animate positions using time
    float time = uTime * 0.5;
    vec2 circlePos = vec2(sin(time) * 0.3, cos(time * 0.7) * 0.2);
    vec2 boxPos = vec2(cos(time * 0.8) * 0.3, sin(time * 0.5) * 0.2);
    vec2 hexPos = vec2(sin(time * 0.6) * 0.2, cos(time * 0.9) * 0.3);

    // Rotate some shapes
    vec2 rotatedUV = rotate2d(time * 0.3) * (uv - boxPos) + boxPos;

    // Calculate SDFs
    float circle = sdCircle(uv - circlePos, 0.2);
    float box = sdBox(rotatedUV - boxPos, vec2(0.15, 0.15));
    float hexagon = sdHexagon(uv - hexPos, 0.15);

    // Blend shapes
    float d = smin(circle, box, 0.2);
    d = smin(d, hexagon, 0.15);

    // Color based on distance
    vec3 col = vec3(0.0);

    // Background gradient
    vec3 bgColor = mix(
      vec3(0.1, 0.1, 0.2),
      vec3(0.05, 0.05, 0.1),
      length(uv)
    );

    // Glow effect with dynamic colors
    vec3 glowColor = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
    col += glowColor * (1.0 - smoothstep(0.0, 0.15, d));

    // Outline
    col += vec3(0.2, 0.8, 1.0) * (1.0 - smoothstep(0.0, 0.02, abs(d)));

    // Mix with background
    col = mix(bgColor, col, col);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Helper function to create and compile a shader
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Helper function to create and link a program
function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

export default function SDFDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create shader program
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    // Create a buffer for the vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create a square that covers the entire canvas
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'aVertexPosition');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'uResolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'uTime');

    // Animation loop
    let startTime = Date.now();

    const render = () => {
      // Calculate time
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000.0; // Convert to seconds

      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use the shader program
      gl.useProgram(program);

      // Set the vertex position attribute
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Set the uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);

      // Draw the square
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Request next frame
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clean up WebGL resources
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
