'use client';

import { useEffect, useRef } from 'react';

export function CursorHalo() {
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!haloRef.current) return;
    const halo = haloRef.current;

    const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = pointerMedia.matches;
    let visible = false;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    function syncEnabled() {
      enabled = pointerMedia.matches;
      halo.style.display = enabled ? 'block' : 'none';
      if (!enabled) {
        visible = false;
        halo.style.opacity = '0';
      }
    }

    function hide() {
      visible = false;
      halo.style.opacity = '0';
      halo.classList.remove('cursor-halo--active');
    }

    function move(event: PointerEvent) {
      if (!enabled || event.pointerType !== 'mouse') return;
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        visible = true;
        currentX = targetX;
        currentY = targetY;
        halo.style.opacity = '1';
      }
    }

    function press() {
      if (!enabled || !visible) return;
      halo.classList.add('cursor-halo--active');
    }

    function release() {
      halo.classList.remove('cursor-halo--active');
    }

    function render() {
      if (enabled && visible) {
        const ease = reduceMotionMedia.matches ? 1 : 0.28;
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        halo.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      frame = window.requestAnimationFrame(render);
    }

    syncEnabled();
    frame = window.requestAnimationFrame(render);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('blur', hide);
    document.documentElement.addEventListener('mouseleave', hide);
    pointerMedia.addEventListener('change', syncEnabled);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('blur', hide);
      document.documentElement.removeEventListener('mouseleave', hide);
      pointerMedia.removeEventListener('change', syncEnabled);
    };
  }, []);

  return <div ref={haloRef} className="cursor-halo" aria-hidden="true" />;
}
