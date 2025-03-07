"use client"

import { useEffect, useRef } from "react"

interface WebGLHookOptions {
  vertexShaderSource: string
  fragmentShaderSource: string
  onRender?: (gl: WebGLRenderingContext, program: WebGLProgram, elapsedTime: number) => void
}

interface WebGLHookReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  error: string | null
}

/**
 * Helper function to create and compile a shader
 */
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) {
    console.error('Failed to create shader')
    return null
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    console.error('An error occurred compiling the shader: ' + error)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 * Helper function to create and link a program
 */
function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) {
    console.error('Failed to create WebGL program')
    return null
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    console.error('Unable to initialize the shader program: ' + error)
    return null
  }

  return program
}

/**
 * A hook for managing WebGL rendering
 */
export function useWebGL({
  vertexShaderSource,
  fragmentShaderSource,
  onRender
}: WebGLHookOptions): WebGLHookReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const errorRef = useRef<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')

    if (!gl) {
      errorRef.current = 'WebGL is not supported in your browser'
      console.error(errorRef.current)
      return
    }

    // Set canvas size
    const resizeCanvas = () => {
      try {
        const { width, height } = canvas.getBoundingClientRect()
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        gl.viewport(0, 0, canvas.width, canvas.height)
      } catch (err) {
        errorRef.current = `Error resizing canvas: ${err instanceof Error ? err.message : String(err)}`
        console.error(errorRef.current)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create shader program
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    if (!program) {
      errorRef.current = 'Failed to create WebGL program'
      return
    }

    // Create a buffer for the vertex positions
    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) {
      errorRef.current = 'Failed to create position buffer'
      return
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Create a square that covers the entire canvas
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // Animation loop
    let startTime = Date.now()

    const render = () => {
      try {
        // Calculate time
        const currentTime = Date.now()
        const elapsedTime = (currentTime - startTime) / 1000.0 // Convert to seconds

        if (onRender) {
          onRender(gl, program, elapsedTime)
        }

        // Request next frame
        animationRef.current = requestAnimationFrame(render)
      } catch (err) {
        errorRef.current = `Render error: ${err instanceof Error ? err.message : String(err)}`
        console.error(errorRef.current)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }

    render()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Clean up WebGL resources
      gl.deleteProgram(program)
      gl.deleteBuffer(positionBuffer)
    }
  }, [vertexShaderSource, fragmentShaderSource, onRender])

  return {
    canvasRef,
    error: errorRef.current
  }
}
