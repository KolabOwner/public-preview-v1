// components/ui/animated-background.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
  showGrid?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  showGrid = true
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Grid pattern */}
      {showGrid && (
        <div className="absolute inset-0 bg-grid-white bg-[size:50px_50px] opacity-[0.02]" />
      )}

      {/* Gradient background */}
      <div className="relative left-0 top-0 overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))] w-full h-full">
        {/* SVG filter for gooey effect */}
        <svg className="hidden">
          <defs>
            <filter id="blurMe">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {/* Animated gradient blobs */}
        <div className="gradients-container h-full w-full">
          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full opacity-100 mix-blend-normal blur-3xl origin-[center_center]"
            style={{
              background: 'radial-gradient(circle, rgb(18, 113, 255) 0px, rgba(18, 113, 255, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full translate-x-[-80%] translate-y-[15%] opacity-100 mix-blend-normal blur-3xl origin-[calc(26%)]"
            style={{
              background: 'radial-gradient(circle, rgb(140, 100, 255) 0px, rgba(140, 100, 255, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              x: [-80, -100, -80],
              y: [15, 30, 15],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full translate-x-[40%] translate-y-[-15%] opacity-100 mix-blend-normal blur-3xl origin-[calc(100%)]"
            style={{
              background: 'radial-gradient(circle, rgb(100, 220, 255) 0px, rgba(100, 220, 255, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              x: [40, 60, 40],
              y: [-15, -30, -15],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full opacity-70 mix-blend-normal blur-3xl origin-[calc(10%-200px)]"
            style={{
              background: 'radial-gradient(circle, rgb(200, 50, 50) 0px, rgba(200, 50, 50, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.5, 0.7],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full opacity-100 mix-blend-normal blur-3xl origin-[calc(30%)_calc(30%)]"
            style={{
              background: 'radial-gradient(circle, rgb(50, 97, 180) 0px, rgba(50, 97, 180, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Teal accent blob */}
          <motion.div
            className="absolute left-[calc(50%-var(--size)/2)] top-[calc(50%-var(--size)/2)] h-[var(--size)] w-full opacity-60 mix-blend-normal blur-3xl origin-center"
            style={{
              background: 'radial-gradient(circle, rgb(72, 201, 176) 0px, rgba(72, 201, 176, 0) 50%) no-repeat',
              filter: 'blur(64px)',
            }}
            animate={{
              x: [0, 80, 0],
              y: [0, -80, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
};
