'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function Particles({ count = 30 }: { count?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 3 + 1, // 1 to 4 px
      duration: Math.random() * 20 + 10, // 10 to 30 seconds
      delay: Math.random() * 5, // 0 to 5 seconds delay
    }));
    setParticles(newParticles);
  }, [count]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
        setActive(inViewRef.current && document.visibilityState === 'visible');
      },
      { rootMargin: '80px 0px', threshold: 0.01 },
    );
    if (hostRef.current) observer.observe(hostRef.current);
    const handleVisibility = () =>
      setActive(inViewRef.current && document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {!reduceMotion && active
        ? particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white/30 shadow-[0_0_8px_2px_rgba(0,212,255,0.4)]"
              style={{
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: ['0vh', '-20vh', '0vh'],
                x: ['0vw', '5vw', '0vw'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'linear',
              }}
            />
          ))
        : null}
    </div>
  );
}
