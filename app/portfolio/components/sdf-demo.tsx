"use client"

import { useRef, useState } from "react"
import { useFullscreen } from "../../hooks/useFullscreen"
import { useWebGL } from "../../hooks/useWebGL"
import FullscreenButton from "./fullscreen-button"

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

export default function SDFDemo() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

  // Render function for WebGL
  const handleRender = (gl: WebGLRenderingContext, program: WebGLProgram, elapsedTime: number) => {
    try {
      const canvas = gl.canvas as HTMLCanvasElement;

      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use the shader program
      gl.useProgram(program);

      // Get attribute and uniform locations
      const positionAttributeLocation = gl.getAttribLocation(program, 'aVertexPosition');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'uResolution');
      const timeUniformLocation = gl.getUniformLocation(program, 'uTime');

      // Set the vertex position attribute
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      // Set the uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);

      // Draw the square
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("WebGL render error:", message);
      setErrorMessage(`WebGL render error: ${message}`);
    }
  };

  // Use the WebGL hook
  const { canvasRef, error } = useWebGL({
    vertexShaderSource,
    fragmentShaderSource,
    onRender: handleRender
  });

  // Update error state if WebGL hook reports an error
  if (error && !errorMessage) {
    setErrorMessage(error);
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Error message display */}
      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 z-20">
          <div className="bg-red-900/80 p-4 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p>{errorMessage}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2">
        <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
      </div>
    </div>
  );
}
