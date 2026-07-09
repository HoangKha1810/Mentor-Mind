'use client';

import { MouseEvent, ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowingCard({ children, className = '' }: GlowingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-soft backdrop-blur-md transition-colors hover:bg-white/[0.04] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(0, 212, 255, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full w-full">{children}</div>
    </motion.div>
  );
}
