"use client";

import { useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useFullscreen } from "../../hooks/useFullscreen";
import FullscreenButton from "./fullscreen-button";

export default function CSSDemo() {
  const { toggleFullscreen, isFullscreen, containerRef } = useFullscreen();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate position as percentage of container
      const posX = (x / rect.width) * 100;
      const posY = (y / rect.height) * 100;

      // Update CSS variables for the glow effect
      container.style.setProperty("--x", `${posX}%`);
      container.style.setProperty("--y", `${posY}%`);
    };

    // Add event listener for mouse movement
    container.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black overflow-hidden"
      style={
        {
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties
      }
    >

      <div className="absolute top-2 left-2 z-99">
        <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
      </div>

      {/* Card container with interactive glow effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="card-container w-64 h-80 perspective-1000"
          style={{
            transform:
              "rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg))",
          }}
        >
          <div
            className="card relative w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 transition-all duration-200 transform-gpu"
            style={{
              boxShadow:
                "0 0 30px 5px rgba(var(--glow-color, 103, 232, 249), 0.3)",
              background: `
                radial-gradient(
                  circle at var(--x) var(--y),
                  rgba(255, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0) 50%
                ),
                linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)
              `,
            }}
          >
            <div className="card-content bg-gray-900 w-full h-full rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="text-xl font-bold text-white mb-2">
                  响应式卡片
                </div>
                <div className="text-sm text-gray-300">
                  使用纯CSS实现的交互式卡片效果
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70"
                  />
                ))}
              </div>

              <div className="mt-4">
                <div className="w-full h-8 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
