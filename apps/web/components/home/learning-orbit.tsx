'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, ReactNode, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const LearningOrbitScene = dynamic(() => import('./learning-orbit-scene'), {
  ssr: false,
  loading: () => <OrbitFallback />,
});

export function LearningOrbit() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [webGlAvailable, setWebGlAvailable] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const updateMobile = () => setMobile(media.matches);
    updateMobile();
    media.addEventListener('change', updateMobile);

    const canvas = document.createElement('canvas');
    setWebGlAvailable(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin: '120px 0px', threshold: 0.08 },
    );
    if (hostRef.current) observer.observe(hostRef.current);

    const handleVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      media.removeEventListener('change', updateMobile);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const renderScene = !reduceMotion && inView && pageVisible && webGlAvailable;

  return (
    <div
      ref={hostRef}
      className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-surface shadow-glow md:min-h-[520px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.22),transparent_35%),linear-gradient(135deg,rgba(109,93,254,0.2),rgba(34,197,94,0.08))]" />
      <div className="absolute inset-0">
        {renderScene ? (
          <WebGlBoundary fallback={<OrbitFallback />}>
            <LearningOrbitScene
              active={pageVisible && inView}
              mobile={mobile}
              reduceMotion={reduceMotion}
            />
          </WebGlBoundary>
        ) : (
          <OrbitFallback />
        )}
      </div>
    </div>
  );
}

class WebGlBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function OrbitFallback() {
  return (
    <Image
      src="/hero/ai-roadmap-lab.webp"
      alt="Minh họa lộ trình học AI của MentorMind"
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover opacity-80"
    />
  );
}
